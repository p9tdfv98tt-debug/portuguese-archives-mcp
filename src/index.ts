#!/usr/bin/env node
import { getTomboParishBooks, resolveTomboUrl } from "./services/tombo.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchDigitarq, getDigitarqDigitalObjects } from "./services/digitarq.js";
import { searchABM, getABMDescription } from "./services/abm.js";
import { searchAzoresArchives, getAzoresDescriptionUrl } from "./services/azores.js";
import { searchNosPortugueses, getParishRecords } from "./services/nosportugueses.js";
import { searchANTT, getANTTArticle } from "./services/antt.js";
import { searchGeneall, getGeneallPerson } from "./services/geneall.js";
import { getCravGuidance } from "./services/crav.js";
import { getCivilOnlineGuidance } from "./services/civilonline.js";
import { searchFamilySearch } from "./services/familysearch.js";
import { searchHemerotecaDigital } from "./services/hemeroteca.js";
import { searchInternationalArchives } from "./services/international_archives.js";
import {
  searchAllGlobalPlatforms,
  buildAncestryQuery,
  buildMyHeritageQuery,
  buildFindmypastQuery,
  buildGeneanetQuery,
  buildStoriedQuery,
  buildFilaeQuery,
  buildGoogleGenealogyQuery,
} from "./services/global_genealogy.js";

