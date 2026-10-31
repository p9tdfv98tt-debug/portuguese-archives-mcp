import https from "https";
import * as cheerio from "cheerio";

const agent = new https.Agent({ rejectUnauthorized: false });

export type NosPortuguesesSearchType = "persons" | "surnames" | "places" | "parishes";

export interface NosPortuguesesItem {
  id?: string;
  name: string;
  dates?: string;
  details?: string;
  type?: string;
  url: string;
}

export interface ParishBookRecord {
  bookNumber?: string;
  type: "Baptismos" | "Casamentos" | "Óbitos" | "Mistos" | "Outros";
  dateRange: string;
  imageCount?: number;
  entriesCount?: number;
  digitalViewerUrl?: string;
  notes?: string;
}

export interface ParishDetailResult {
  parishName: string;
  district?: string;
  municipality?: string;
  parish?: string;
  url: string;
  books: ParishBookRecord[];
}

export async function searchNosPortugueses(
  query: string,
  searchType: NosPortuguesesSearchType = "persons"
): Promise<{ query: string; type: string; totalFound: number; results: NosPortuguesesItem[] }> {
  let typeCode = "P";
  let path = "/pt/pesquisa";

  if (searchType === "surnames") {
    typeCode = "F";
  } else if (searchType === "places") {
    typeCode = "L";
  } else if (searchType === "parishes") {
    typeCode = "L";
    path = "/pt/paroquiais";
  }

  const url = `https://nosportugueses.pt${path}?s=${encodeURIComponent(query)}&t=${typeCode}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const $ = cheerio.load(data);
          const results: NosPortuguesesItem[] = [];

          if (path === "/pt/paroquiais") {
            $('a[href*="/pt/paroquiais/"]').each((_, el) => {
              const href = $(el).attr("href") || "";
              const text = $(el).text().trim();
              if (text && href !== "/pt/paroquiais" && !href.endsWith("#")) {
                const fullUrl = href.startsWith("http") ? href : `https://nosportugueses.pt${href}`;
                const matchId = href.match(/\/paroquiais\/([0-9]+)/);
                results.push({
                  id: matchId ? matchId[1] : undefined,
                  name: text,
                  type: "Parish / Civil Archive",
                  url: fullUrl
                });
              }
            });
          } else {
            $('a.name-item, a[href*="/pt/nome/"], a[href*="/pt/locais/"], a[href*="/pt/apelidos/"]').each((_, el) => {
              const href = $(el).attr("href") || "";
              const text = $(el).text().trim();
              if (text && !href.endsWith("/user") && !href.endsWith("/registo")) {
                const fullUrl = href.startsWith("http") ? href : `https://nosportugueses.pt${href}`;
                const matchId = href.match(/\/(?:nome|locais|apelidos)\/([0-9]+)/);
                
                // Extract dates like 14.03.1896 or c. 1850
                const dateMatch = text.match(/(?:c\.\s*)?(?:\d{1,2}\.\d{1,2}\.)?\d{4}/);
                const dates = dateMatch ? dateMatch[0] : undefined;

                results.push({
                  id: matchId ? matchId[1] : undefined,
                  name: text,
                  dates,
                  url: fullUrl
                });
              }
            });
          }

          // Deduplicate by URL
          const uniqueResults = Array.from(new Map(results.map((item) => [item.url, item])).values());

          resolve({
            query,
            type: searchType,
            totalFound: uniqueResults.length,
            results: uniqueResults
          });
        } catch (e: any) {
          reject(new Error(`Failed to parse Nos Portugueses HTML: ${e.message}`));
        }
      });
    }).on("error", reject);
  });
}

export async function getParishRecords(parishId: number | string, slug?: string): Promise<ParishDetailResult> {
  const urlPath = slug ? `/pt/paroquiais/${parishId}/${slug}` : `/pt/paroquiais/${parishId}`;
  const url = `https://nosportugueses.pt${urlPath}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const $ = cheerio.load(data);
          const pageTitle = $("title").text().replace(" | NÓS Portugueses", "").trim();
          
          const books: ParishBookRecord[] = [];
          let currentSection: ParishBookRecord["type"] = "Baptismos";

          $("h2, h3, table, tr").each((_, el) => {
            const tagName = el.tagName.toLowerCase();
            const text = $(el).text().trim();

            if (tagName === "h2" || tagName === "h3") {
              if (text.toLowerCase().includes("baptismo") || text.toLowerCase().includes("batismo")) {
                currentSection = "Baptismos";
              } else if (text.toLowerCase().includes("casamento")) {
                currentSection = "Casamentos";
              } else if (text.toLowerCase().includes("óbito") || text.toLowerCase().includes("obito")) {
                currentSection = "Óbitos";
              } else if (text.toLowerCase().includes("misto")) {
                currentSection = "Mistos";
              }
            }

            if (tagName === "tr") {
              const tds = $(el).find("td");
              if (tds.length >= 2) {
                const bookNumber = $(tds[0]).text().trim();
                const dateRange = $(tds[1]).text().trim();
                const imageCountText = tds.length > 2 ? $(tds[2]).text().trim().replace(".", "") : "0";
                const entriesCountText = tds.length > 3 ? $(tds[3]).text().trim().replace(".", "") : "0";
                const notes = tds.length > 5 ? $(tds[5]).text().trim() : undefined;

                const linkEl = $(el).find('a[href*="viewer"], a[href*="digitarq"], a[href*="pesquisa."]');
                const digitalViewerUrl = linkEl.attr("href");

                if (dateRange && (dateRange.includes("-") || /\d{4}/.test(dateRange))) {
                  books.push({
                    bookNumber: bookNumber || undefined,
                    type: currentSection,
                    dateRange,
                    imageCount: parseInt(imageCountText, 10) || 0,
                    entriesCount: parseInt(entriesCountText, 10) || 0,
                    digitalViewerUrl: digitalViewerUrl || undefined,
                    notes: notes || undefined
                  });
                }
              }
            }
          });

          resolve({
            parishName: pageTitle,
            url,
            books
          });
        } catch (e: any) {
          reject(new Error(`Failed to parse parish records page: ${e.message}`));
        }
      });
    }).on("error", reject);
  });
}
