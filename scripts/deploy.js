'use strict';
// One-shot deploy: creates the GitHub repo if needed, enables Pages (Actions build), pushes.
// Usage: node scripts/deploy.js   (needs `gh auth login` done once)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CFG = path.join(ROOT, 'site.config.json');
const cfg = JSON.parse(fs.readFileSync(CFG, 'utf8'));
const sh = (cmd, opts = {}) => execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
const tryc = (cmd) => { try { return sh(cmd); } catch (e) { return null; } };

function main() {
  if (tryc('gh auth status') === null) {
    console.error('GitHub CLI is not logged in. Run:  gh auth login   (choose GitHub.com, HTTPS, login with a web browser), then re-run this script.');
    process.exit(1);
  }
  const user = sh('gh api user -q .login');
  const repo = cfg.githubRepo || 'wagefigures';
  if (cfg.githubUser !== user) {
    cfg.githubUser = user;
    fs.writeFileSync(CFG, JSON.stringify(cfg, null, 2) + '\n');
    console.log(`Set githubUser=${user} in site.config.json`);
  }

  // Build once locally to make sure it works before pushing.
  console.log('Building...');
  console.log(sh('node src/build.js'));

  if (!fs.existsSync(path.join(ROOT, '.git'))) sh('git init');
  tryc('git branch -M main');
  sh('git add -A');
  if (tryc('git diff --cached --quiet') === null) sh('git commit -m "Build site" -q');

  const exists = tryc(`gh repo view ${user}/${repo} --json name -q .name`);
  if (!exists) {
    console.log(`Creating repo ${user}/${repo}...`);
    sh(`gh repo create ${repo} --public --description "${cfg.siteName}: ${cfg.tagline}" --source . --remote origin --push`);
  } else {
    if (!tryc('git remote get-url origin')) sh(`git remote add origin https://github.com/${user}/${repo}.git`);
    sh('git push -u origin main');
  }

  // Enable GitHub Pages with the Actions workflow as the build source.
  const pages = tryc(`gh api repos/${user}/${repo}/pages -q .html_url`);
  if (!pages) {
    tryc(`gh api -X POST repos/${user}/${repo}/pages -f build_type=workflow`);
    console.log('Enabled GitHub Pages (Actions).');
  }
  if (cfg.domain) {
    tryc(`gh api -X PUT repos/${user}/${repo}/pages -f cname=${cfg.domain} -F https_enforced=true`);
    console.log(`Custom domain set to ${cfg.domain}. Make sure DNS points here (see HANDOFF.md).`);
  }
  const live = cfg.domain ? `https://${cfg.domain}/` : `https://${user}.github.io/${repo}/`;
  console.log(`\nPushed. The deploy workflow runs for ~1 minute; the site will be live at:\n  ${live}\nWatch progress: gh run watch --repo ${user}/${repo}`);
}
main();
