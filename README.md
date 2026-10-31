# Portuguese Archives & Genealogy MCP Server (`portuguese-archives-mcp`)

A specialized Model Context Protocol (MCP) server that connects AI coding assistants and genealogical research tools to the premier Portuguese national, district, municipal, and insular (Madeira & Açores) genealogical repositories.

## Connected Archives & Platforms

1. **DigiArq / DGLAB** (`https://digitarq.arquivos.pt/`): Over 8 million digitized archival records, passports, notary deeds, inquisitorial processes, and finding aids from Torre do Tombo and all Portuguese District Archives (ADLRA, ADPRT, ADBRG, ADAVR, ADCOI, ADEVR, etc.).
2. **Portal dos Arquivos dos Açores** (`https://arquivos.azores.gov.pt/`): Comprehensive repository covering BPARPD (Ponta Delgada), BPARAH (Angra do Heroísmo), and BPARJJG (Horta) for parish records across all 9 islands, passport processes, and notarial documents.
3. **Arquivo e Biblioteca da Madeira (ABM)** (`https://arquivo-abm.madeira.gov.pt/`): Comprehensive repository of Madeira historical, parish, passport, civil, and photographic records via Archeevo.
4. **Tombo.pt** (`https://tombo.pt/`): Fast indexer and navigator for Portuguese parish registers (Batismos, Casamentos, Óbitos) organized by District, Municipality, and Parish.
5. **Hemeroteca Digital de Lisboa** (`https://hemerotecadigital.cm-lisboa.pt/`): Major repository of Portuguese historical newspapers, periodicals, gazettes (O Século, Diário de Lisboa, Ilustração Portugueza), obituaries, and official notices.
6. **Nós Portugueses** (`https://nosportugueses.pt/`): Over 1.5 million indexed persons, noble houses, and parish book inventories across Portugal.
7. **ANTT (Arquivo Nacional da Torre do Tombo)** (`https://antt.dglab.gov.pt/`): Archival guides, fonds descriptions, and research aids.
8. **Geneall** (`https://geneall.net/pt/`): Premier Portuguese and European genealogical database for lineages, family trees, and noble/historical houses.
9. **Civil Online** (`https://civilonline.mj.pt/`): Official portal of the Instituto dos Registos e do Notariado (IRN) / Ministério da Justiça for modern birth, marriage, and death certificates (1911-present).
10. **CRAV (Consulta Real em Ambiente Virtual)** (`https://crav.arquivos.pt/`): Official platform for requesting certified copies (certidões de inteiro teor/narrativas), high-res reproductions, and archival research from all DGLAB district archives.
11. **FamilySearch** (`https://www.familysearch.org/`): Global genealogical repository with indexed Portuguese Catholic Parish Records, Civil Registration, and Passport collections.
12. **Global Platforms** (Ancestry, MyHeritage, Geneanet, Filae, Findmypast, Storied, Google Genealogy).

## Available Tools

- `azores_archives_search`: Search the Portal dos Arquivos dos Açores across all 9 islands (BPARPD, BPARAH, BPARJJG) for parish books, passports, and notarial documents.
- `azores_get_description`: Retrieve direct details and digital object URLs from Azores archives.
- `abm_search_descriptions`: Archeevo database search for Madeira records.
- `abm_get_description`: Retrieve full scope and metadata of an ABM record.
- `hemeroteca_search`: Targeted search and links across Hemeroteca Digital de Lisboa historical periodicals and obituaries.
- `tombo_search_parish`: Search and map parish records on Tombo.pt by district and municipality.
- `tombo_get_parish_books`: Direct links to baptism, marriage, and death books on Tombo.pt / DGLAB.
- `digitarq_search`: Full-text search across DigiArq / DGLAB.
- `digitarq_get_digital_objects`: Inspect scanned images and manifests on DigiArq.
- `nos_portugueses_search`: Search indexed genealogical persons and trees.
- `nos_portugueses_get_parish_records`: Locate parish inventory books.
- `antt_search_guides_and_articles`: Search Torre do Tombo research guides.
- `geneall_search`: Search Geneall database for people and families.
- `geneall_get_person`: Fetch detailed person and lineage info from Geneall.
- `crav_get_guidance`: Step-by-step instructions, pricing, and direct submission URLs for CRAV certificates.
- `civilonline_get_guidance`: Instructions, pricing, and direct URLs for Civil Online certificates.
- `familysearch_search`: Generate targeted query URLs and links for Portuguese parish and civil records on FamilySearch.
- `global_genealogy_search`: Multi-platform global genealogy queries across 8 portals.
- `portuguese_archives_federated_search`: Simultaneous multi-archive search across DigiArq, ABM Madeira, Arquivos dos Açores, Nós Portugueses, Geneall, and FamilySearch.

## Installation

Requires Node.js 18+.

```bash
git clone https://github.com/p9tdfv98tt-debug/portuguese-archives-mcp.git
cd portuguese-archives-mcp
npm install
npm run build
```

No API keys are needed.

## Using it with an MCP client

Add the server to your client's config (Claude Code, Claude Desktop, Antigravity, etc.), pointing at the built `dist/index.js`:

```json
{
  "mcpServers": {
    "portuguese-archives-mcp": {
      "command": "node",
      "args": ["/path/to/portuguese-archives-mcp/dist/index.js"]
    }
  }
}
```

For Claude Code you can also run:

```bash
claude mcp add portuguese-archives-mcp -- node /path/to/portuguese-archives-mcp/dist/index.js
```

## Development

```bash
npm run dev      # run from source with tsx
npm run build    # compile TypeScript to dist/
npm start        # run the compiled server
```

Each archive has its own module in `src/services/`, and the tools are registered in `src/index.ts`.
