import { searchFamilySearch } from "./familysearch.js";
import https from "https";

export interface GlobalSearchPersonQuery {
  givenName?: string;
  surname?: string;
  birthYear?: number;
  birthPlace?: string;
  deathYear?: number;
  deathPlace?: string;
  marriageYear?: number;
  marriagePlace?: string;
  fatherGivenName?: string;
  fatherSurname?: string;
  motherGivenName?: string;
  motherSurname?: string;
  spouseGivenName?: string;
  spouseSurname?: string;
}

export interface PlatformSearchResult {
  platform: string;
  searchUrl: string;
  description: string;
  category: "Major Database" | "Specialized Archive" | "Search Engine";
}

export interface GlobalGenealogyMultiSearchResponse {
  query: GlobalSearchPersonQuery;
  platforms: {
    familySearch: PlatformSearchResult;
    ancestry: PlatformSearchResult;
    myHeritage: PlatformSearchResult;
    findmypast: PlatformSearchResult;
    geneanet: PlatformSearchResult;
    storied: PlatformSearchResult;
    filae: PlatformSearchResult;
    google: PlatformSearchResult;
  };
}

export function buildAncestryQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const p = new URLSearchParams();
  if (q.givenName) p.append("name", q.givenName);
  if (q.surname) p.append("name_x", "1_1");
  if (q.surname) p.append("lastName", q.surname);
  if (q.birthYear) p.append("birth", String(q.birthYear));
  if (q.birthPlace) p.append("birth_x", "1_1");
  if (q.birthPlace) p.append("birth_y", `${q.birthPlace}, Portugal`);
  if (q.deathYear) p.append("death", String(q.deathYear));
  if (q.fatherGivenName || q.fatherSurname) {
    p.append("father", [q.fatherGivenName, q.fatherSurname].filter(Boolean).join(" "));
  }
  if (q.motherGivenName || q.motherSurname) {
    p.append("mother", [q.motherGivenName, q.motherSurname].filter(Boolean).join(" "));
  }
  if (q.spouseGivenName || q.spouseSurname) {
    p.append("spouse", [q.spouseGivenName, q.spouseSurname].filter(Boolean).join(" "));
  }
  p.append("location", "Portugal");

  return {
    platform: "Ancestry",
    searchUrl: `https://www.ancestry.com/search/?${p.toString()}`,
    description: "Pesquisa em mais de 30 mil milhões de registos históricos, árvores mundiais e coleções de Portugal no Ancestry.",
    category: "Major Database",
  };
}

export function buildMyHeritageQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const p = new URLSearchParams();
  p.append("action", "person");
  p.append("exactSearch", "0");
  if (q.givenName) p.append("fn", q.givenName);
  if (q.surname) p.append("ln", q.surname);
  if (q.birthYear) {
    p.append("qevents1", "Event");
    p.append("qevent1_event1", `Event=Event+type=Birth+date=${q.birthYear}+place=${encodeURIComponent(q.birthPlace || "Portugal")}`);
  }
  if (q.fatherGivenName || q.fatherSurname) {
    p.append("qrelatives1", "Relative");
    p.append("qrelative1_relative1", `Relative=Relative+type=Father+fn=${encodeURIComponent(q.fatherGivenName || "")}+ln=${encodeURIComponent(q.fatherSurname || "")}`);
  }
  if (q.motherGivenName || q.motherSurname) {
    p.append("qrelatives2", "Relative");
    p.append("qrelative2_relative2", `Relative=Relative+type=Mother+fn=${encodeURIComponent(q.motherGivenName || "")}+ln=${encodeURIComponent(q.motherSurname || "")}`);
  }
  if (q.spouseGivenName || q.spouseSurname) {
    p.append("qrelatives3", "Relative");
    p.append("qrelative3_relative3", `Relative=Relative+type=Spouse+fn=${encodeURIComponent(q.spouseGivenName || "")}+ln=${encodeURIComponent(q.spouseSurname || "")}`);
  }

  return {
    platform: "MyHeritage",
    searchUrl: `https://www.myheritage.com.pt/research?formId=master&formMode=1&${p.toString()}`,
    description: "Pesquisa na base de dados global do MyHeritage, com correspondências automáticas (Smart Matches) e árvores genealógicas portuguesas e europeias.",
    category: "Major Database",
  };
}

export function buildFindmypastQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const p = new URLSearchParams();
  if (q.givenName) p.append("firstname", q.givenName);
  if (q.surname) p.append("lastname", q.surname);
  if (q.birthYear) p.append("yearofbirth", String(q.birthYear));
  if (q.birthYear) p.append("yearofbirth_offset", "5");
  if (q.birthPlace) p.append("keywords", `${q.birthPlace} Portugal`);
  else p.append("keywords", "Portugal");

  return {
    platform: "Findmypast",
    searchUrl: `https://www.findmypast.com/search/world-records?${p.toString()}`,
    description: "Pesquisa no Findmypast em registos de emigração, viagens de passageiros, censos mundiais e registos paroquiais.",
    category: "Major Database",
  };
}

