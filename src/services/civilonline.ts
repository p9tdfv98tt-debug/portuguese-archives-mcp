export interface CivilOnlineServiceInfo {
  certificateType: "nascimento" | "casamento" | "obito" | "perfilhacao";
  title: string;
  portalUrl: string;
  authenticationTypes: {
    withAuth: string;
    withoutAuth: string;
  };
  cost: string;
  validity: string;
  legalScope: string;
  requiredData: string[];
  stepByStep: string[];
}

export function getCivilOnlineGuidance(options: {
  certificateType: "nascimento" | "casamento" | "obito" | "perfilhacao";
  personName?: string;
  birthDate?: string;
  parishOrPlace?: string;
  fatherName?: string;
  motherName?: string;
}): CivilOnlineServiceInfo {
  const typeTitles: Record<string, string> = {
    nascimento: "Certidão de Nascimento Online",
    casamento: "Certidão de Casamento Online",
    obito: "Certidão de Óbito Online",
    perfilhacao: "Certidão de Perfilhação / Declaração de Maternidade/Paternidade",
  };

  return {
    certificateType: options.certificateType,
    title: typeTitles[options.certificateType] || "Certidão no Civil Online (IRN / Ministério da Justiça)",
    portalUrl: "https://civilonline.mj.pt/CivilOnline/secure/home.jsp",
    authenticationTypes: {
      withAuth: "https://civilonline.mj.pt/CivilOnline/secure/home.jsp (Com Chave Móvel Digital ou Cartão de Cidadão)",
      withoutAuth: "https://civilonline.mj.pt/CivilOnline/secure/cert/declaracao_n_autenticado.jsp (Sem autenticação - para qualquer cidadão/estrangeiro)",
    },
    cost: "€10,00 por certidão online (pagamento por Multibanco / Cartão de Crédito). Presencialmente na Conservatória custa €20,00.",
    validity: "6 meses. É fornecido um código de acesso permanente (ex: 1234-5678-9012) que tem o mesmo valor legal que uma certidão em papel em qualquer entidade pública ou privada.",
    legalScope: "Destina-se a todos os registos ocorridos a partir de 1911 (ano de criação do Registo Civil em Portugal) e a registos paroquiais anteriores já informatizados pelas Conservatórias (SIRIC). Os registos com mais de 100 anos não informatizados são transferidos para os Arquivos Distritais.",
    requiredData: [
      "Nome completo da pessoa registada" + (options.personName ? `: ${options.personName}` : ""),
      "Data de nascimento / casamento / falecimento" + (options.birthDate ? `: ${options.birthDate}` : " (ano aproximado ou data exata)"),
      "Naturalidade (Freguesia / Concelho / Distrito)" + (options.parishOrPlace ? `: ${options.parishOrPlace}` : ""),
      "Filiação (Nome do Pai" + (options.fatherName ? `: ${options.fatherName}` : "") + " e Nome da Mãe" + (options.motherName ? `: ${options.motherName}` : "") + ")",
      "Endereço de email e telemóvel para receção do código de acesso",
    ],
    stepByStep: [
      "1. Aceda ao portal Civil Online: https://civilonline.mj.pt",
      "2. Escolha 'Entrar com autenticação' (Chave Móvel Digital) ou 'Pedir certidão sem autenticação'.",
      `3. Selecione o tipo de certidão pretendida: ${typeTitles[options.certificateType] || "Nascimento"}.`,
      "4. Preencha o formulário com os dados identificativos do titular.",
      "5. Escolha o meio de pagamento (Referência Multibanco ou Cartão de Crédito).",
      "6. Após o pagamento, em regra em menos de 24 horas (ou minutos se o assento já for informatizado), recebe por email e SMS o código de acesso à certidão.",
    ],
  };
}
