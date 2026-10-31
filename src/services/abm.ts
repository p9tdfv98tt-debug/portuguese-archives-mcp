import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export interface ABMSearchParams {
  query: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  isDescending?: boolean;
}

export interface ABMItemResult {
  id: number;
  completeUnitId?: string;
  unitTitle: string;
  unitDateInitial?: string;
  unitDateFinal?: string;
  descriptionLevel?: string;
  repository?: string;
  scopeContent?: string;
  hasDigitalRepresentation?: boolean;
  hasPublishedFiles?: boolean;
  link: string;
  viewerLink?: string;
}

export interface ABMSearchResponse {
  page: number;
  perPage: number;
  totalItems?: number;
  items: ABMItemResult[];
}

export async function searchABM(params: ABMSearchParams): Promise<ABMSearchResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;
  const sortField = params.sortField ?? "Rank";
  const isDescending = params.isDescending ?? false;

  const queryParams = new URLSearchParams({
    "filter.*.ContainsAllWords": params.query,
    isDescending: String(isDescending),
    page: String(page),
    perPage: String(perPage),
    sortField
  });

  const url = `https://arquivo-abm.madeira.gov.pt/api/descriptions/search?${queryParams.toString()}`;

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
          return reject(new Error(`ABM Madeira search returned status ${res.statusCode}: ${data}`));
        }
        try {
          const json = JSON.parse(data);
          const rawItems = json.Items || json.items || [];
          const items: ABMItemResult[] = rawItems.map((item: any) => ({
            id: item.ID || item.id,
            completeUnitId: item.CompleteUnitId || item.completeUnitId,
            unitTitle: item.UnitTitle || item.unitTitle || "Sem título",
            unitDateInitial: item.UnitDateInitial || item.unitDateInitial,
            unitDateFinal: item.UnitDateFinal || item.unitDateFinal,
            descriptionLevel: item.DescriptionLevel || item.descriptionLevel,
            repository: item.Repository || item.repository,
            scopeContent: item.ScopeContent || item.scopeContent,
            hasDigitalRepresentation: item.HasDigitalRepresentation ?? false,
            hasPublishedFiles: item.HasPublishedFiles ?? false,
            link: `https://arquivo-abm.madeira.gov.pt/descriptions/${item.ID || item.id}`,
            viewerLink: item.HasDigitalRepresentation ? `https://arquivo-abm.madeira.gov.pt/viewer/descriptions/${item.ID || item.id}` : undefined
          }));

          resolve({
            page,
            perPage,
            totalItems: json.TotalItems || json.totalItems || rawItems.length,
            items
          });
        } catch (e: any) {
          reject(new Error(`Failed to parse ABM Madeira response: ${e.message}`));
        }
      });
    }).on("error", reject);
  });
}

export async function getABMDescription(id: number | string): Promise<any> {
  const url = `https://arquivo-abm.madeira.gov.pt/api/descriptions/${id}`;

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
          return reject(new Error(`ABM Madeira description request failed with status ${res.statusCode}`));
        }
        try {
          const json = JSON.parse(data);
          resolve({
            id: json.ID || json.id || id,
            completeUnitId: json.CompleteUnitId,
            unitTitle: json.UnitTitle,
            unitDateInitial: json.UnitDateInitial,
            unitDateFinal: json.UnitDateFinal,
            descriptionLevel: json.DescriptionLevel,
            repository: json.Repository,
            scopeContent: json.ScopeContent,
            custodHist: json.CustodHist,
            author: json.Author,
            dimensions: json.Dimensions,
            langMaterial: json.LangMaterial,
            hasDigitalRepresentation: json.HasDigitalRepresentation,
            hasPublishedFiles: json.HasPublishedFiles,
            directLink: `https://arquivo-abm.madeira.gov.pt/descriptions/${id}`,
            viewerLink: json.HasDigitalRepresentation ? `https://arquivo-abm.madeira.gov.pt/viewer/descriptions/${id}` : undefined,
            raw: json
          });
        } catch (e: any) {
          reject(new Error(`Failed to parse ABM description JSON: ${e.message}`));
        }
      });
    }).on("error", reject);
  });
}
