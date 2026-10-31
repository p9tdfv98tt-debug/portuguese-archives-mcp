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
      familyContext: string;
    }>;
  };
  academiaEdu: {
    searchUrl: string;
    googleScholarUrl: string;
    directResources: Array<{
      title: string;
      url: string;
      description: string;
      familyContext: string;
    }>;
  };
  brazilSian: {
    portalUrl: string;
    searchUrl: string;
    directCollections: Array<{
      fonds: string;
      url: string;
      description: string;
      familyContext: string;
    }>;
  };
  brazilApesp: {
    portalUrl: string;
    immigrationSearchUrl: string;
    collections: Array<{
      title: string;
      url: string;
      description: string;
      familyContext: string;
    }>;
  };
  ultramarAhu: {
    portalUrl: string;
    digitarqAhuUrl: string;
    collections: Array<{
      title: string;
      url: string;
      description: string;
      familyContext: string;
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
          title: "A Indústria Conserveira na Nazaré (1910-1925)",
          url: "https://www.researchgate.net/search/publication?q=industria+conserveira+Nazar%C3%A9",
          description: "Estudos de arqueologia industrial e história económica do mar português, documentando sociedades comerciais e escrituras de sócios.",
          familyContext: "Famílias de comerciantes e industriais da Nazaré"
        },
        {
          title: "Estudos de Comunidades Marítimas e Mareantes de Longo Curso da Costa Portuguesa",
          url: "https://www.researchgate.net/search/publication?q=mareantes+Pederneira+Nazare",
          description: "Pesquisas antropológicas e históricas sobre mestres do mar, confrarias e navegação atlântica na Nazaré e Pederneira.",
          familyContext: "Famílias de mareantes e mestres do mar"
        }
      ]
    },
    academiaEdu: {
      searchUrl: `https://www.academia.edu/search?q=${q}`,
      googleScholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(`site:academia.edu "${rawQuery}"`)}`,
      directResources: [
        {
          title: "Estudos da Indústria Conserveira da Nazaré",
          url: "https://www.academia.edu/search?q=industria+conserveira+Nazar%C3%A9",
          description: "Estudos académicos sobre a indústria conserveira, adubos de peixe e os capitais dos mareantes da Nazaré.",
          familyContext: "Sócios e capitalistas da indústria conserveira"
        },
        {
          title: "História dos Mareantes da Pederneira e Navegação de Longo Curso",
          url: "https://www.academia.edu/search?q=mareantes+Pederneira+Nazar%C3%A9",
          description: "Teses e artigos de história marítima sobre pilotos e frotas atlânticas da Nazaré.",
          familyContext: "Pilotos e famílias de navegação atlântica"
        },
        {
          title: "Imprensa e Sociedade Urbana em Lisboa nos Anos 20",
          url: "https://www.academia.edu/search?q=imprensa+Lisboa+anos+20",
          description: "Investigações sobre periódicos lisboetas e a vida social do Bairro Camões em 1927.",
          familyContext: "Jornalistas, editores e fundadores de periódicos"
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
          familyContext: "Chegada e fixação de imigrantes portugueses no Brasil"
        },
        {
          fonds: "Processos de Estrangeiros e Naturalização (Ministério da Justiça e Negócios Interiores)",
          url: "https://sian.an.gov.br/",
          description: "Dossiês de residência definitiva, vistos, passaportes e atividades de cidadãos portugueses no Brasil.",
          familyContext: "Ramos familiares radicados no Estado de São Paulo"
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
          familyContext: "Entrada e registo de imigrantes em São Paulo"
        },
        {
          title: "Acervo Notarial e Cartórios do Estado de São Paulo",
          url: "http://www.arquivoestado.sp.gov.br/",
          description: "Escrituras públicas, registos comerciais e certidões civis de óbito e matrimónio da capital paulista.",
          familyContext: "Registos civis de óbito e negócios de imigrantes"
        }
      ]
    },
    ultramarAhu: {
      portalUrl: "https://ahu.dglab.gov.pt/",
      digitarqAhuUrl: `https://digitarq.ahu.arquivos.pt/search?query=${q}`,
      collections: [
        {
          title: "Fundo da Direção-Geral do Ensino do Ultramar (DGEU) - Moçambique",
          url: "https://digitarq.ahu.arquivos.pt/",
          description: "Processos individuais de professores oficiais e liceais colocados em Lourenço Marques, Beira e províncias ultramarinas.",
          familyContext: "Professores colocados no ultramar (ex.: Moçambique)"
        },
        {
          title: "Conselho Ultramarino e Ministério das Colónias / Ultramar",
          url: "https://ahu.dglab.gov.pt/",
          description: "Despachos, comissões de serviço e licenças de passagem de funcionários públicos e professores entre a Metrópole e Moçambique.",
          familyContext: "Historial de serviço público ultramarino"
        }
      ]
    }
  };
}
