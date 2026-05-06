# Graph Report - .  (2026-05-05)

## Corpus Check
- Corpus is ~16,221 words - fits in a single context window. You may not need a graph.

## Summary
- 20 nodes · 17 edges · 6 communities (3 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `removeColumn()` - 2 edges
2. `reindexColumnHeaders()` - 2 edges
3. `showToast()` - 2 edges
4. `renderPricingFallback()` - 2 edges
5. `renderPricingCategory()` - 2 edges
6. `syncAllContent()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `syncAllContent()` --calls--> `showToast()`  [INFERRED]
  seed-data.js → admin.js

## Communities (6 total, 3 thin omitted)

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `showToast()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._