const fs = require('fs');
const path = require('path');
let raw = fs.readFileSync(path.join(__dirname, 'raw.css'), 'utf8');
raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');

function prefixSelector(selector) {
  const parts = [];
  let current = '';
  let depth = 0;
  for (const ch of selector) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts
    .map((part) => {
      const lead = part.match(/^\s*/)?.[0] ?? '';
      const body = part.trim();
      if (!body) return '';
      if (body.startsWith('@')) return lead + body;
      if (/^(from|to)$/.test(body) || /^\d+%$/.test(body)) return lead + body;
      let next = body
        .replace(/^:root\b/, '.ecat')
        .replace(/^html\b/, '.ecat')
        .replace(/^body\b/, '.ecat')
        .replace(/#app\b/g, '.ecat');
      if (!next.startsWith('.ecat')) next = `.ecat ${next}`;
      return lead + next;
    })
    .filter(Boolean)
    .join(',');
}

let out = '';
let i = 0;
while (i < raw.length) {
  const nextBrace = raw.indexOf('{', i);
  const nextClose = raw.indexOf('}', i);
  if (nextBrace === -1) {
    out += raw.slice(i);
    break;
  }
  if (nextClose !== -1 && nextClose < nextBrace) {
    out += raw.slice(i, nextClose + 1);
    i = nextClose + 1;
    continue;
  }
  const prelude = raw.slice(i, nextBrace);
  const trimmed = prelude.trim();
  if (
    trimmed.startsWith('@media') ||
    trimmed.startsWith('@supports') ||
    trimmed.startsWith('@container') ||
    trimmed.startsWith('@keyframes') ||
    trimmed.startsWith('@-webkit-keyframes') ||
    trimmed.startsWith('@')
  ) {
    out += prelude;
  } else {
    out += prefixSelector(prelude);
  }
  out += '{';
  i = nextBrace + 1;
}

const target = path.join(__dirname, 'ecat.css');
fs.writeFileSync(target, out);
console.log('wrote', out.length);
