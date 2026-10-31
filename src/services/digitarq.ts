import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export interface DigitarqSearchParams {
  query: string;
  archiveCode?: string;
  dateInitial?: string;
  dateFinal?: string;
  fromIndex?: number;
  max?: number;
}

export interface DigitarqDocResult {
  id: string;
  referenceCode?: string;
  archiveCode?: string;
  title?: string;
  dateInitial?: string;
  dateFinal?: string;
  descriptionLevel?: string;
  presentQuota?: string;
  filesCount?: number;
  hasDigitalRepresentation?: boolean;
  link: string;
}

export interface DigitarqSearchResponse {
  totalResults?: number;
  fromIndex: number;
  max: number;
  results: DigitarqDocResult[];
}

export async function searchDigitarq(params: DigitarqSearchParams): Promise<DigitarqSearchResponse> {
  const fromIndex = params.fromIndex ?? 0;
  const max = params.max ?? 10;
  
  const queryParams = new URLSearchParams({
    query: params.query,
    sortField: "relevance",
    sortOrder: "",
    fromIndex: String(fromIndex),
    max: String(max)
  });

  if (params.archiveCode) {
    queryParams.append("archiveCode", params.archiveCode);
  }
  if (params.dateInitial) {
    queryParams.append("dateInitial", params.dateInitial);
  }
  if (params.dateFinal) {
    queryParams.append("dateFinal", params.dateFinal);
  }

  const url = `https://digitarq.arquivos.pt/api/docs/search?${queryParams.toString()}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Accept": "application/json, text/plain, */*"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`DigiArq search returned status ${res.statusCode}: ${data}`));
        }
        try {
          const json = JSON.parse(data);
          const rawResults = json.results || [];
          const results: DigitarqDocResult[] = rawResults.map((r: any) => {
            const titleObj = r.titles && r.titles.length > 0 ? r.titles[0] : null;
            return {
              id: r.id,
              referenceCode: r.referenceCode?.value || r.value,
              archiveCode: r.archiveCode,
              title: titleObj?.value || r.value || "Sem título",
              dateInitial: r.dateInitial?.value || r.dates?.production?.dateInitial?.value || null,
              dateFinal: r.dateFinal?.value || r.dates?.production?.dateFinal?.value || null,
              descriptionLevel: r.descriptionLevel?.value,
              presentQuota: r.presentQuota?.value,
              filesCount: r.filesCount ?? 0,
              hasDigitalRepresentation: (r.filesCount ?? 0) > 0,
              link: `https://digitarq.arquivos.pt/search?query=${encodeURIComponent(r.referenceCode?.value || r.id)}`
            };
          });

          resolve({
            totalResults: json.total ?? json.totalResults ?? rawResults.length,
            fromIndex,
            max,
            results
          });
        } catch (e: any) {
          reject(new Error(`Failed to parse DigiArq response: ${e.message}`));
        }
      });
    }).on("error", reject);
  });
}

export async function getDigitarqDigitalObjects(docId: string): Promise<any> {
  const url = `https://digitarq.arquivos.pt/api/rdigital/${docId}`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Accept": "application/json, text/plain, */*"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          return resolve({
            id: docId,
            message: `No digital objects found or status ${res.statusCode}`,
            raw: data
          });
        }
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ id: docId, raw: data });
        }
      });
    }).on("error", reject);
  });
}