export function buildGeneanetQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const p = new URLSearchParams();
  if (q.surname) p.append("nom", q.surname);
  if (q.givenName) p.append("prenom", q.givenName);
  if (q.birthPlace) p.append("place", `${q.birthPlace}, Portugal`);
  else p.append("place", "Portugal");
  if (q.birthYear) p.append("from", String(q.birthYear - 5));
  if (q.birthYear) p.append("to", String(q.birthYear + 5));
  if (q.spouseSurname) p.append("conjoint", q.spouseSurname);
  if (q.fatherSurname) p.append("nom_pere", q.fatherSurname);
  if (q.motherSurname) p.append("nom_mere", q.motherSurname);

  return {
    platform: "Geneanet",
    searchUrl: `https://pt.geneanet.org/pesquisa/?${p.toString()}`,
    description: "Maior comunidade genealógica da Europa (Geneanet/Ancestry), com milhões de árvores partilhadas, transcrições colaborativas e índices europeus.",
    category: "Major Database",
  };
}

export function buildStoriedQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const p = new URLSearchParams();
  const fullName = [q.givenName, q.surname].filter(Boolean).join(" ");
  if (fullName) p.append("query", fullName);
  if (q.birthPlace) p.append("location", `${q.birthPlace}, Portugal`);
  if (q.birthYear) p.append("year", String(q.birthYear));

  return {
    platform: "Storied",
    searchUrl: `https://storied.com/search?q=${encodeURIComponent(fullName || "Portugal")}&location=${encodeURIComponent(q.birthPlace ? q.birthPlace + ", Portugal" : "Portugal")}`,
    description: "Plataforma Storied de narrativas familiares, jornais históricos e histórias biográficas indexadas.",
    category: "Specialized Archive",
  };
}

export function buildFilaeQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const fullName = [q.givenName, q.surname].filter(Boolean).join(" ");
  const p = new URLSearchParams();
  if (q.surname) p.append("nom", q.surname);
  if (q.givenName) p.append("prenom", q.givenName);
  if (q.birthPlace) p.append("lieu", `${q.birthPlace}, Portugal`);
  if (q.birthYear) p.append("annee", String(q.birthYear));

  return {
    platform: "Filae",
    searchUrl: `https://www.filae.com/v4/forums/recherche?q=${encodeURIComponent(fullName || "")}`,
    description: "Portal Filae (grupo MyHeritage) especializado em registos civis, paroquiais e arquivos genealógicos europeus.",
    category: "Specialized Archive",
  };
}

export function buildGoogleGenealogyQuery(q: GlobalSearchPersonQuery): PlatformSearchResult {
  const fullName = [q.givenName, q.surname].filter(Boolean).join(" ");
  const terms: string[] = [];
  if (fullName) terms.push(`"${fullName}"`);
  if (q.birthPlace) terms.push(`"${q.birthPlace}"`);
  if (q.spouseGivenName || q.spouseSurname) {
    terms.push(`"${[q.spouseGivenName, q.spouseSurname].filter(Boolean).join(" ")}"`);
  }
  if (q.fatherGivenName || q.fatherSurname) {
    terms.push(`"${[q.fatherGivenName, q.fatherSurname].filter(Boolean).join(" ")}"`);
  }

  // Add specialized Portuguese genealogical dorking
  const sites = "(site:digitarq.arquivos.pt OR site:arquivo-abm.madeira.gov.pt OR site:geneall.net OR site:nosportugueses.pt OR site:familysearch.org OR site:geneanet.org)";
  const finalSearch = `${terms.join(" ")} ${sites}`.trim();

  return {
    platform: "Google (Pesquisa Avançada Arquivística)",
    searchUrl: `https://www.google.com/search?q=${encodeURIComponent(finalSearch)}`,
    description: "Pesquisa avançada (Google Dorking) direcionada especificamente para todos os arquivos e repositórios genealógicos portugueses.",
    category: "Search Engine",
  };
}

export function searchAllGlobalPlatforms(q: GlobalSearchPersonQuery): GlobalGenealogyMultiSearchResponse {
  
  const fsRes = searchFamilySearch(q);

  return {
    query: q,
    platforms: {
      familySearch: {
        platform: "FamilySearch",
        searchUrl: fsRes.searchUrl,
        description: "Maior base de dados genealógica do mundo com microfilmes paroquiais e civis de Portugal digitalizados.",
        category: "Major Database",
      },
      ancestry: buildAncestryQuery(q),
      myHeritage: buildMyHeritageQuery(q),
      findmypast: buildFindmypastQuery(q),
      geneanet: buildGeneanetQuery(q),
      storied: buildStoriedQuery(q),
      filae: buildFilaeQuery(q),
      google: buildGoogleGenealogyQuery(q),
    },
  };
}
