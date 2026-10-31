export interface CravArchiveInfo {
  code: string;
  name: string;
  district: string;
  cravUrl: string;
  address?: string;
  email?: string;
}

export const ARCHIVE_CRAV_MAPPINGS: Record<string, CravArchiveInfo> = {
  ANTT: {
    code: "ANTT",
    name: "Arquivo Nacional da Torre do Tombo",
    district: "Lisboa",
    cravUrl: "https://crav.arquivos.pt/login?archive=ANTT",
  },
  ADLRA: {
    code: "ADLRA",
    name: "Arquivo Distrital de Leiria",
    district: "Leiria",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADLRA",
  },
  ADPRT: {
    code: "ADPRT",
    name: "Arquivo Distrital do Porto",
    district: "Porto",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADPRT",
  },
  ADBRG: {
    code: "ADBRG",
    name: "Arquivo Distrital de Braga",
    district: "Braga",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADBRG",
  },
  ADAVR: {
    code: "ADAVR",
    name: "Arquivo Distrital de Aveiro",
    district: "Aveiro",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADAVR",
  },
  ADCOI: {
    code: "ADCOI",
    name: "Arquivo Distrital de Coimbra",
    district: "Coimbra",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADCOI",
  },
  ADEVR: {
    code: "ADEVR",
    name: "Arquivo Distrital de Évora",
    district: "Évora",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADEVR",
  },
  ADFAR: {
    code: "ADFAR",
    name: "Arquivo Distrital de Faro",
    district: "Faro",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADFAR",
  },
  ADLSB: {
    code: "ADLSB",
    name: "Arquivo Distrital de Lisboa",
    district: "Lisboa",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADLSB",
  },
  ADSTB: {
    code: "ADSTB",
    name: "Arquivo Distrital de Setúbal",
    district: "Setúbal",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADSTB",
  },
  ADVCT: {
    code: "ADVCT",
    name: "Arquivo Distrital de Viana do Castelo",
    district: "Viana do Castelo",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADVCT",
  },
  ADVIS: {
    code: "ADVIS",
    name: "Arquivo Distrital de Viseu",
    district: "Viseu",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADVIS",
  },
  ADVRM: {
    code: "ADVRM",
    name: "Arquivo Distrital de Vila Real",
    district: "Vila Real",
    cravUrl: "https://crav.arquivos.pt/login?archive=ADVRM",
  },
};

export interface CravServiceGuidance {
  archive: CravArchiveInfo;
  serviceType: "certidao" | "reproducao_digital" | "pesquisa" | "consulta_presencial";
  title: string;
  directRequestUrl: string;
  estimatedCost: string;
  requiredFields: string[];
  instructions: string[];
}

export function getCravGuidance(options: {
  archiveCode?: string;
  serviceType: "certidao" | "reproducao_digital" | "pesquisa" | "consulta_presencial";
  personName?: string;
  referenceCode?: string;
  documentDetails?: string;
}): CravServiceGuidance {
  const code = options.archiveCode?.toUpperCase() || "ANTT";
  const archive = ARCHIVE_CRAV_MAPPINGS[code] || {
    code,
    name: `Arquivo Distrital (${code})`,
    district: "Portugal",
    cravUrl: `https://crav.arquivos.pt/login?archive=${code}`,
  };

  switch (options.serviceType) {
    case "certidao":
      return {
        archive,
        serviceType: "certidao",
        title: `Pedido de Certidão Narrativa ou de Inteiro Teor / Cópia Autenticada no CRAV (${archive.name})`,
        directRequestUrl: archive.cravUrl,
        estimatedCost: "€15,00 a €20,00 base + custo por página (€1,00/pág) e portes de envio",
        requiredFields: [
          "Nome completo do requerente e NIF",
          "Nome completo da pessoa registada (ex: " + (options.personName || "Nome do antepassado") + ")",
          "Filiação (nome do pai e da mãe)",
          "Paróquia / Freguesia e Concelho de nascimento/casamento/óbito",
          "Data ou ano aproximado",
          options.referenceCode ? `Código de Referência do Arquivo: ${options.referenceCode}` : "Cota ou livro (se conhecido)",
        ],
        instructions: [
          "1. Aceda a https://crav.arquivos.pt e faça login (pode usar Chave Móvel Digital, Cartão de Cidadão ou Registo com Email).",
          `2. Selecione o arquivo de destino: ${archive.name}.`,
          "3. Clique em 'Novo Pedido' -> 'Pedido de Certidão'.",
          "4. Preencha os dados do assento identificado e anexe o Código de Referência se já o tiver localizado.",
          "5. O arquivo analisa o pedido e emite uma referência Multibanco para pagamento.",
          "6. Após o pagamento, a certidão oficial assinada e selada digitalmente/fisicamente é disponibilizada/enviada.",
        ],
      };

    case "reproducao_digital":
      return {
        archive,
        serviceType: "reproducao_digital",
        title: `Pedido de Reprodução Digital / Cópia Simples em Alta Resolução (${archive.name})`,
        directRequestUrl: archive.cravUrl,
        estimatedCost: "Gratuito para imagens já digitalizadas online; €0,50 a €2,00 por imagem para digitalizações sob demanda",
        requiredFields: [
          "Código de referência do documento ou livro (ex: " + (options.referenceCode || "PT/AD.../...") + ")",
          "Número de folha ou assento",
          "Finalidade da reprodução (investigação genealógica privada)",
        ],
        instructions: [
          "1. Inicie sessão no CRAV (https://crav.arquivos.pt).",
          "2. Escolha 'Novo Pedido' -> 'Pedido de Reprodução'.",
          "3. Indique se pretende o documento integral ou páginas específicas (fólio/assento).",
          "4. Uma vez aprovado e processado, o ficheiro JPG/PDF de alta resolução fica para download na sua área pessoal.",
        ],
      };

    case "pesquisa":
      return {
        archive,
        serviceType: "pesquisa",
        title: `Pedido de Pesquisa Arquivística por Técnicos do Arquivo (${archive.name})`,
        directRequestUrl: archive.cravUrl,
        estimatedCost: "€18,45 por hora de pesquisa efetuada pelos técnicos da DGLAB",
        requiredFields: [
          "Nome do indivíduo a pesquisar",
          "Intervalo de anos de busca (máximo recomendado: 5 a 10 anos)",
          "Freguesia/Paróquia e Concelho provável",
          "Nomes de familiares associados (cônjuge, pais)",
        ],
        instructions: [
          "1. Utilize quando não souber a data exata ou o assento não estiver indexado.",
          "2. Entre no CRAV e escolha 'Novo Pedido' -> 'Pedido de Pesquisa'.",
          "3. Forneça o máximo de pistas cronológicas e geográficas para minimizar o tempo de busca.",
        ],
      };

    case "consulta_presencial":
    default:
      return {
        archive,
        serviceType: "consulta_presencial",
        title: `Pedido Antecipado de Consulta Presencial na Sala de Leitura (${archive.name})`,
        directRequestUrl: archive.cravUrl,
        estimatedCost: "Gratuito",
        requiredFields: [
          "Código de referência dos livros/documentos pretendidos",
          "Data prevista da visita à Sala de Leitura",
        ],
        instructions: [
          "1. Permite reservar os documentos antes da deslocação à sala de leitura do arquivo distrital.",
          "2. Escolha 'Pedido Antecipado de Consulta' com pelo menos 24 a 48 horas de antecedência.",
        ],
      };
  }
}
