# Graphify Build Log — 2026-05-05

## Build Summary
- **Date**: 2026-05-05 22:27
- **Graphify Version**: 0.7.7
- **Corpus**: 17 files, ~16K words (6 JS, 9 docs, 2 images)
- **Graph**: 20 nodes, 17 edges, 6 communities
- **Extraction**: AST-only (no semantic/LLM — no API key set)
- **Extraction Integrity**: 94% EXTRACTED, 6% INFERRED, 0% AMBIGUOUS

## Key Findings
- **God Nodes**: removeColumn, reindexColumnHeaders, showToast, renderPricingFallback, renderPricingCategory
- **Cross-Community Bridge**: syncAllContent → showToast connects admin.js utilities
- **Architecture**: 6 communities map to distinct files: content-manager, admin, main, admin-auth, firebase-config, plus utility clusters

## Outputs
- `graphify-out/graph.json` — Raw graph data (20 nodes, 17 edges)
- `graphify-out/GRAPH_REPORT.md` — Human-readable audit report
- `graphify-out/graph.html` — Interactive browser visualization
- `graphify-out/obsidian/` — Obsidian vault (20 notes + canvas)

## Notes
- Semantic extraction skipped (no Anthropic/Moonshot API key, Ollama not running)
- Graph is AST-only for JS files — HTML/CSS not parsed
- To enrich: start Ollama and run `graphify extract . --backend ollama`
