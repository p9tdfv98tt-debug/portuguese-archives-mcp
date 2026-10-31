import https from "https";

export interface AzoresSearchOptions {
  query: string;
  island?: "Sao Miguel" | "Santa Maria" | "Terceira" | "Graciosa" | "Sao Jorge" | "Pico" | "Faial" | "Flores" | "Corvo" | string;
  archive?: "BPARPD" | "BPARAH" | "BPARJJG" | string;
  recordType?: "paroquiais" | "passaportes" | "notariais" | "all";
  page?: number;
  perPage?: number;
}

export interface AzoresSearchResult {
  query: string;
  portalUrl: string;
  directSearchUrl: string;
  regionalArchives: Array<{
    name: string;
    code: string;
    islands: string[];
    directSearchUrl: string;
  }>;
  relevantCollections: Array<{
    title: string;
    description: string;
    scope: string;
  }>;
}

export function searchAzoresArchives(options: AzoresSearchOptions): AzoresSearchResult {
  const q = encodeURIComponent(options.query.trim());
  const islandFilter = options.island ? `+${encodeURIComponent(options.island)}` : "";
  const typeFilter = options.recordType && options.recordType !== "all" ? `+${encodeURIComponent(options.recordType)}` : "";

  const fullQuery = `${q}${islandFilter}${typeFilter}`;
  const directSearchUrl = `https://arquivos.azores.gov.pt/descriptions/search?q=${fullQuery}`;

  return {
    query: options.query,
    portalUrl: "https://arquivos.azores.gov.pt/",
    directSearchUrl,
    regionalArchives: [
      {
        name: "Biblioteca Pública e Arquivo Regional de Ponta Delgada (BPARPD)",
        code: "BPARPD",
        islands: ["São Miguel", "Santa Maria"],
        directSearchUrl: `https://arquivos.azores.gov.pt/descriptions/search?q=${q}&archive=BPARPD`
      },
      {
        name: "Biblioteca Pública e Arquivo Regional de Angra do Heroísmo (BPARAH)",
        code: "BPARAH",
        islands: ["Terceira", "São Jorge", "Graciosa"],
        directSearchUrl: `https://arquivos.azores.gov.pt/descriptions/search?q=${q}&archive=BPARAH`
      },
      {
        name: "Biblioteca Pública e Arquivo Regional João José da Graça - Horta (BPARJJG)",
        code: "BPARJJG",
        islands: ["Faial", "Pico", "Flores", "Corvo"],
        directSearchUrl: `https://arquivos.azores.gov.pt/descriptions/search?q=${q}&archive=BPARJJG`
      }
    ],
    relevantCollections: [
      {
        title: "Registos Paroquiais dos Açores",
        description: "Batismos, Casamentos e Óbitos de todas as paróquias e curatos das 9 ilhas do arquipélago (século XVI a 1911).",
        scope: "Genealogia / Demografia Histórica"
      },
      {
        title: "Passaportes e Emigração Açoriana",
        description: "Processos e livros de registo de passaportes para emigração para os Estados Unidos (Califórnia, Massachusetts, Havai), Canadá e Brasil.",
        scope: "Fluxos Migratórios"
      },
      {
        title: "Cartórios Notariais e Judiciais",
        description: "Escrituras, testamentos, inventários orfanológicos e partilhas de bens insulares.",
        scope: "Património e Sucessões"
      }
    ]
  };
}

export function getAzoresDescriptionUrl(id: number | string): string {
  return `https://arquivos.azores.gov.pt/descriptions/details?id=${id}`;
}
