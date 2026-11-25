#!/usr/bin/env node
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {validateContent} from './content-model.mjs';
const input = resolve(process.argv[2] || fileURLToPath(new URL('./content.json', import.meta.url)));
const root = dirname(input), data = validateContent(JSON.parse(await readFile(input, 'utf8')));
const paths = [data.logo, data.headerAction?.url, ...data.projects.flatMap(p => [p.cover,p.video,p.demo,...p.gallery||[]]), ...data.articles.flatMap(a=>[a.cover,a.url]), ...data.music?.tracks.flatMap(t=>[t.audio,t.cover])||[]].filter(Boolean);
let local = 0;
for (const path of new Set(paths)) {
  if (/^(?:https?:|mailto:|#)/i.test(path)) continue;
  const file = resolve(root, decodeURIComponent(path.split(/[?#]/)[0])); const rel = relative(root, file);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Asset escapes the starter directory: ${path}`);
  if (!(await stat(file)).isFile()) throw new Error(`Asset is not a file: ${path}`);
  local++;
}
console.log(JSON.stringify({valid:true,projects:data.projects.length,articles:data.articles.length,experiences:data.experiences.length,localAssets:local,musicTracks:data.music?.enabled?data.music.tracks.length:0}));
