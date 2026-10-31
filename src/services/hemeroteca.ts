import https from "https";

export interface HemerotecaSearchQuery {
  query: string;
  publication?: string;
  year?: number;
  max?: number;
}

export interface HemerotecaSearchResult {
  query: string;
  hemerotecaBaseUrl: string;
  directCollectionLinks: Record<string, string>;
  searchUrls: {
    catalogSearch: string;
    googleDorkSearch: string;
  };
  keyPublicationsAvailable: Array<{
    title: string;
    description: string;
    directUrl: string;
    relevance: string;
  }>;
}

export function searchHemerotecaDigital(options: HemerotecaSearchQuery): HemerotecaSearchResult {
  const q = encodeURIComponent(options.query);
  const pub = options.publication ? encodeURIComponent(options.publication) : "";

  const googleDork = encodeURIComponent(`site:hemerotecadigital.cm-lisboa.pt "${options.query}" ${options.publication || ""} ${options.year || ""}`.trim());

  return {
    query: options.query,
    hemerotecaBaseUrl: "https://hemerotecadigital.cm-lisboa.pt/",
    directCollectionLinks: {
      "O Século": "https://hemerotecadigital.cm-lisboa.pt/OBRAS/OSECULO/OSECULO.htm",
      "Diário de Lisboa": "https://hemerotecadigital.cm-lisboa.pt/OBRAS/DiariodeLisboa/DiariodeLisboa.htm",
      "Ilustração Portugueza": "https://hemerotecadigital.cm-lisboa.pt/OBRAS/IlustracaoPort/IlustracaoPort.htm",
      "Gazeta dos Caminhos de Ferro": "https://hemerotecadigital.cm-lisboa.pt/OBRAS/GazetaCF/GazetaCF.htm",
      "Revista Municipal de Lisboa": "https://hemerotecadigital.cm-lisboa.pt/OBRAS/RevMunicipal/RevMunicipal.htm"
    },
    searchUrls: {
      catalogSearch: `https://hemerotecadigital.cm-lisboa.pt/Pesquisa/Pesquisa.htm?q=${q}`,
      googleDorkSearch: `https://www.google.com/search?q=${googleDork}`
    },
    keyPublicationsAvailable: [
      {
        title: "O Século & O Século Ilustrado",
        description: "Jornal diário de referência da Sociedade Nacional de Tipografia.",
        directUrl: "https://hemerotecadigital.cm-lisboa.pt/OBRAS/OSECULO/OSECULO.htm",
        relevance: "Notícias nacionais, fotojornalismo e necrologias"
      },
      {
        title: "Diário de Lisboa (1921-1990)",
        description: "Jornal da tarde vespertino de Lisboa com grande cobertura de eventos sociais e da vida da capital.",
        directUrl: "https://hemerotecadigital.cm-lisboa.pt/OBRAS/DiariodeLisboa/DiariodeLisboa.htm",
        relevance: "Anúncios, reportagens locais, casamentos e óbitos"
      },
      {
        title: "Ilustração Portugueza (1903-1924)",
        description: "Revista semanal ilustrada do jornal O Século.",
        directUrl: "https://hemerotecadigital.cm-lisboa.pt/OBRAS/IlustracaoPort/IlustracaoPort.htm",
        relevance: "Fotografias de época, figuras públicas e acontecimentos sociais"
      }
    ]
  };
}
