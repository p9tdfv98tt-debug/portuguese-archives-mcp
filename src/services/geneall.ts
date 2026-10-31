import https from "https";
import * as cheerio from "cheerio";

const agent = new https.Agent({ rejectUnauthorized: false });

export interface GeneallPersonResult {
  name: string;
  url: string;
  details?: string;
  birthDeath?: string;
  title?: string;
  country?: string;
}

export interface GeneallSearchResponse {
  query: string;
  totalFound: number;
  results: GeneallPersonResult[];
  directUrl: string;
}

export async function searchGeneall(options: {
  query: string;
  country?: string; // default "P" for Portugal
}): Promise<GeneallSearchResponse> {
  const country = options.country || "P";
  const searchUrl = `https://geneall.net/pt/procura/?q=${encodeURIComponent(options.query)}&b=${country}`;

  return new Promise((resolve) => {
    const req = https.get(
      searchUrl,
      {
        agent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      },
      (res) => {
        let html = "";
        res.on("data", (chunk) => (html += chunk));
        res.on("end", () => {
          try {
            const $ = cheerio.load(html);
            const results: GeneallPersonResult[] = [];

            $("table tr, .person-result, li, td").each((_, el) => {
              const link = $(el).find("a[href*='/pt/nome/']").first();
              if (link.length > 0) {
                const name = link.text().trim();
                const href = link.attr("href") || "";
                const fullUrl = href.startsWith("http") ? href : `https://geneall.net${href}`;
                const text = $(el).text().replace(/\s+/g, " ").trim();
                
                const metaMatch = text.match(/\((.*?)\)/);
                const birthDeath = metaMatch ? metaMatch[1] : undefined;

                if (name && name.length > 2 && !results.some((r) => r.url === fullUrl)) {
                  results.push({
                    name,
                    url: fullUrl,
                    details: text,
                    birthDeath,
                    country: country === "P" ? "Portugal" : country,
                  });
                }
              }
            });

            $("a[href*='/pt/familias/'], a[href*='/pt/titulos/']").each((_, el) => {
              const name = $(el).text().trim();
              const href = $(el).attr("href") || "";
              const fullUrl = href.startsWith("http") ? href : `https://geneall.net${href}`;
              if (name && results.length < 30 && !results.some((r) => r.url === fullUrl)) {
                results.push({
                  name: `[Família/Título] ${name}`,
                  url: fullUrl,
                  details: $(el).parent().text().replace(/\s+/g, " ").trim(),
                  country: "Portugal",
                });
              }
            });

            resolve({
              query: options.query,
              totalFound: results.length,
              results: results.slice(0, 25),
              directUrl: searchUrl,
            });
          } catch (err: any) {
            resolve({
              query: options.query,
              totalFound: 0,
              results: [],
              directUrl: searchUrl,
            });
          }
        });
      }
    );

    req.on("error", () => {
      resolve({
        query: options.query,
        totalFound: 0,
        results: [],
        directUrl: searchUrl,
      });
    });

    req.setTimeout(12000, () => {
      req.destroy();
      resolve({
        query: options.query,
        totalFound: 0,
        results: [],
        directUrl: searchUrl,
      });
    });
  });
}

export async function getGeneallPerson(url: string): Promise<{
  name: string;
  url: string;
  parents: string[];
  spouses: string[];
  children: string[];
  biography: string;
}> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        agent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        let html = "";
        res.on("data", (chunk) => (html += chunk));
        res.on("end", () => {
          try {
            const $ = cheerio.load(html);
            const name = $("h1").first().text().trim() || $("title").text().trim();
            const biography = $(".bio, .biography, #content").first().text().replace(/\s+/g, " ").trim().substring(0, 1500);

            const parents: string[] = [];
            const spouses: string[] = [];
            const children: string[] = [];

            $("a[href*='/pt/nome/']").each((_, el) => {
              const t = $(el).text().trim();
              const pText = $(el).parent().text().toLowerCase();
              if (t && t !== name) {
                if (pText.includes("pai") || pText.includes("mãe")) {
                  if (!parents.includes(t)) parents.push(t);
                } else if (pText.includes("casou") || pText.includes("c.c.")) {
                  if (!spouses.includes(t)) spouses.push(t);
                } else if (pText.includes("filh")) {
                  if (!children.includes(t)) children.push(t);
                }
              }
            });

            resolve({
              name,
              url,
              parents,
              spouses,
              children,
              biography,
            });
          } catch (e: any) {
            resolve({
              name: "",
              url,
              parents: [],
              spouses: [],
              children: [],
              biography: "",
            });
          }
        });
      }
    );

    req.on("error", () => {
      resolve({
        name: "",
        url,
        parents: [],
        spouses: [],
        children: [],
        biography: "",
      });
    });

    req.setTimeout(12000, () => {
      req.destroy();
      resolve({
        name: "",
        url,
        parents: [],
        spouses: [],
        children: [],
        biography: "",
      });
    });
  });
}
