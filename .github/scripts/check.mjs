// CI gate before every deploy: the dashboard's module script parses, config.json is valid, and no secret
// (Anthropic key, MA-BEMS access key, private key) is in any published file.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const ROOT = 'public';
const fail = (msg) => { console.error('::error::' + msg); process.exitCode = 1; };

// 1. the page's module script must parse (a syntax error would leave a blank dashboard)
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const mod = /^<script type="module">\r?\n([\s\S]*?)^<\/script>/m.exec(html);
if (!mod) fail('index.html: no <script type="module"> block');
else {
  const file = join(mkdtempSync(join(tmpdir(), 'mabems-')), 'module.mjs');
  writeFileSync(file, mod[1]);
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) fail('index.html: module script does not parse\n' + r.stderr);
  else console.log(`ok  index.html module script parses (${(mod[1].length / 1024).toFixed(0)} KB)`);
}

// 2. config.json: the gateway is empty (operator PC off) or an https origin
try {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
  if (cfg.gateway && !/^https:\/\/[a-z0-9.-]+$/i.test(cfg.gateway)) fail('config.json: gateway must be an https origin or empty');
  else console.log('ok  config.json gateway = ' + (cfg.gateway || '(none: operator PC offline)'));
} catch (e) {
  fail('config.json: ' + e.message);
}

// 3. no secrets in anything that gets published
const SECRETS = [/sk-ant-[A-Za-z0-9_-]{10,}/, /\bmb[ak]_[A-Za-z0-9_-]{24,}/, /ANTHROPIC_API_KEY\s*=\s*\S/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const files = walk(ROOT);
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const re of SECRETS) if (re.test(text)) fail(`${f}: looks like a secret (${re.source})`);
}
console.log(`ok  ${files.length} files scanned for secrets`);
