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

// Common municipality and parish code dictionary for instant high-speed resolution
const parishCodeMap: Record<string, { code: string; name: string; mun: string; dist: string }> = {
  "pederneira": { code: "nzr02", name: "Pederneira (Nossa Senhora da Pederneira)", mun: "Nazaré", dist: "Leiria" },
  "nazare": { code: "nzr02", name: "Nazaré (Pederneira)", mun: "Nazaré", dist: "Leiria" },
  "camacha": { code: "scr03", name: "Camacha", mun: "Santa Cruz", dist: "Madeira" },
  "porto da cruz": { code: "mch05", name: "Porto da Cruz", mun: "Machico", dist: "Madeira" },
  "machico": { code: "mch01", name: "Machico", mun: "Machico", dist: "Madeira" },
  "santo antonio da serra": { code: "mch05", name: "Santo António da Serra", mun: "Machico", dist: "Madeira" },
  "santa maria maior": { code: "fch04", name: "Santa Maria Maior (Funchal)", mun: "Funchal", dist: "Madeira" },
  "se funchal": { code: "fch10", name: "Sé (Funchal)", mun: "Funchal", dist: "Madeira" },
  "monte": { code: "fch02", name: "Monte (Funchal)", mun: "Funchal", dist: "Madeira" },
  "alcobaca": { code: "acb01", name: "Alcobaça", mun: "Alcobaça", dist: "Leiria" },
  "peniche": { code: "pnc01", name: "Peniche", mun: "Peniche", dist: "Leiria" },
};

export function resolveTomboUrl(query: TomboParishQuery): string {
  const normParish = (query.parish || "").toLowerCase().trim();
  const normMun = (query.municipality || "").toLowerCase().trim();

  for (const [key, val] of Object.entries(parishCodeMap)) {
    if (normParish.includes(key) || normMun.includes(key)) {
      return `https://tombo.pt/f/${val.code}`;
    }
  }

  if (query.parish) {
    const slug = query.parish.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    return `https://tombo.pt/f/${slug}`;
  }

  if (query.municipality) {
    const slug = query.municipality.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    return `https://tombo.pt/m/${slug}`;
  }

  if (query.district) {
    const slug = query.district.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    return `https://tombo.pt/d/${slug}`;
  }

  return "https://tombo.pt/";
}

export async function getTomboParishBooks(query: TomboParishQuery): Promise<TomboParishResult> {
  const tomboUrl = resolveTomboUrl(query);

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

          if (href.includes("digitarq") || href.includes("arquivos.pt") || href.includes("familysearch")) {
            let type = "Geral";
            if (/batismo|baptismo|bap/i.test(text) || href.includes("PNZR02/001") || href.includes("PNZR02/004")) type = "Batismos";
            else if (/casamento|matrim/i.test(text) || href.includes("002")) type = "Casamentos";
            else if (/obito|ob/i.test(text) || href.includes("003")) type = "Óbitos";
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
