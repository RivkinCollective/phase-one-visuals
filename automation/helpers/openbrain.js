/**
 * OpenBrain Helper — write/read memory across sessions
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FINDINGS_DIR = join(process.cwd(), 'obsidian-vault', 'openbrain-findings');

function ensureFindingsDir() {
  if (!existsSync(FINDINGS_DIR)) {
    mkdirSync(FINDINGS_DIR, { recursive: true });
  }
}

/**
 * Save a finding for OpenBrain to index later
 */
export function prepareFinding({ title, content, tags = [], session, type = 'finding' }) {
  ensureFindingsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  const filepath = join(FINDINGS_DIR, `${timestamp}-${slug}.md`);

  const frontmatter = [
    '---',
    `title: "${title}"`,
    `type: ${type}`,
    `session: "${session || 'auto'}"`,
    `created: "${new Date().toISOString()}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    '---',
    ''
  ].join('\n');

  writeFileSync(filepath, frontmatter + content, 'utf8');
  console.log(`  ✓ Finding saved: ${filepath}`);
  return filepath;
}

/**
 * Get recent findings for session-start context loading
 */
export function getRecentFindings(count = 3) {
  ensureFindingsDir();
  try {
    const files = readdirSync(FINDINGS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        path: join(FINDINGS_DIR, f),
        mtime: statSync(join(FINDINGS_DIR, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, count);

    if (files.length === 0) {
      console.log('  ℹ️  No OpenBrain findings yet');
      return [];
    }

    return files.map(f => ({
      filename: f.name,
      modified: f.mtime,
      preview: readFileSync(f.path, 'utf8').split('\n').slice(0, 10).join('\n')
    }));
  } catch (err) {
    console.log(`  ⚠️  Could not read findings: ${err.message}`);
    return [];
  }
}