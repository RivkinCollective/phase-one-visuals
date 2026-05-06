/**
 * Git Helper — auto-commit, push, and pull for context sharing across chats
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';

const REPO = 'https://github.com/RivkinCollective/phase-one-visuals.git';
const CWD = process.cwd();

export function isGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { cwd: CWD, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function hasChanges() {
  try {
    const status = execSync('git status --porcelain', { cwd: CWD, encoding: 'utf8' });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

export function commitAndPush(message) {
  if (!isGitRepo()) {
    console.log('  ⚠️  Not a git repository — skipping git operations');
    return false;
  }

  if (!hasChanges()) {
    console.log('  ✓ No uncommitted changes — nothing to push');
    return false;
  }

  try {
    console.log('  → Staging obsidian-vault/ changes...');
    execSync('git add obsidian-vault/ automation/ .clinerules .graphifyignore', { cwd: CWD, stdio: 'pipe' });

    console.log(`  → Committing: ${message}`);
    execSync(`git commit -m "${message}"`, { cwd: CWD, stdio: 'pipe' });

    console.log('  → Pushing to GitHub...');
    execSync('git push origin master', { cwd: CWD, stdio: 'pipe' });
    console.log('  ✓ Pushed successfully — context available from any chat');
    return true;
  } catch (err) {
    console.log(`  ⚠️  Git operation failed: ${err.message}`);
    return false;
  }
}

export function pullLatest() {
  if (!isGitRepo()) return false;
  try {
    console.log('  → Pulling latest context from GitHub...');
    execSync('git pull origin master', { cwd: CWD, stdio: 'pipe' });
    console.log('  ✓ Pulled latest context');
    return true;
  } catch (err) {
    console.log(`  ⚠️  Pull failed: ${err.message}`);
    return false;
  }
}