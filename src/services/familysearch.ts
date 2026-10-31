export interface FamilySearchRecordQuery {
  givenName?: string;
  surname?: string;
  fatherGivenName?: string;
  fatherSurname?: string;
  motherGivenName?: string;
  motherSurname?: string;
  spouseGivenName?: string;
  spouseSurname?: string;
  birthPlace?: string;
  birthYear?: number;
  marriagePlace?: string;
  marriageYear?: number;
  deathPlace?: string;
  deathYear?: number;
  collectionType?: "parish" | "civil" | "passports" | "all";
}

export interface FamilySearchResponse {
  query: FamilySearchRecordQuery;
  searchUrl: string;
  catalogUrl: string;
  directCollectionLinks: Array<{
    title: string;
    collectionId: string;
    url: string;
    description: string;
  }>;
  suggestedAction: string;
}

export const PORTUGAL_COLLECTIONS = [
  {
    title: "Portugal, Catholic Parish Records (1530-1930)",
    collectionId: "1927341",
    url: "https://www.familysearch.org/search/collection/1927341",
    description: "Milhões de registos paroquiais de batismos, casamentos e óbitos de todas as dioceses de Portugal continental e ilhas.",
  },
  {
    title: "Portugal, Madeira, Catholic Parish Records (1538-1957)",
    collectionId: "1927342",
    url: "https://www.familysearch.org/search/collection/1927342",
    description: "Coleção integral de assentos de batismo, matrimónio e óbito do Arquivo Regional da Madeira.",
  },
  {
    title: "Portugal, Coimbra, Catholic Parish Records (1459-1968)",
    collectionId: "1927340",
    url: "https://www.familysearch.org/search/collection/1927340",
    description: "Registos paroquiais e dispensas do distrito e diocese de Coimbra.",
  },
  {
    title: "Portugal, Passports (1800-1965)",
    collectionId: "1930310",
    url: "https://www.familysearch.org/search/collection/1930310",
    description: "Processos e livros de passaportes de emigração de vários Governos Civis portugueses.",
  },
];

export function searchFamilySearch(query: FamilySearchRecordQuery): FamilySearchResponse {
  const params = new URLSearchParams();

  if (query.givenName) params.append("q.givenName", query.givenName);
  if (query.surname) params.append("q.surname", query.surname);
  if (query.fatherGivenName) params.append("q.fatherGivenName", query.fatherGivenName);
  if (query.fatherSurname) params.append("q.fatherSurname", query.fatherSurname);
  if (query.motherGivenName) params.append("q.motherGivenName", query.motherGivenName);
  if (query.motherSurname) params.append("q.motherSurname", query.motherSurname);
  if (query.spouseGivenName) params.append("q.spouseGivenName", query.spouseGivenName);
  if (query.spouseSurname) params.append("q.spouseSurname", query.spouseSurname);

  if (query.birthPlace) {
    params.append("q.birthLikePlace", `${query.birthPlace}, Portugal`);
  } else {
    params.append("q.recordCountry", "Portugal");
  }

  if (query.birthYear) {
    params.append("q.birthLikeDate.from", String(query.birthYear - 5));
    params.append("q.birthLikeDate.to", String(query.birthYear + 5));
  }

  if (query.marriageYear) {
    params.append("q.marriageLikeDate.from", String(query.marriageYear - 3));
    params.append("q.marriageLikeDate.to", String(query.marriageYear + 3));
  }

  if (query.deathYear) {
    params.append("q.deathLikeDate.from", String(query.deathYear - 3));
    params.append("q.deathLikeDate.to", String(query.deathYear + 3));
  }

  if (query.collectionType === "parish") {
    params.append("f.collectionId", "1927341");
  }

  const searchUrl = `https://www.familysearch.org/search/record/results?${params.toString()}`;
  const placeQuery = query.birthPlace || query.marriagePlace || "Portugal";
  const catalogUrl = `https://www.familysearch.org/search/catalog/results?count=20&place=${encodeURIComponent(placeQuery)}`;

  return {
    query,
    searchUrl,
    catalogUrl,
    directCollectionLinks: PORTUGAL_COLLECTIONS,
    suggestedAction: "Abra o link de pesquisa no navegador para visualizar diretamente todos os microfilmes, árvores partilhadas e registos indexados do FamilySearch correspondentes.",
  };
}
