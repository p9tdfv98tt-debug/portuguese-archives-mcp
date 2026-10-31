import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export interface ANTTArticleResult {
  id: number;
  type: "post" | "page";
  title: string;
  excerpt?: string;
  link: string;
  date?: string;
}

export interface ANTTSearchResponse {
  query: string;
  count: number;
  results: ANTTArticleResult[];
}

function cleanHtml(rawHtml: string): string {
  return rawHtml
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&")
    .trim();
}

async function fetchWpEndpoint(endpoint: "posts" | "pages", query: string, perPage: number = 5): Promise<ANTTArticleResult[]> {
  const url = `https://antt.dglab.gov.pt/wp-json/wp/v2/${endpoint}?search=${encodeURIComponent(query)}&per_page=${perPage}`;

  return new Promise((resolve) => {
    https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Accept": "application/json"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          return resolve([]);
        }
        try {
          const items = JSON.parse(data);
          if (!Array.isArray(items)) return resolve([]);
          const formatted: ANTTArticleResult[] = items.map((item: any) => ({
            id: item.id,
            type: endpoint === "posts" ? "post" : "page",
            title: cleanHtml(item.title?.rendered || "Sem título"),
            excerpt: cleanHtml(item.excerpt?.rendered || ""),
            link: item.link,
            date: item.date ? item.date.split("T")[0] : undefined
          }));
          resolve(formatted);
        } catch {
          resolve([]);
        }
      });
    }).on("error", () => resolve([]));
  });
}

export async function searchANTT(
  query: string,
  type: "posts" | "pages" | "both" = "both",
  perPage: number = 5
): Promise<ANTTSearchResponse> {
  const results: ANTTArticleResult[] = [];

  if (type === "posts" || type === "both") {
    const posts = await fetchWpEndpoint("posts", query, perPage);
    results.push(...posts);
  }

  if (type === "pages" || type === "both") {
    const pages = await fetchWpEndpoint("pages", query, perPage);
    results.push(...pages);
  }

  return {
    query,
    count: results.length,
    results
  };
}

export async function getANTTArticle(id: number, type: "posts" | "pages" = "posts"): Promise<any> {
  const url = `https://antt.dglab.gov.pt/wp-json/wp/v2/${type}/${id}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Accept": "application/json"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`ANTT article request failed with status ${res.statusCode}`));
        }
        try {
          const item = JSON.parse(data);
          resolve({
            id: item.id,
            title: cleanHtml(item.title?.rendered || ""),
            content: cleanHtml(item.content?.rendered || ""),
            link: item.link,
            date: item.date
          });
        } catch (e: any) {
          reject(new Error(`Failed to parse ANTT article JSON: ${e.message}`));
        }
      });
    }).on("error", reject);
  });
}
