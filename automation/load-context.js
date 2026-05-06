#!/usr/bin/env node
/**
 * Phase One Visuals — Load Context
 * 
 * Run this at the START of every new session to load all context:
 *   node automation/load-context.js
 * 
 * What it does:
 *   1. Checks GitHub for any context updates from other chats (git pull)
 *   2. Finds the most recent session log
 *   3. Shows recent OpenBrain findings
 *   4. Shows recent Graphify outputs
 *   5. Prints a summary the AI can ingest to continue seamlessly
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CWD = process.cwd();
const LOGS_DIR = join(CWD, 'obsidian-vault', 'workflow-logs');
const FINDINGS_DIR = join(CWD, 'obsidian-vault', 'openbrain-findings');
const GRAPHIFY_DIR = join(CWD, 'obsidian-vault', 'graphify-outputs');

console.log('');
console.log('╔═══════════════════════════════════════════════╗');
console.log('║  Phase One Visuals — Load Context Pipeline   ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');

// ─── 1. Pull latest from GitHub ───
console.log('  📡 Step 1: Syncing with GitHub...');
try {
  execSync('git pull origin master', { cwd: CWD, stdio: 'pipe', encoding: 'utf8' });
  console.log('  ✓ Context synced from GitHub');
} catch (err) {
  const msg = err.message || '';
  if (msg.includes('Already up to date')) {
    console.log('  ✓ Already up to date');
  } else {
    console.log(`  ⚠️  Git pull skipped: ${msg.split('\n')[0].slice(0, 100)}`);
  }
}

// ─── 2. Find most recent session log ───
console.log('');
console.log('  📖 Step 2: Last session context...');
try {
  if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true });
  const files = readdirSync(LOGS_DIR)
    .filter(f => f.startsWith('session-') && f.endsWith('.md'))
    .map(f => ({
      name: f,
      path: join(LOGS_DIR, f),
      mtime: statSync(join(LOGS_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.log('  ℹ️  No previous session logs found (first time?)');
  } else {
    const latest = files[0];
    const content = readFileSync(latest.path, 'utf8').split('\n').slice(0, 40).join('\n');
    console.log(`  📄 Latest session: ${latest.name}`);
    console.log(`  🕐 Last modified: ${latest.mtime}`);
    console.log('');
    console.log('  ── Session Content ──────────────────────────');
    console.log(content);
    console.log('  ─────────────────────────────────────────────');
  }
} catch (err) {
  console.log(`  ⚠️  Could not read session logs: ${err.message}`);
}

// ─── 3. Most recent OpenBrain findings ───
console.log('');
console.log('  🧠 Step 3: Recent OpenBrain findings...');
try {
  if (!existsSync(FINDINGS_DIR)) mkdirSync(FINDINGS_DIR, { recursive: true });
  const files = readdirSync(FINDINGS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f,
      path: join(FINDINGS_DIR, f),
      mtime: statSync(join(FINDINGS_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 3);

  if (files.length === 0) {
    console.log('  ℹ️  No OpenBrain findings yet');
  } else {
    files.forEach(f => {
      const preview = readFileSync(f.path, 'utf8').split('\n').slice(5, 12).join('\n');
      console.log(`  • ${f.name}`);
      console.log(`    ${preview.slice(0, 150)}`);
      console.log('');
    });
  }
} catch (err) {
  console.log(`  ⚠️  Could not read findings: ${err.message}`);
}

// ─── 4. Most recent Graphify output ───
console.log('  🔗 Step 4: Graphify state...');
try {
  if (!existsSync(GRAPHIFY_DIR)) mkdirSync(GRAPHIFY_DIR, { recursive: true });
  const reports = readdirSync(GRAPHIFY_DIR)
    .filter(f => f.startsWith('GRAPH_REPORT') && f.endsWith('.md'))
    .map(f => ({
      name: f,
      path: join(GRAPHIFY_DIR, f),
      mtime: statSync(join(GRAPHIFY_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (reports.length === 0) {
    console.log('  ℹ️  No Graphify reports yet (run `/graphify .` to build)');
  } else {
    const latest = reports[0];
    const preview = readFileSync(latest.path, 'utf8').split('\n').slice(0, 20).join('\n');
    console.log(`  📊 Last graph build: ${latest.name}`);
    console.log(`  🕐 ${latest.mtime}`);
    console.log('');
    console.log(preview.slice(0, 300));
  }
} catch (err) {
  console.log(`  ⚠️  Could not read Graphify outputs: ${err.message}`);
}

// ─── 5. Summary for AI ingestion ───
console.log('');
console.log('╔═══════════════════════════════════════════════╗');
console.log('║  Context Load Complete                        ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');
console.log('  AI, read the above context. Based on it:');
console.log('  1. Understand what was last worked on');
console.log('  2. Continue from where it left off');
console.log('  3. Run `/graphify . --update` to refresh the graph');
console.log('  4. At end of session, run: node automation/save-context.js');
console.log('');