// Runtime validation is also used by validate-content.mjs. No browser dependency.
export function validateContent(data) {
  const fail = (path, message) => { throw new Error(`${path}: ${message}`); };
  const record = (value, path, allowed, required = []) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'expected an object');
    for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${path}.${key}`, 'unknown field');
    for (const key of required) if (!(key in value)) fail(`${path}.${key}`, 'required field');
  };
  const str = (value, path, empty = true) => { if (typeof value !== 'string' || (!empty && !value.trim())) fail(path, 'expected a string'); };
  const text = (value, path) => {
    if (typeof value === 'string') { str(value, path, false); return; }
    record(value, path, ['zh', 'en'], ['zh', 'en']); str(value.zh, `${path}.zh`, false); str(value.en, `${path}.en`, false);
  };
  const array = (value, path) => { if (!Array.isArray(value)) fail(path, 'expected an array'); };
  const id = (value, path) => { str(value, path, false); if (!/^[a-z0-9][a-z0-9_-]*$/.test(value)) fail(path, 'use a stable lowercase id'); };
  const unique = (items, path) => { const ids = new Set(); items.forEach((item, index) => { id(item.id, `${path}[${index}].id`); if (ids.has(item.id)) fail(path, `duplicate id ${item.id}`); ids.add(item.id); }); return ids; };
  const url = (value, path, mail = false) => {
    str(value, path); if (!value) return;
    if (/^(?:\/|\\|[a-z]:)/i.test(value) && !/^https?:/i.test(value)) fail(path, 'use a relative public path, not a filesystem or root path');
    try { const parsed = new URL(value, 'https://portfolio.invalid/starter/'); if (!(mail ? ['https:', 'http:', 'mailto:'] : ['https:', 'http:']).includes(parsed.protocol)) fail(path, 'unsupported URL scheme'); }
    catch { fail(path, 'invalid URL'); }
  };
  record(data, 'content', ['schemaVersion', '$schema', 'defaultLanguage', 'name', 'wordmarkCase', 'headerAction', 'logo', 'location', 'email', 'motto', 'mottoAccent', 'demo', 'about', 'availability', 'contactIntro', 'contactTitle', 'categories', 'projectCategories', 'projects', 'articleCategories', 'articles', 'experiences', 'honors', 'links', 'music'], ['schemaVersion', 'defaultLanguage', 'name', 'location', 'email', 'motto', 'categories', 'projectCategories', 'projects', 'articleCategories', 'articles', 'experiences', 'links']);
  if (data.$schema !== undefined) str(data.$schema, '$schema');
  if (data.schemaVersion !== 1) fail('schemaVersion', 'expected 1');
  if (!['zh', 'en'].includes(data.defaultLanguage)) fail('defaultLanguage', 'choose zh or en');
  str(data.name, 'name', false); str(data.email, 'email');
  if(data.wordmarkCase!==undefined&&!['preserve','uppercase'].includes(data.wordmarkCase))fail('wordmarkCase','choose preserve or uppercase');
  if(data.headerAction!==undefined){record(data.headerAction,'headerAction',['label','url'],['label','url']);text(data.headerAction.label,'headerAction.label');url(data.headerAction.url,'headerAction.url',true);if(!data.headerAction.url.trim())fail('headerAction.url','a working URL is required');}
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fail('email', 'invalid email');
  if (data.demo !== undefined && typeof data.demo !== 'boolean') fail('demo', 'expected a boolean');
  ['location', 'motto'].forEach(key => text(data[key], key));
  ['mottoAccent', 'about', 'availability', 'contactIntro', 'contactTitle'].forEach(key => { if (data[key] !== undefined) text(data[key], key); });
  if (data.logo !== undefined) url(data.logo, 'logo');
  ['categories', 'projectCategories', 'projects', 'articleCategories', 'articles', 'experiences', 'links'].forEach(key => array(data[key], key));
  if (data.categories.length !== 4) fail('categories', 'exactly four discovery entries are required');
  unique(data.categories, 'categories'); const projectCategories = unique(data.projectCategories, 'projectCategories'); const articleCategories = unique(data.articleCategories, 'articleCategories');
  for (const [index, category] of data.projectCategories.entries()) { record(category, `projectCategories[${index}]`, ['id', 'label'], ['id', 'label']); text(category.label, 'project category label'); }
  for (const [index, category] of data.articleCategories.entries()) { record(category, `articleCategories[${index}]`, ['id', 'label', 'description'], ['id', 'label']); text(category.label, 'article category label'); if(category.description !== undefined) text(category.description, 'article category description'); }
  for (const [index, category] of data.categories.entries()) {
    record(category, `categories[${index}]`, ['id', 'label', 'hint', 'icon', 'route', 'filters'], ['id', 'label', 'hint', 'icon', 'route']); text(category.label, 'category label'); text(category.hint, 'category hint');
    if (!['film', 'design', 'code', 'article'].includes(category.icon)) fail('category.icon', 'unsupported icon');
    if (!['work', 'articles'].includes(category.route)) fail('category.route', 'choose work or articles');
    if (category.filters !== undefined) { array(category.filters, 'category.filters'); category.filters.forEach(value => { if (!projectCategories.has(value)) fail('category.filters', `unknown project category ${value}`); }); }
  }
  unique(data.projects, 'projects');
  for (const [index, project] of data.projects.entries()) {
    record(project, `projects[${index}]`, ['id', 'title', 'category', 'summary', 'detail', 'cover', 'url', 'date', 'role', 'gallery', 'video', 'demo', 'featured', 'coverFit'], ['id', 'title', 'category', 'summary', 'detail', 'cover']);
    ['title', 'summary', 'detail'].forEach(key => text(project[key], `project.${key}`)); if(project.role !== undefined) text(project.role, 'project.role');
    if (!projectCategories.has(project.category)) fail('project.category', `unknown category ${project.category}`);
    ['cover', 'url', 'video', 'demo'].forEach(key => { if (project[key] !== undefined) url(project[key], `project.${key}`); });
    if (project.gallery !== undefined) { array(project.gallery, 'project.gallery'); project.gallery.forEach(value => url(value, 'project.gallery image')); }
    if (project.date !== undefined) {
      str(project.date, 'project.date');
      if (project.date && !/^(?!0000)\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(project.date)) fail('project.date', 'use YYYY, YYYY-MM, or YYYY-MM-DD');
      if (project.date.length === 10 && (Number.isNaN(Date.parse(project.date)) || new Date(project.date).toISOString().slice(0,10) !== project.date)) fail('project.date', 'invalid calendar date');
    }
    if (project.featured !== undefined && typeof project.featured !== 'boolean') fail('project.featured', 'expected a boolean');
    if (project.coverFit !== undefined && !['cover', 'contain'].includes(project.coverFit)) fail('project.coverFit', 'choose cover or contain');
  }
  unique(data.articles, 'articles');
  for (const [index, article] of data.articles.entries()) {
    record(article, `articles[${index}]`, ['id', 'title', 'category', 'date', 'cover', 'url'], ['id', 'title', 'category', 'date', 'cover', 'url']); text(article.title, 'article.title');
    if (!articleCategories.has(article.category)) fail('article.category', `unknown category ${article.category}`);
    if (typeof article.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(article.date) || Number.isNaN(Date.parse(article.date)) || new Date(article.date).toISOString().slice(0,10)!==article.date) fail('article.date', 'use YYYY-MM-DD');
    url(article.cover, 'article.cover'); url(article.url, 'article.url'); if (!article.url) fail('article.url', 'a working article URL is required');
  }
  unique(data.experiences, 'experiences');
  for (const [index, item] of data.experiences.entries()) { record(item, `experiences[${index}]`, ['id', 'institution', 'year', 'title', 'description'], ['id', 'institution', 'year', 'title', 'description']); ['institution', 'year', 'title', 'description'].forEach(key => text(item[key], `experience.${key}`)); }
  if (data.honors !== undefined) { array(data.honors, 'honors'); data.honors.forEach(value => text(value, 'honors item')); }
  for (const [index, item] of data.links.entries()) { record(item, `links[${index}]`, ['label', 'url', 'icon', 'color'], ['label', 'url']); text(item.label, 'link.label'); url(item.url, 'link.url', true); if(!item.url)fail('link.url','a working URL is required'); if (item.icon !== undefined && !['github', 'film', 'article', 'message', 'external'].includes(item.icon)) fail('link.icon', 'unsupported icon'); if(item.color !== undefined && !/^#[0-9a-f]{6}$/i.test(item.color)) fail('link.color', 'use a six digit hex color'); }
  if (data.music !== undefined) {
    record(data.music, 'music', ['enabled', 'invitation', 'tracks'], ['enabled', 'tracks']); if (typeof data.music.enabled !== 'boolean') fail('music.enabled', 'expected a boolean'); if(data.music.invitation !== undefined && typeof data.music.invitation !== 'boolean') fail('music.invitation', 'expected a boolean'); array(data.music.tracks, 'music.tracks');
    for (const [index, track] of data.music.tracks.entries()) { record(track, `music.tracks[${index}]`, ['title', 'artist', 'audio', 'cover'], ['title', 'artist', 'audio', 'cover']); text(track.title, 'track.title'); text(track.artist, 'track.artist'); url(track.audio, 'track.audio'); url(track.cover, 'track.cover'); if(!track.audio)fail('track.audio','required'); }
    if (data.music.enabled && !data.music.tracks.length) fail('music.tracks', 'an enabled player needs a real track');
  }
  return data;
}
