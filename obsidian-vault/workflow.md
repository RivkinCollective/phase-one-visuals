# Phase One Visuals — Knowledge Workflow

## Tools Integrated

### Graphify (Knowledge Graph)
- **Package**: `graphifyy` v0.7.7 (Python)
- **Skill**: `.kiro/skills/graphify/SKILL.md`
- **Steering**: `.kiro/steering/graphify.md` (always-on — Kiro reads graph before every conversation)
- **Output**: `graphify-out/` (graph.json, GRAPH_REPORT.md, graph.html)
- **Commands**:
  - Build graph: `/graphify .`
  - Update graph: `/graphify . --update`
  - Query graph: `/graphify query "<question>"`
  - Export Obsidian: `/graphify . --obsidian`

### OpenBrain (Long-Term Memory)
- **Tools**: `openbrain_openbrain_*` (12 tools available in Kiro)
- **Functions**: Write, Read, Search (semantic + structured), Embed, Audit
- **Storage**: Persistent memory across sessions

### Obsidian Vault
- **Location**: `obsidian-vault/`
- **Structure**:
  - `graphify-outputs/` — Graphify graph snapshots, reports, queries
  - `openbrain-findings/` — OpenBrain search results and memory dumps
  - `codebase-insights/` — Manual architecture notes, decisions
  - `workflow-logs/` — Timestamped logs of all graph builds and queries
  - `templates/` — Reusable note templates

## Workflow Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Graphify   │────▶│   Obsidian   │◀────│  OpenBrain   │
│  (KG Build)  │     │   (Vault)    │     │  (Memory)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
  graphify-out/      obsidian-vault/        memory objects
  - graph.json       - findings/            - semantic search
  - graph.html       - insights/            - structured queries
  - REPORT.md        - logs/                - audits
```

## Usage

### Build Knowledge Graph
```
/graphify .
```
This generates `graphify-out/GRAPH_REPORT.md`. Archive findings to `obsidian-vault/graphify-outputs/`.

### Search Memory
Use OpenBrain tools to search the knowledge base:
- `openbrain_openbrain_search_semantic` — natural language queries
- `openbrain_openbrain_search_structured` — metadata-based queries
- `openbrain_openbrain_read` — retrieve stored objects

### Archive Finding
1. After querying Graphify or OpenBrain, open the relevant template
2. Fill in findings, copy to appropriate subfolder with date
3. Link related notes using Obsidian wikilinks

## Graphify Ignore
`.graphifyignore` excludes: `node_modules/`, `.kilocode/`, `.kilo/`, `.kiro/`, `.git/`, logs
