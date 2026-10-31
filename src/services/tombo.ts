import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export interface TomboParishQuery {
  district?: string;
  municipality?: string;
  parish?: string;
  recordType?: "batismos" | "casamentos" | "obitos" | "passaportes" | "all";
  year?: number;
}

export interface TomboBookLink {
  title: string;
  type: string;
  yearRange: string;
  archiveLink: string;
}

export interface TomboParishResult {
  parishName: string;
  municipality: string;
  district: string;
  tomboUrl: string;
  matchedBooks?: TomboBookLink[];
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

function slugify(text: string): string {
  return normalize(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fetchText(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve) => {
    https
      .get(url, { agent, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
      })
      .on("error", () => resolve({ status: 0, body: "" }));
  });
}

export function tomboSearchUrl(text: string): string {
  return `https://tombo.pt/search?keys=${encodeURIComponent(text)}`;
}

/**
 * Find a parish page on Tombo.pt. Parish pages use internal codes (e.g. /f/scr02), so the
 * parish is looked up with Tombo's own search and each candidate page is checked by title,
 * and by municipality when one is given.
 */
async function findParishPage(parish: string, municipality?: string): Promise<string | undefined> {
  const keys = municipality ? `${parish} ${municipality}` : parish;
  let { body } = await fetchText(tomboSearchUrl(keys));
  let codes = [...new Set([...body.matchAll(/href="(?:https:\/\/tombo\.pt)?\/f\/([a-z0-9]+)"/g)].map((m) => m[1]))];
  if (codes.length === 0 && municipality) {
    ({ body } = await fetchText(tomboSearchUrl(parish)));
    codes = [...new Set([...body.matchAll(/href="(?:https:\/\/tombo\.pt)?\/f\/([a-z0-9]+)"/g)].map((m) => m[1]))];
  }

  const wanted = normalize(parish);
  const town = municipality ? normalize(municipality) : undefined;
  let fallback: string | undefined;
  for (const code of codes.slice(0, 8)) {
    const url = `https://tombo.pt/f/${code}`;
    const page = await fetchText(url);
    const title = normalize(page.body.match(/<title>([^<|]*)/i)?.[1] || "");
    if (!title) continue;
    const titleMatches = title === wanted || title.includes(wanted) || wanted.includes(title);
    if (titleMatches && (!town || normalize(page.body).includes(town))) return url;
    // Tombo files some town-centre parishes (e.g. Santa Maria Maior, Chaves) under the town's name
    if (titleMatches || title === town) fallback ??= url;
  }
  return fallback;
}

export async function resolveTomboUrl(query: TomboParishQuery): Promise<string> {
  if (query.parish) {
    const page = await findParishPage(query.parish, query.municipality);
    if (page) return page;
  }

  if (query.district) {
    const url = `https://tombo.pt/d/${slugify(query.district)}`;
    if ((await fetchText(url)).status === 200) return url;
  }

  const text = [query.parish, query.municipality, query.district].filter(Boolean).join(" ");
  return text ? tomboSearchUrl(text) : "https://tombo.pt/";
}

export async function getTomboParishBooks(query: TomboParishQuery): Promise<TomboParishResult> {
  const tomboUrl = await resolveTomboUrl(query);

  return new Promise((resolve) => {
    https.get(tomboUrl, { agent, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        const books: TomboBookLink[] = [];

        // Parse link elements with regex
        const linkRegex = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
        let match;
        while ((match = linkRegex.exec(data)) !== null) {
          const href = match[1];
          const text = match[2].replace(/<[^>]+>/g, "").trim();

          const isArchiveLink = /digitarq|arquivos\.pt|dglab\.gov\.pt|arquivo-abm\.madeira|azores\.gov\.pt|familysearch/.test(href);
          if (isArchiveLink && text && !/^https?:/.test(text)) {
            let type = "Geral";
            if (/batismo|baptismo|bap/i.test(text)) type = "Batismos";
            else if (/casamento|matrim/i.test(text)) type = "Casamentos";
            else if (/[oó]bito/i.test(text)) type = "Óbitos";
            else if (/passaporte/i.test(text)) type = "Passaportes";

            if (query.year && !text.includes(String(query.year))) {
              // Skip if year doesn't match and year filter was requested
              continue;
            }

            books.push({
              title: text || "Livro Paroquial",
              type,
              yearRange: text,
              archiveLink: href,
            });
          }
        }

        resolve({
          parishName: query.parish || "Paróquia Consultada",
          municipality: query.municipality || "N/A",
          district: query.district || "N/A",
          tomboUrl,
          matchedBooks: books.slice(0, 30),
        });
      });
    }).on("error", () => {
      resolve({
        parishName: query.parish || "",
        municipality: query.municipality || "",
        district: query.district || "",
        tomboUrl,
        matchedBooks: [],
      });
    });
  });
}
