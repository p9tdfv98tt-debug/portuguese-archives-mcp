/**
 * Service to search and link international archives:
 * 1. ResearchGate (researchgate.net - scientific publications, industrial studies, and historical papers)
 * 2. Academia.edu (Academic articles, industrial history, and genealogy papers)
 * 3. SIAN - Arquivo Nacional do Brasil (sian.an.gov.br)
 * 4. APESP - Arquivo Público do Estado de São Paulo (arquivoestado.sp.gov.br/imigracao)
 * 5. AHU - Arquivo Histórico Ultramarino (ahu.dglab.gov.pt)
 */

export interface InternationalArchivesQuery {
  query: string;
  category?: "researchgate" | "academia" | "brazil_sian" | "brazil_apesp" | "ultramar_ahu" | "all";
  personOrTopic?: string;
}

export interface InternationalArchivesResult {
  query: string;
  category: string;
  researchGate: {
    portalUrl: string;
    searchUrl: string;
    googleScholarUrl: string;
    directResources: Array<{
      title: string;
      url: string;
      description: string;
      usefulFor: string;
    }>;
  };
  academiaEdu: {
    searchUrl: string;
    googleScholarUrl: string;
    directResources: Array<{
      title: string;
      url: string;
      description: string;
      usefulFor: string;
    }>;
  };
  brazilSian: {
    portalUrl: string;
    searchUrl: string;
    directCollections: Array<{
      fonds: string;
      url: string;
      description: string;
      usefulFor: string;
    }>;
  };
  brazilApesp: {
    portalUrl: string;
    immigrationSearchUrl: string;
    collections: Array<{
      title: string;
      url: string;
      description: string;
      usefulFor: string;
    }>;
  };
  ultramarAhu: {
    portalUrl: string;
    digitarqAhuUrl: string;
    collections: Array<{
      title: string;
      url: string;
      description: string;
      usefulFor: string;
    }>;
  };
}

export function searchInternationalArchives(options: InternationalArchivesQuery): InternationalArchivesResult {
  const rawQuery = options.query.trim();
  const q = encodeURIComponent(rawQuery);
  const category = options.category || "all";

  return {
    query: rawQuery,
    category,
    researchGate: {
      portalUrl: "https://www.researchgate.net/",
      searchUrl: `https://www.researchgate.net/search/publication?q=${q}`,
      googleScholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(`site:researchgate.net "${rawQuery}"`)}`,
      directResources: [
        {
          title: "Emigração portuguesa (séculos XIX-XX)",
          url: "https://www.researchgate.net/search/publication?q=emigra%C3%A7%C3%A3o+portuguesa",
          description: "Estudos sobre fluxos migratórios portugueses para o Brasil, Américas e Europa.",
          usefulFor: "Antepassados que emigraram"
        },
        {
          title: "Demografia histórica e registos paroquiais em Portugal",
          url: "https://www.researchgate.net/search/publication?q=registos+paroquiais+demografia+hist%C3%B3rica+Portugal",
          description: "Investigação sobre fontes paroquiais, mortalidade, nupcialidade e famílias.",
          usefulFor: "Interpretar e localizar registos paroquiais"
        }
      ]
    },
    academiaEdu: {
      searchUrl: `https://www.academia.edu/search?q=${q}`,
      googleScholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(`site:academia.edu "${rawQuery}"`)}`,
      directResources: [
        {
          title: "Genealogia e história da família em Portugal",
          url: "https://www.academia.edu/search?q=genealogia+Portugal",
          description: "Artigos sobre metodologia genealógica, linhagens e fontes arquivísticas portuguesas.",
          usefulFor: "Métodos e fontes de pesquisa genealógica"
        },
        {
          title: "História local e municipal portuguesa",
          url: "https://www.academia.edu/search?q=hist%C3%B3ria+local+Portugal",
          description: "Monografias e estudos sobre concelhos, freguesias, ofícios e comunidades.",
          usefulFor: "Contexto histórico da terra de origem"
        }
      ]
    },
    brazilSian: {
      portalUrl: "https://sian.an.gov.br/",
      searchUrl: `https://sian.an.gov.br/sianex/consulta/pesquisa_livre_pesquisa_avancada.asp?termo=${q}`,
      directCollections: [
        {
          fonds: "Relações de Vapores e Desembarque de Passageiros (Porto de Santos e Rio de Janeiro)",
          url: "https://sian.an.gov.br/",
          description: "Registos oficiais de entrada de passageiros portugueses e imigrantes por via marítima no Brasil.",
          usefulFor: "Chegada e fixação de imigrantes portugueses no Brasil"
        },
        {
          fonds: "Processos de Estrangeiros e Naturalização (Ministério da Justiça e Negócios Interiores)",
          url: "https://sian.an.gov.br/",
          description: "Dossiês de residência definitiva, vistos, passaportes e atividades de cidadãos portugueses no Brasil.",
          usefulFor: "Ramos familiares radicados no Estado de São Paulo"
        }
      ]
    },
    brazilApesp: {
      portalUrl: "http://www.arquivoestado.sp.gov.br/",
      immigrationSearchUrl: `http://www.arquivoestado.sp.gov.br/imigracao/pesquisa.php?sobrenome=${encodeURIComponent(rawQuery)}`,
      collections: [
        {
          title: "Base de Dados de Imigrantes do Porto de Santos & Hospedaria do Brás",
          url: "http://www.arquivoestado.sp.gov.br/imigracao/",
          description: "Livros de matrícula, desembarque e acolhimento de imigrantes no Estado de São Paulo.",
          usefulFor: "Entrada e registo de imigrantes em São Paulo"
        },
        {
          title: "Acervo Notarial e Cartórios do Estado de São Paulo",
          url: "http://www.arquivoestado.sp.gov.br/",
          description: "Escrituras públicas, registos comerciais e certidões civis de óbito e matrimónio da capital paulista.",
          usefulFor: "Registos civis de óbito e negócios de imigrantes"
        }
      ]
    },
    ultramarAhu: {
      portalUrl: "https://ahu.dglab.gov.pt/",
      digitarqAhuUrl: `https://digitarq.ahu.arquivos.pt/search?query=${q}`,
      collections: [
        {
          title: "Processos individuais de funcionários e professores do Ultramar",
          url: "https://digitarq.ahu.arquivos.pt/",
          description: "Processos de funcionários públicos, militares e professores colocados em Angola, Moçambique, Cabo Verde, Guiné, São Tomé, Índia, Macau e Timor.",
          usefulFor: "Antepassados que viveram ou trabalharam nas antigas colónias"
        },
        {
          title: "Conselho Ultramarino e Ministério das Colónias / Ultramar",
          url: "https://ahu.dglab.gov.pt/",
          description: "Despachos, comissões de serviço e licenças de passagem de funcionários públicos e professores entre a Metrópole e o Ultramar.",
          usefulFor: "Historial de serviço público ultramarino"
        }
      ]
    }
  };
}