const server = new Server(
  {
    name: "portuguese-archives-mcp",
    version: "2.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools metadata
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "tombo_search_parish",
        description: "Search and resolve Tombo.pt direct links and indexed parish book collections for any Portuguese parish or municipality (e.g. Nazaré, Camacha, Porto da Cruz, Funchal, Ponta Delgada, Angra do Heroísmo).",
        inputSchema: {
          type: "object",
          properties: {
            parish: { type: "string", description: "Parish name (e.g. 'Pederneira', 'Camacha', 'Porto da Cruz', 'Matriz', 'Sé')." },
            municipality: { type: "string", description: "Municipality name (e.g. 'Nazaré', 'Machico', 'Funchal', 'Ponta Delgada', 'Angra do Heroísmo')." },
            district: { type: "string", description: "District / Region (e.g. 'Leiria', 'Madeira', 'Lisboa', 'Açores')." },
            year: { type: "number", description: "Optional specific year." },
            recordType: { type: "string", enum: ["batismos", "casamentos", "obitos", "passaportes", "all"] }
          }
        }
      },
      {
        name: "tombo_get_parish_books",
        description: "Scrape and extract direct high-speed archive links for baptism, marriage, and death books from Tombo.pt.",
        inputSchema: {
          type: "object",
          properties: {
            parish: { type: "string" },
            municipality: { type: "string" },
            district: { type: "string" },
            year: { type: "number" }
          }
        }
      },
      {
        name: "azores_archives_search",
        description: "Search the Portal dos Arquivos dos Açores (arquivos.azores.gov.pt) covering BPARPD (Ponta Delgada), BPARAH (Angra do Heroísmo), and BPARJJG (Horta) for parish records across all 9 Azores islands, passport processes, and notarial documents.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Keywords, ancestor name, parish, or place in Azores." },
            island: { type: "string", description: "Optional island (e.g. 'Sao Miguel', 'Terceira', 'Faial', 'Pico', 'Sao Jorge', 'Santa Maria', 'Graciosa', 'Flores', 'Corvo')." },
            archive: { type: "string", description: "Optional specific archive code ('BPARPD', 'BPARAH', 'BPARJJG')." },
            recordType: { type: "string", enum: ["paroquiais", "passaportes", "notariais", "all"], description: "Type of records." }
          },
          required: ["query"]
        }
      },
      {
        name: "azores_get_description",
        description: "Retrieve direct URL and reference for an Azores archive record description by ID.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Document or description ID in the Azores archives portal." }
          },
          required: ["id"]
        }
      },
      {
        name: "global_genealogy_search",
        description:
          "Simultaneously generate targeted search queries and deep links across all 8 global genealogical powerhouses: FamilySearch, Ancestry, MyHeritage, Findmypast, Geneanet, Storied, Filae, and Google Advanced Genealogy.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s) of person." },
            surname: { type: "string", description: "Surname(s) of person." },
            birthYear: { type: "number", description: "Approximate birth year." },
            birthPlace: { type: "string", description: "Birth place or region in Portugal (e.g. 'Nazaré', 'Camacha', 'Machico', 'Funchal', 'Ponta Delgada')." },
            deathYear: { type: "number", description: "Approximate death year." },
            deathPlace: { type: "string", description: "Death place." },
            fatherGivenName: { type: "string", description: "Father first name." },
            fatherSurname: { type: "string", description: "Father surname." },
            motherGivenName: { type: "string", description: "Mother first name." },
            motherSurname: { type: "string", description: "Mother surname." },
            spouseGivenName: { type: "string", description: "Spouse first name." },
            spouseSurname: { type: "string", description: "Spouse surname." },
          },
        },
      },
      {
        name: "ancestry_search",
        description: "Search Ancestry.com world records, family trees, and Portugal historical collections.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthYear: { type: "number", description: "Birth year." },
            birthPlace: { type: "string", description: "Place in Portugal." },
            fatherSurname: { type: "string", description: "Father surname." },
            motherSurname: { type: "string", description: "Mother surname." },
            spouseSurname: { type: "string", description: "Spouse surname." },
          },
        },
      },
      {
        name: "myheritage_search",
        description: "Search MyHeritage global database, Smart Matches, and Portuguese family records.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthYear: { type: "number", description: "Birth year." },
            birthPlace: { type: "string", description: "Place in Portugal." },
            fatherGivenName: { type: "string", description: "Father first name." },
            fatherSurname: { type: "string", description: "Father surname." },
            motherGivenName: { type: "string", description: "Mother first name." },
            motherSurname: { type: "string", description: "Mother surname." },
            spouseGivenName: { type: "string", description: "Spouse first name." },
            spouseSurname: { type: "string", description: "Spouse surname." },
          },
        },
      },
      {
        name: "findmypast_search",
        description: "Search Findmypast world records, migration logs, and passenger lists.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthYear: { type: "number", description: "Birth year." },
            birthPlace: { type: "string", description: "Place in Portugal." },
          },
        },
      },
      {
        name: "geneanet_search",
        description: "Search Geneanet (Europe's largest community genealogy portal) for Portuguese and European family trees.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthYear: { type: "number", description: "Birth year." },
            birthPlace: { type: "string", description: "Place in Portugal." },
            spouseSurname: { type: "string", description: "Spouse surname." },
            fatherSurname: { type: "string", description: "Father surname." },
            motherSurname: { type: "string", description: "Mother surname." },
          },
        },
      },
      {
        name: "storied_search",
        description: "Search Storied.com historical stories, newspapers, and family biographies.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthPlace: { type: "string", description: "Place." },
            birthYear: { type: "number", description: "Year." },
          },
        },
      },
      {
        name: "filae_search",
        description: "Search Filae European archive portal for Portuguese and European records.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthPlace: { type: "string", description: "Place." },
            birthYear: { type: "number", description: "Year." },
          },
        },
      },
      {
        name: "google_genealogy_search",
        description: "Perform advanced targeted Google Dorking across all Portuguese national, district, and regional archives.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            birthPlace: { type: "string", description: "Place / Parish." },
            fatherSurname: { type: "string", description: "Father surname." },
            spouseSurname: { type: "string", description: "Spouse surname." },
          },
        },
      },
      {
        name: "familysearch_search",
        description: "Search FamilySearch historical records, collections, and parish catalog for Portugal.",
        inputSchema: {
          type: "object",
          properties: {
            givenName: { type: "string", description: "First name(s)." },
            surname: { type: "string", description: "Surname." },
            fatherGivenName: { type: "string", description: "Father first name." },
            fatherSurname: { type: "string", description: "Father surname." },
            motherGivenName: { type: "string", description: "Mother first name." },
            motherSurname: { type: "string", description: "Mother surname." },
            spouseGivenName: { type: "string", description: "Spouse first name." },
            spouseSurname: { type: "string", description: "Spouse surname." },
            birthPlace: { type: "string", description: "Birth place in Portugal." },
            birthYear: { type: "number", description: "Birth year." },
            marriageYear: { type: "number", description: "Marriage year." },
            deathYear: { type: "number", description: "Death year." },
            collectionType: { type: "string", enum: ["parish", "civil", "passports", "all"] },
          },
        },
      },
      {
        name: "digitarq_search",
        description: "Search over 8 million archival documents and finding aids across Torre do Tombo and all District Archives (DGLAB / DigiArq).",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Keywords, names, or places." },
            archiveCode: { type: "string", description: "Optional archive code (e.g. 'ANTT', 'ADLRA')." },
            dateInitial: { type: "string", description: "Start date (YYYY)." },
            dateFinal: { type: "string", description: "End date (YYYY)." },
            fromIndex: { type: "number", description: "Pagination offset." },
            max: { type: "number", description: "Max results (max 50)." },
          },
          required: ["query"],
        },
      },
      {
        name: "digitarq_get_digital_objects",
        description: "Retrieve digital representation metadata and file details for a DigiArq document ID.",
        inputSchema: {
          type: "object",
          properties: {
            docId: { type: "string", description: "DigiArq document ID." },
          },
          required: ["docId"],
        },
      },
      {
        name: "abm_search_descriptions",
        description: "Search Madeira Regional Archive (ABM) Archeevo database.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query." },
            page: { type: "number" },
            perPage: { type: "number" },
            sortField: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "abm_get_description",
        description: "Fetch full metadata for an ABM record by ID.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number", description: "Numeric ID." },
          },
          required: ["id"],
        },
      },
      {
        name: "nos_portugueses_search",
        description: "Search Nós Portugueses genealogical database.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Name or family." },
          },
          required: ["query"],
        },
      },
      {
        name: "nos_portugueses_get_parish_records",
        description: "Find parish book links for a district/concelho.",
        inputSchema: {
          type: "object",
          properties: {
            district: { type: "string" },
            municipality: { type: "string" },
          },
          required: ["district", "municipality"],
        },
      },
      {
        name: "antt_search_guides_and_articles",
        description: "Search ANTT research guides and articles.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "geneall_search",
        description: "Search Geneall database for people and families.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            country: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "geneall_get_person",
        description: "Fetch person details from Geneall URL.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
          },
          required: ["url"],
        },
      },
      {
        name: "crav_get_guidance",
        description: "Official instructions and pricing for CRAV certificate requests.",
        inputSchema: {
          type: "object",
          properties: {
            archiveCode: { type: "string" },
            serviceType: { type: "string", enum: ["certidao", "reproducao_digital", "pesquisa", "consulta_presencial"] },
            personName: { type: "string" },
            referenceCode: { type: "string" },
          },
          required: ["serviceType"],
        },
      },
      {
        name: "civilonline_get_guidance",
        description: "Instructions and pricing for Civil Online certificates.",
        inputSchema: {
          type: "object",
          properties: {
            certificateType: { type: "string", enum: ["nascimento", "casamento", "obito", "perfilhacao"] },
            personName: { type: "string" },
            birthDate: { type: "string" },
            parishOrPlace: { type: "string" },
            fatherName: { type: "string" },
            motherName: { type: "string" },
          },
          required: ["certificateType"],
        },
      },
      {
        name: "hemeroteca_search",
        description: "Search Hemeroteca Digital de Lisboa (hemerotecadigital.cm-lisboa.pt) digitized newspapers (O Bairro Camões, O Século, Diário de Lisboa, Ilustração Portugueza, Gazeta dos Caminhos de Ferro) and generate targeted archive search links.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Keywords, name, or search query (e.g. 'O Século', 'fotógrafo', 'necrologia')." },
            publication: { type: "string", description: "Optional specific newspaper title (e.g. 'O Bairro Camões', 'O Século', 'Diário de Lisboa')." },
            year: { type: "number", description: "Optional publication year." }
          },
          required: ["query"]
        }
      },
      {
        name: "international_archives_search",
        description: "Search and generate deep research links for international archives and academic repositories: ResearchGate (researchgate.net - scientific publications & nautical/canning/historical studies), Academia.edu (academia.edu - historical papers/canning industry), Brazil National Archives SIAN (sian.an.gov.br - ship passenger lists & foreign registers in São Paulo/Santos), APESP (Immigration and civil registries in São Paulo), and AHU (Arquivo Histórico Ultramarino ahu.dglab.gov.pt - Mozambique and overseas education personnel).",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query, person name, or topic (e.g. 'João da Silva', 'imigração São Paulo', 'indústria conserveira')." },
            category: { type: "string", enum: ["researchgate", "academia", "brazil_sian", "brazil_apesp", "ultramar_ahu", "all"], description: "Specific archive category or 'all'." }
          },
          required: ["query"]
        }
      },
      {
        name: "portuguese_archives_federated_search",
        description: "Simultaneous federated search across all Portuguese archives, Madeira, Azores, and international platforms.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Person name." },
            place: { type: "string", description: "Place in Portugal." },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "tombo_search_parish": {
        const schema = z.object({
          parish: z.string().optional(),
          municipality: z.string().optional(),
          district: z.string().optional(),
          year: z.number().optional(),
          recordType: z.enum(["batismos", "casamentos", "obitos", "passaportes", "all"]).optional(),
        });
        const parsed = schema.parse(args || {});
        const url = resolveTomboUrl(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify({ tomboUrl: url, query: parsed }, null, 2) }],
        };
      }

      case "tombo_get_parish_books": {
        const schema = z.object({
          parish: z.string().optional(),
          municipality: z.string().optional(),
          district: z.string().optional(),
          year: z.number().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = await getTomboParishBooks(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "azores_archives_search": {
        const schema = z.object({
          query: z.string(),
          island: z.string().optional(),
          archive: z.string().optional(),
          recordType: z.enum(["paroquiais", "passaportes", "notariais", "all"]).optional(),
        });
        const parsed = schema.parse(args || {});
        const result = searchAzoresArchives(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "azores_get_description": {
        const schema = z.object({ id: z.union([z.string(), z.number()]) });
        const { id } = schema.parse(args || {});
        const url = getAzoresDescriptionUrl(id);
        return {
          content: [{ type: "text", text: JSON.stringify({ descriptionId: id, detailsUrl: url }, null, 2) }],
        };
      }

      case "global_genealogy_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthYear: z.number().optional(),
          birthPlace: z.string().optional(),
          deathYear: z.number().optional(),
          deathPlace: z.string().optional(),
          fatherGivenName: z.string().optional(),
          fatherSurname: z.string().optional(),
          motherGivenName: z.string().optional(),
          motherSurname: z.string().optional(),
          spouseGivenName: z.string().optional(),
          spouseSurname: z.string().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = searchAllGlobalPlatforms(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "ancestry_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthYear: z.number().optional(),
          birthPlace: z.string().optional(),
          fatherSurname: z.string().optional(),
          motherSurname: z.string().optional(),
          spouseSurname: z.string().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildAncestryQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "myheritage_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthYear: z.number().optional(),
          birthPlace: z.string().optional(),
          fatherGivenName: z.string().optional(),
          fatherSurname: z.string().optional(),
          motherGivenName: z.string().optional(),
          motherSurname: z.string().optional(),
          spouseGivenName: z.string().optional(),
          spouseSurname: z.string().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildMyHeritageQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "findmypast_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthYear: z.number().optional(),
          birthPlace: z.string().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildFindmypastQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "geneanet_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthYear: z.number().optional(),
          birthPlace: z.string().optional(),
          spouseSurname: z.string().optional(),
          fatherSurname: z.string().optional(),
          motherSurname: z.string().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildGeneanetQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "storied_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthPlace: z.string().optional(),
          birthYear: z.number().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildStoriedQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "filae_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthPlace: z.string().optional(),
          birthYear: z.number().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildFilaeQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "google_genealogy_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          birthPlace: z.string().optional(),
          fatherSurname: z.string().optional(),
          spouseSurname: z.string().optional(),
        });
        const parsed = schema.parse(args || {});
        const result = buildGoogleGenealogyQuery(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "familysearch_search": {
        const schema = z.object({
          givenName: z.string().optional(),
          surname: z.string().optional(),
          fatherGivenName: z.string().optional(),
          fatherSurname: z.string().optional(),
          motherGivenName: z.string().optional(),
          motherSurname: z.string().optional(),
          spouseGivenName: z.string().optional(),
          spouseSurname: z.string().optional(),
          birthPlace: z.string().optional(),
          birthYear: z.number().optional(),
          marriageYear: z.number().optional(),
          deathYear: z.number().optional(),
          collectionType: z.enum(["parish", "civil", "passports", "all"]).optional(),
        });
        const parsed = schema.parse(args || {});
        const result = searchFamilySearch(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "digitarq_search": {
        const schema = z.object({
          query: z.string(),
          archiveCode: z.string().optional(),
          dateInitial: z.string().optional(),
          dateFinal: z.string().optional(),
          fromIndex: z.number().optional(),
          max: z.number().optional(),
        });
        const parsed = schema.parse(args);
        const result = await searchDigitarq(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "digitarq_get_digital_objects": {
        const schema = z.object({ docId: z.string() });
        const { docId } = schema.parse(args);
        const result = await getDigitarqDigitalObjects(docId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "abm_search_descriptions": {
        const schema = z.object({
          query: z.string(),
          page: z.number().optional(),
          perPage: z.number().optional(),
          sortField: z.string().optional(),
        });
        const parsed = schema.parse(args);
        const result = await searchABM(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "abm_get_description": {
        const schema = z.object({ id: z.number() });
        const { id } = schema.parse(args);
        const result = await getABMDescription(id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "nos_portugueses_search": {
        const schema = z.object({
          query: z.string(),
        });
        const parsed = schema.parse(args);
        const result = await searchNosPortugueses(parsed.query, "persons");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "nos_portugueses_get_parish_records": {
        const schema = z.object({
          district: z.string(),
          municipality: z.string(),
        });
        const parsed = schema.parse(args);
        const result = await getParishRecords(parsed.district, parsed.municipality);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "antt_search_guides_and_articles": {
        const schema = z.object({ query: z.string() });
        const { query } = schema.parse(args);
        const result = await searchANTT(query);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "geneall_search": {
        const schema = z.object({
          query: z.string(),
          country: z.string().optional(),
        });
        const parsed = schema.parse(args);
        const result = await searchGeneall(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "geneall_get_person": {
        const schema = z.object({ url: z.string() });
        const { url } = schema.parse(args);
        const result = await getGeneallPerson(url);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "crav_get_guidance": {
        const schema = z.object({
          archiveCode: z.string().optional(),
          serviceType: z.enum(["certidao", "reproducao_digital", "pesquisa", "consulta_presencial"]),
          personName: z.string().optional(),
          referenceCode: z.string().optional(),
        });
        const parsed = schema.parse(args);
        const result = getCravGuidance(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "civilonline_get_guidance": {
        const schema = z.object({
          certificateType: z.enum(["nascimento", "casamento", "obito", "perfilhacao"]),
          personName: z.string().optional(),
          birthDate: z.string().optional(),
          parishOrPlace: z.string().optional(),
          fatherName: z.string().optional(),
          motherName: z.string().optional(),
        });
        const parsed = schema.parse(args);
        const result = getCivilOnlineGuidance(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "portuguese_archives_federated_search": {
        const schema = z.object({
          name: z.string(),
          place: z.string().optional(),
        });
        const { name: queryName, place } = schema.parse(args);

        const [digitarqRes, abmRes, nosPortRes, geneallRes] = await Promise.allSettled([
          searchDigitarq({ query: queryName, max: 10 }),
          searchABM({ query: queryName, perPage: 10 }),
          searchNosPortugueses(queryName, "persons"),
          searchGeneall({ query: queryName }),
        ]);

        const azoresRes = searchAzoresArchives({ query: queryName });

        const parts = queryName.trim().split(" ");
        const gName = parts[0];
        const sName = parts.slice(1).join(" ");

        const globalLinks = searchAllGlobalPlatforms({
          givenName: gName,
          surname: sName,
          birthPlace: place,
        });

        const federated = {
          query: queryName,
          placeFilter: place || "None",
          sources: {
            digitarq: digitarqRes.status === "fulfilled" ? digitarqRes.value : { error: "Failed" },
            abmMadeira: abmRes.status === "fulfilled" ? abmRes.value : { error: "Failed" },
            azoresArchives: azoresRes,
            nosPortugueses: nosPortRes.status === "fulfilled" ? nosPortRes.value : { error: "Failed" },
            geneall: geneallRes.status === "fulfilled" ? geneallRes.value : { error: "Failed" },
            globalPlatforms: globalLinks.platforms,
          },
        };

        return {
          content: [{ type: "text", text: JSON.stringify(federated, null, 2) }],
        };
      }

      case "hemeroteca_search": {
        const schema = z.object({
          query: z.string(),
          publication: z.string().optional(),
          year: z.number().optional()
        });
        const parsed = schema.parse(args || {});
        const result = searchHemerotecaDigital(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "international_archives_search": {
        const schema = z.object({
          query: z.string(),
          category: z.enum(["researchgate", "academia", "brazil_sian", "brazil_apesp", "ultramar_ahu", "all"]).optional(),
        });
        const parsed = schema.parse(args || {});
        const result = searchInternationalArchives(parsed);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error executing tool ${name}: ${err.message}` }],
    };
  }
});

// Start STDIO transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Portuguese Archives MCP server running on stdio");
}

run().catch((err) => {
  console.error("Fatal error running server:", err);
  process.exit(1);
});
