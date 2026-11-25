import {validateContent} from './content-model.mjs';
import {createMusic} from './music.mjs';
import {attachGallerySwipe} from './gallery-gestures.mjs';
import {createTransition} from './motion.mjs';
import {automaticTheme, nextThemeBoundary} from './theme-clock.mjs';
const $ = selector => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const iconPaths = {
  film:'<path d="m4 4 16-2 1 5-16 3zM3 10h18v10H3zM6 3l3 5M12 2l3 5"/>',
  design:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M10 9v12"/>',
  code:'<path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>',
  article:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 12h8M8 16h8"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  experience:'<path d="M6 3h12M6 21h12M7 3v4l10 10v4M17 3v4L7 17v4M8 7h8M8 17h8"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7H4l-3 3V11.5a8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h3A8.5 8.5 0 0 1 21 11.5Z"/>',
  github:'<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2.1 3.1-.4 6.3-1.5 6.3-7A5.4 5.4 0 0 0 19.3 6 5 5 0 0 0 19.2 2s-1.2-.4-4 1.5a13.7 13.7 0 0 0-7.2 0C5.2 1.6 4 2 4 2A5 5 0 0 0 3.9 6a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.2 6.6 6.3 7-.5.5-.7 1.2-.7 2.1V22"/>',
  external:'<path d="M7 17 17 7M7 7h10v10"/>',
  up:'<path d="m5 12 7-7 7 7M12 5v14"/>',down:'<path d="m5 12 7 7 7-7M12 5v14"/>',
  left:'<path d="m14 6-6 6 6 6"/>',right:'<path d="m10 6 6 6-6 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
  moon:'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  sort:'<path d="M7 3v18m-4-4 4 4 4-4M17 21V3m-4 4 4-4 4 4"/>',
  music:'<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
  play:'<path d="m8 5 12 7-12 7z"/>',pause:'<path d="M8 5v14M16 5v14"/>',back:'<path d="M5 4v16m14-2L7 12l12-6z"/>',next:'<path d="M19 4v16M5 18l12-6L5 6z"/>'
};
const labels = {
  zh:{work:'作品',allWork:'全部作品',selected:'不错的',articles:'文章',experience:'经历',contact:'联系',contactAction:'联系',all:'全部',search:'找一个作品',emptyProjects:'这里还没有作品。',emptyArticles:'这个栏目还没有文章。',newest:'最新优先',oldest:'最早优先',read:'阅读全文',articleCount:'篇文章',dateSort:'切换时间排序',honors:'查看荣誉',emptyExperience:'经历将在这里继续生长。',emptyHonors:'暂未填写荣誉。',hello:'聊聊吧',contactIntro:'欢迎交流想法，也欢迎一起做点有趣的事情。',based:'BASED IN',demo:'虚构示例 · 内容均可替换',top:'回到当前页面顶部',explore:'向下查看不错的作品',previous:'上一件作品',next:'下一件作品',close:'关闭作品详情',role:'我的工作',open:'打开项目',loadingDemo:'正在载入演示…',demoFailed:'演示暂不可用，可打开项目原链接。',imageFailed:'这张图片暂时无法加载。',previousImage:'上一张图片',nextImage:'下一张图片',chooseImage:'选择图片',loadFailed:'内容未能读取，请检查 content.json，并通过 HTTP 预览此文件夹。',switchTheme:'切换深浅主题',skip:'跳到作品'},
  en:{work:'Work',allWork:'All work',selected:'Good stuff',articles:'Articles',experience:'About',contact:'Contact',contactAction:'Contact',all:'All',search:'Find a project',emptyProjects:'No projects here yet.',emptyArticles:'No articles in this category yet.',newest:'Newest first',oldest:'Oldest first',read:'Read article',articleCount:'articles',dateSort:'Change date order',honors:'Recognition',emptyExperience:'There is more to come.',emptyHonors:'No recognition added yet.',hello:'Say hello',contactIntro:'Ideas, conversations, and interesting things to make together.',based:'BASED IN',demo:'Fictional demo · Make it yours',top:'Back to the current page top',explore:'Explore selected work',previous:'Previous work',next:'Next work',close:'Close project details',role:'My role',open:'Open project',loadingDemo:'Loading demo…',demoFailed:'Demo unavailable. Open the project link instead.',imageFailed:'This image could not load.',previousImage:'Previous image',nextImage:'Next image',chooseImage:'Choose image',loadFailed:'Content could not load. Check content.json and serve this folder over HTTP.',switchTheme:'Toggle theme',skip:'Skip to work'}
};
let content, language='zh', route='home', categoryFilter=[], query='', articleCategory='', articleOrder='desc', articleScrollLeft=0, themeManualUntil=0, themeTimer=0, currentTheme='', music;
let pageCleanup = [];
let trigger = null, origin = null, pageTop = 0, pageLeft = 0, previousOverflow = '', closing = false;
let sourceVisibility = null, pushedElements = [], previewAnimations = [];
const dialog=$('#project-dialog'),card=$('.preview-card');
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.innerHTML=iconPaths[name]||iconPaths.external;return svg;}
function txt(value){return typeof value==='string'?value:value?.[language]||value?.zh||value?.en||'';}
function ui(key){return labels[language][key]||key;}
function safeUrl(value,image=false){if(typeof value!=='string'||!value.trim())return '';try{const parsed=new URL(value,location.href);return(image?['http:','https:']:['http:','https:','mailto:']).includes(parsed.protocol)?parsed.href:'';}catch{return '';}}
function behavior(){return reducedMotion.matches?'instant':'smooth';}
const transition=createTransition(document,reducedMotion);
function readRoute(){const hash=location.hash.slice(1);return['home','work','articles','experience','contact'].includes(hash)?hash:'home';}
function categoryLabel(id){return txt(content.projectCategories.find(item=>item.id===id)?.label||id);}
function coverFor(project){
  const cover=element('div','cover'),url=safeUrl(project.cover,true);
  if(!url){cover.classList.add('has-image');const fallback=element('span','cover-fallback');fallback.append(icon('design'));cover.append(fallback);return cover;}
  const image=element('img');image.src=url;image.alt=txt(project.title)||'';image.loading='lazy';image.decoding='async';if(project.coverFit==='contain')image.style.objectFit='contain';
  const ready=()=>cover.classList.add('has-image');image.addEventListener('load',ready,{once:true});image.addEventListener('error',()=>{image.remove();cover.classList.add('has-image');const fallback=element('span','cover-fallback');fallback.append(icon('design'));cover.append(fallback);},{once:true});cover.append(image);if(image.complete&&image.naturalWidth)ready();return cover;
}
function clearPage(){pageCleanup.forEach(cleanup=>cleanup());pageCleanup=[];$('#page-content').replaceChildren();}
function renderIdentity(){
  const wordmark=content.wordmarkCase==='preserve'?content.name:content.name.toUpperCase();
  document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=content.name;$('#header-name').textContent=wordmark;$('#footer-name').textContent=wordmark;$('#footer-name').setAttribute('aria-label',wordmark);
  const logo=safeUrl(content.logo,true);if(logo){const image=element('img');image.src=logo;image.alt=content.name;$('#header-name').replaceChildren(image);}
  $('#header-name').title=content.name;$('#header-name').setAttribute('aria-label',`${wordmark} ${language==='zh'?'首页':'home'}`);$('#header-contact').textContent=content.headerAction?txt(content.headerAction.label):ui('contactAction');$('#header-contact').href=safeUrl(content.headerAction?.url||'#contact');$('#skip-link').textContent=ui('skip');
  $('#demo-note').textContent=content.demo?ui('demo'):'';$('#year').textContent=`© ${new Date().getFullYear()}`;$('#language-switch').textContent=language==='zh'?'EN':'中';$('#language-switch').setAttribute('aria-label',language==='zh'?'Switch to English':'切换中文');
  $('#theme-switch').setAttribute('aria-label',ui('switchTheme'));$('#preview-close').setAttribute('aria-label',ui('close'));$('#preview-close').replaceChildren(icon('close'));$('#back-top').setAttribute('aria-label',ui('top'));$('#back-top').replaceChildren(icon('up'));$('#island-cue').setAttribute('aria-label',ui('explore'));$('#island-cue').replaceChildren(icon('down'));renderIsland();music?.updateLanguage();
}
function applyTheme(next){currentTheme=next;document.documentElement.dataset.theme=next;$('#theme-switch').replaceChildren(icon(next==='dark'?'sun':'moon'));document.querySelector('meta[name=theme-color]').content=next==='dark'?'#0b0c0f':'#ffffff';}
function scrollToWork(){document.querySelector('#work')?.scrollIntoView({behavior:behavior(),block:'start'});}
function go(next){if(location.hash==='#'+next){if(next==='work')scrollToWork();else window.scrollTo({top:0,behavior:behavior()});return;}location.hash=next;}
function renderHome(){
  const main=$('#page-content'),hero=element('section','hero');hero.setAttribute('aria-label',language==='zh'?'首页':'Home');
  const motto=element('h1'),mottoText=txt(content.motto),accent=txt(content.mottoAccent),position=accent?mottoText.indexOf(accent):-1;
  if(position>=0)motto.append(document.createTextNode(mottoText.slice(0,position)),element('span','motto-accent',accent),document.createTextNode(mottoText.slice(position+accent.length)));else motto.textContent=mottoText;
  const categories=element('div','category-actions');categories.setAttribute('aria-label',language==='zh'?'探索栏目':'Explore categories');
  for(const category of content.categories){const button=element('button','category-button');button.type='button';button.setAttribute('aria-label',txt(category.label));const title=element('span','tile-title',txt(category.label)),hint=element('span','tile-hint',txt(category.hint));title.setAttribute('aria-hidden','true');hint.setAttribute('aria-hidden','true');button.append(icon(category.icon),title,hint);button.addEventListener('click',()=>{if(category.route==='articles')go('articles');else{categoryFilter=[...category.filters||[]];renderWorkGrid();renderWorkFilters();go('work');}});categories.append(button);}
  hero.append(motto,categories);main.append(hero);renderSelected(main);
  const work=element('section','work section');work.id='work';const heading=element('div','section-heading'),title=element('h2','',ui('allWork'));title.id='work-title';title.tabIndex=-1;title.append(element('span','work-count',`/ ${content.projects.length}`));heading.append(title);
  const controls=element('div','work-controls'),filters=element('nav','work-filters');filters.id='work-filters';filters.setAttribute('aria-label',language==='zh'?'作品分类':'Work categories');const search=element('input','work-search');search.type='search';search.placeholder=ui('search');search.setAttribute('aria-label',ui('search'));search.value=query;search.addEventListener('input',()=>{query=search.value;renderWorkGrid();});controls.append(filters,search);
  const grid=element('div','project-grid');grid.id='projects';const status=element('p','empty-state');status.id='work-status';status.setAttribute('role','status');work.append(heading,controls,grid,status);main.append(work);renderWorkFilters();renderWorkGrid();
}
function renderWorkFilters(){
  const nav=$('#work-filters');if(!nav)return;nav.replaceChildren();
  const options=[{id:'',label:ui('all')},...content.projectCategories];
  for(const item of options){const selected=item.id?categoryFilter.includes(item.id):!categoryFilter.length,button=element('button','',txt(item.label));button.type='button';button.dataset.category=item.id;button.setAttribute('aria-pressed',String(selected));button.append(element('small','',String(content.projects.filter(project=>!item.id||project.category===item.id).length)));button.addEventListener('click',()=>{categoryFilter=item.id?[item.id]:[];renderWorkFilters();renderWorkGrid();$(`#work-filters button[data-category="${item.id}"]`)?.focus({preventScroll:true});});nav.append(button);}
}
function renderWorkGrid(){
  const grid=$('#projects');if(!grid)return;const projects=content.projects.filter(project=>(!categoryFilter.length||categoryFilter.includes(project.category))&&(!query||[txt(project.title),txt(project.summary),categoryLabel(project.category)].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  grid.replaceChildren(...projects.map(project=>{const article=element('article','project-card'),button=element('button','card-trigger');button.type='button';button.setAttribute('aria-label',`${ui('work')}: ${txt(project.title)}`);button.setAttribute('aria-haspopup','dialog');const copy=element('div','card-copy');copy.append(element('span','category-label',categoryLabel(project.category)),element('h3','',txt(project.title)),element('p','summary',txt(project.summary)));button.append(coverFor(project),copy);button.addEventListener('click',()=>openProject(project,button));article.append(button);return article;}));$('#work-status').textContent=projects.length?'':ui('emptyProjects');$('#work-status').hidden=!!projects.length;
}
function renderSelected(main){
  const items=content.projects.filter(project=>project.featured);if(!items.length)return;
  const section=element('section','selected section'),heading=element('div','section-heading'),title=element('h2','',ui('selected'));title.id='selected-title';section.setAttribute('aria-labelledby',title.id);
  const arrows=element('div','selected-arrows'),previous=element('button','rail-arrow'),next=element('button','rail-arrow');previous.type=next.type='button';previous.append(icon('left'));next.append(icon('right'));previous.setAttribute('aria-label',ui('previous'));next.setAttribute('aria-label',ui('next'));arrows.append(previous,next);heading.append(title,arrows);
  const rail=element('div','selected-track');rail.tabIndex=0;rail.setAttribute('aria-label',language==='zh'?'不错的作品横条':'Selected work strip');
  rail.append(...items.map(project=>{const button=element('button','selected-card');button.type='button';button.setAttribute('aria-label',`${ui('selected')}: ${txt(project.title)}`);button.setAttribute('aria-haspopup','dialog');const copy=element('div','selected-copy');copy.append(element('h3','',txt(project.title)),element('p','',txt(project.summary)),icon('external'));button.append(coverFor(project),copy);button.addEventListener('click',()=>openProject(project,button));return button;}));
  const pages=element('nav','selected-pages');pages.setAttribute('aria-label',language==='zh'?'切换不错的作品':'Choose selected work');let destination=null,timer=0,current=0;
  const maximum=()=>Math.max(0,rail.scrollWidth-rail.clientWidth);
  const mark=index=>{current=index;buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});previous.disabled=index===0;next.disabled=index===items.length-1;};
  const sync=()=>{const max=maximum();if(destination&&Math.abs(rail.scrollLeft-destination.left)>1.5){mark(destination.index);return;}destination=null;mark(max>1?Math.round(rail.scrollLeft/max*(items.length-1)):0);};
  const move=index=>{index=Math.max(0,Math.min(items.length-1,index));const max=maximum();destination=max>1?{index,left:max*index/Math.max(1,items.length-1)}:null;mark(max>1?index:0);rail.scrollTo({left:destination?.left||0,behavior:behavior()});};
  const buttons=items.map((project,index)=>{const button=element('button');button.type='button';button.setAttribute('aria-label',`${index+1}: ${txt(project.title)}`);button.append(element('span'));button.addEventListener('click',()=>move(index));return button;});pages.append(...buttons);previous.addEventListener('click',()=>move(current-1));next.addEventListener('click',()=>move(current+1));
  const interrupt=()=>{destination=null;clearTimeout(timer);sync();};const onScroll=()=>{sync();clearTimeout(timer);timer=setTimeout(interrupt,170);};rail.addEventListener('scroll',onScroll,{passive:true});rail.addEventListener('scrollend',interrupt);rail.addEventListener('pointerdown',interrupt);rail.addEventListener('wheel',interrupt,{passive:true});rail.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();move(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();move(current-1);}});window.addEventListener('resize',interrupt);pageCleanup.push(()=>{clearTimeout(timer);window.removeEventListener('resize',interrupt);});
  section.append(heading,rail,pages);main.append(section);sync();
}
function renderArticles(){
  const section=element('section','secondary-page articles-page'),heading=element('div','page-heading');heading.append(element('h1','',ui('articles')));const layout=element('div','articles-layout'),aside=element('aside','article-categories'),nav=element('nav','article-category-list');nav.setAttribute('aria-label',language==='zh'?'文章栏目':'Article categories');nav.addEventListener('scroll',()=>{articleScrollLeft=nav.scrollLeft;},{passive:true});
  for(const category of[{id:'',label:ui('all')},...content.articleCategories]){const button=element('button');button.type='button';button.dataset.category=category.id;button.setAttribute('aria-pressed',String(articleCategory===category.id));const copy=element('span');copy.append(element('strong','',txt(category.label)));if(category.description)copy.append(element('small','',txt(category.description)));button.append(copy,element('span','article-category-count',String(content.articles.filter(article=>!category.id||article.category===category.id).length)));button.addEventListener('click',()=>{articleCategory=category.id;rerenderPage(false);$(`.article-category-list button[data-category="${category.id}"]`)?.focus({preventScroll:true});});nav.append(button);}aside.append(nav);
  const results=element('div','article-results'),toolbar=element('div','article-toolbar'),filtered=content.articles.filter(article=>!articleCategory||article.category===articleCategory).sort((a,b)=>(articleOrder==='desc'?-1:1)*a.date.localeCompare(b.date));const count=element('span','',`${filtered.length} ${ui('articleCount')}`);count.setAttribute('aria-live','polite');const sort=element('button','article-sort',ui(articleOrder==='desc'?'newest':'oldest'));sort.type='button';sort.setAttribute('aria-label',ui('dateSort'));sort.prepend(icon('sort'));sort.addEventListener('click',()=>{articleOrder=articleOrder==='desc'?'asc':'desc';rerenderPage(false);$('.article-sort')?.focus({preventScroll:true});});toolbar.append(count,sort);
  const list=element('div','article-card-list');for(const article of filtered){const link=element('a','article-card');link.href=safeUrl(article.url);link.target='_blank';link.rel='noopener noreferrer';const cover=coverFor(article);cover.classList.add('article-cover');const copy=element('div','article-card-copy'),category=content.articleCategories.find(item=>item.id===article.category);copy.append(element('span','category-label',txt(category?.label||article.category)),element('h2','',txt(article.title)));const bottom=element('div','article-card-bottom'),time=element('time','',article.date),read=element('span','',ui('read'));time.dateTime=article.date;read.append(icon('external'));bottom.append(time,read);copy.append(bottom);link.append(cover,copy);list.append(link);}if(!filtered.length)list.append(element('p','empty-state',ui('emptyArticles')));results.append(toolbar,list);layout.append(aside,results);section.append(heading,layout);$('#page-content').append(section);nav.scrollLeft=articleScrollLeft;
}
function renderExperience(){
  const section=element('section','secondary-page experience-page'),layout=element('div','experience-layout'),intro=element('div','experience-intro');intro.append(element('h1','',ui('experience')));if(content.about)intro.append(element('p','',txt(content.about)));if(content.availability){const status=element('div','experience-status');status.append(icon('experience'),element('span','',txt(content.availability)));intro.append(status);}
  const timeline=element('div','experience-timeline'),list=element('div','experience-list');for(const item of content.experiences){const article=element('article'),heading=element('div','experience-item-heading');heading.append(element('h2','',txt(item.institution)),element('time','',txt(item.year)));article.append(heading,element('h3','',txt(item.title)),element('p','',txt(item.description)));list.append(article);}if(!content.experiences.length)list.append(element('p','empty-state',ui('emptyExperience')));timeline.append(list);
  if(content.honors?.length){const honors=element('details','honors'),summary=element('summary','',ui('honors')),awards=element('ul');summary.append(icon('down'));awards.append(...content.honors.map(item=>element('li','',txt(item))));honors.append(summary,awards);timeline.append(honors);}layout.append(intro,timeline);section.append(layout);if(content.demo)section.append(element('p','demo-disclosure',ui('demo')));$('#page-content').append(section);
}
function renderContact(){
  const section=element('section','secondary-page contact-page'),title=element('h1','',content.contactTitle?txt(content.contactTitle):ui('hello'));title.append(document.createTextNode(' ;-)'));section.append(title,element('p','',content.contactIntro?txt(content.contactIntro):ui('contactIntro')));
  if(content.email){const email=element('a','contact-email');email.href=`mailto:${content.email}`;email.append(element('span','email-label','Email'),element('span','',content.email),icon('external'));section.append(email);}
  const links=element('nav','contact-links');links.setAttribute('aria-label',language==='zh'?'社交链接':'Social links');for(const item of content.links){const link=element('a');link.href=safeUrl(item.url);link.target='_blank';link.rel='noopener noreferrer';if(item.color)link.style.setProperty('--link-color',item.color);link.append(icon(item.icon||'external'),element('span','',txt(item.label)));links.append(link);}section.append(links);
  const location=element('div','contact-location');location.append(element('span','micro',ui('based')),element('span','',txt(content.location)));section.append(location);$('#page-content').append(section);
}
function renderIsland(){
  const tabs=$('#island-tabs');tabs.querySelectorAll('a').forEach(a=>a.remove());const items=[['work','grid'],['articles','article'],['experience','experience'],['contact','message']];
  for(const[name,iconName]of items){const link=element('a');link.href='#'+name;link.dataset.route=name;link.append(icon(iconName),element('span','',ui(name)));tabs.append(link);}updateIsland();
}
function updateIsland(){
  const expanded=!['home','work'].includes(route)||scrollY>100;$('.island').classList.toggle('is-expanded',expanded);$('.bottom-dock')?.classList.toggle('is-expanded',expanded);
  const selected=['articles','experience','contact'].includes(route)?route:'work',index=['work','articles','experience','contact'].indexOf(selected);$('.island-active').style.transform=`translateX(${index*100}%)`;$('#island-tabs').querySelectorAll('a').forEach(link=>{if(link.dataset.route===selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
}
function rerenderPage(scroll=true){clearPage();if(['home','work'].includes(route))renderHome();else if(route==='articles')renderArticles();else if(route==='experience')renderExperience();else renderContact();updateIsland();if(scroll)window.scrollTo({top:0,behavior:'instant'});}
window.addEventListener('hashchange',()=>{
  const next=readRoute();if(dialog.open)finishProject(false);
  if(['home','work'].includes(next)&&['home','work'].includes(route)){route=next;if(next==='work')scrollToWork();else window.scrollTo({top:0,behavior:behavior()});updateIsland();return;}
  transition(()=>{route=next;rerenderPage(true);if(next==='work')requestAnimationFrame(scrollToWork);});
});
$('#back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:behavior()}));$('#island-cue').addEventListener('click',()=>go('work'));window.addEventListener('scroll',updateIsland,{passive:true});
$('#language-switch').addEventListener('click',()=>{if(!content)return;transition(()=>{language=language==='zh'?'en':'zh';renderIdentity();rerenderPage(false);});});$('#theme-switch').addEventListener('click',()=>{themeManualUntil=nextThemeBoundary();transition(()=>applyTheme(currentTheme==='light'?'dark':'light'));});
function syncAutomaticTheme(){
  clearTimeout(themeTimer);
  const now=new Date();
  if(themeManualUntil&&now.getTime()>=themeManualUntil)themeManualUntil=0;
  if(!themeManualUntil&&currentTheme!==automaticTheme(now))transition(()=>applyTheme(automaticTheme(now)));
  themeTimer=setTimeout(syncAutomaticTheme,Math.max(20,nextThemeBoundary(now)-now.getTime()+20));
}
applyTheme(automaticTheme());syncAutomaticTheme();
setInterval(syncAutomaticTheme,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncAutomaticTheme();});

function pushOutside(box,source,width,height) {
  const dx=box.left+box.width/2-(source.left+source.width/2),dy=box.top+box.height/2-(source.top+source.height/2);
  if(Math.abs(dx)/Math.max(1,width)>Math.abs(dy)/Math.max(1,height))return {x:dx<0?-box.left-box.width-32:width-box.left+32,y:dy*.12};
  return {x:dx*.12,y:dy<0?-box.top-box.height-32:height-box.top+32};
}
function perceptibleElements(source) {
  const candidates=[...document.querySelectorAll('.site-header,.hero h1,.category-button,.selected-card,.selected-pages,.section-heading,.project-card,.site-footer,.bottom-dock,.island,.music-anchor')].filter(node=>{
    if(node===source||node.contains(source)||source?.contains(node))return false;
    const box=node.getBoundingClientRect(),style=getComputedStyle(node);
    if(box.width<1||box.height<1||box.bottom<=0||box.top>=innerHeight||box.right<=0||box.left>=innerWidth||style.visibility==='hidden'||style.display==='none'||Number(style.opacity)===0)return false;
    let left=Math.max(0,box.left),right=Math.min(innerWidth,box.right),top=Math.max(0,box.top),bottom=Math.min(innerHeight,box.bottom);
    for(let parent=node.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
      const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
      if(style.overflowX!=='visible'){left=Math.max(left,bounds.left);right=Math.min(right,bounds.right);}
      if(style.overflowY!=='visible'){top=Math.max(top,bounds.top);bottom=Math.min(bottom,bounds.bottom);}
    }
    return right>left&&bottom>top;
  });
  return candidates.filter(node=>!candidates.some(other=>other!==node&&other.contains(node)));
}
function pushSurroundings(button) {
  const source=button.closest('.project-card')||button,sourceBox=source.getBoundingClientRect();
  pushedElements=perceptibleElements(source).map(node=>{const style=getComputedStyle(node);return {node,box:node.getBoundingClientRect(),transform:style.transform,opacity:style.opacity};});
  sourceVisibility={node:source,value:source.style.getPropertyValue('visibility'),priority:source.style.getPropertyPriority('visibility')};source.style.setProperty('visibility','hidden','important');
  for(const item of pushedElements){
    const movement=pushOutside(item.box,sourceBox,innerWidth,innerHeight),base=item.transform==='none'?'':item.transform;
    previewAnimations.push(item.node.animate([{transform:item.transform,opacity:item.opacity},{transform:`translate3d(${movement.x}px,${movement.y}px,0) ${base}`,opacity:0}],{duration:reducedMotion.matches?0:340,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}));
  }
}
function transformBetween(source,target) {
  return `translate(${source.left-target.left}px,${source.top-target.top}px) scale(${Math.max(.01,source.width/Math.max(1,target.width))},${Math.max(.01,source.height/Math.max(1,target.height))})`;
}
function transformFromOrigin() {
  const source=trigger?.isConnected?trigger.getBoundingClientRect():origin;
  return source?transformBetween(source,{left:card.offsetLeft,top:card.offsetTop,width:card.offsetWidth,height:card.offsetHeight}):'translateY(12px) scale(.97)';
}
function galleryArrow(label,path) {
  const button=element('button','gallery-arrow');button.type='button';button.setAttribute('aria-label',label);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
  const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',path);svg.append(line);button.append(svg);return button;
}
function renderGallery(media,project,images) {
  media.classList.add('is-gallery');
  const gallery=element('div','preview-gallery');gallery.tabIndex=0;gallery.setAttribute('role','group');gallery.setAttribute('aria-roledescription','carousel');gallery.setAttribute('aria-label',`${txt(project.title)} ${language==='zh'?'图片':'images'}`);
  const stage=element('div','gallery-stage'),slot=element('div','gallery-image-slot');
  const previous=galleryArrow(ui('previousImage'),'m14 6-6 6 6 6'),next=galleryArrow(ui('nextImage'),'m10 6 6 6-6 6');previous.classList.add('gallery-previous');next.classList.add('gallery-next');
  const progress=element('div','gallery-progress'),pages=element('nav','gallery-pages'),count=element('span','gallery-count');pages.setAttribute('aria-label',ui('chooseImage'));count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');
  let current=0,activeImage=null,switchAnimation=null;
  const buttons=images.map((_,index)=>{const button=element('button');button.type='button';button.setAttribute('aria-label',language==='zh'?`查看第${index+1}张图片，共${images.length}张`:`Show image ${index+1} of ${images.length}`);button.append(element('span'));button.addEventListener('click',()=>show(index));return button;});
  function show(index,animate=true) {
    const nextIndex=Math.max(0,Math.min(images.length-1,index));
    if(activeImage&&nextIndex===current)return;
    const userSwitch=animate&&activeImage!==null, direction=nextIndex>current?1:-1;
    current=nextIndex;
    switchAnimation?.cancel();
    const image=element('img','gallery-image');activeImage=image;image.draggable=false;image.addEventListener('dragstart',event=>event.preventDefault());image.alt=`${txt(project.title)} — ${current+1} of ${images.length}`;image.decoding='async';image.loading='eager';slot.dataset.state='loading';slot.setAttribute('aria-busy','true');
    let revealed=false;
    const ready=()=>{
      if(activeImage!==image||revealed)return;revealed=true;slot.dataset.state='ready';slot.setAttribute('aria-busy','false');
      if(userSwitch&&!reducedMotion.matches&&typeof slot.animate==='function')switchAnimation=slot.animate([{filter:'blur(8px)',transform:`translateX(${direction*8}px)`,opacity:.65},{offset:.45,filter:'blur(3px)',transform:`translateX(${direction*2}px)`,opacity:1},{filter:'blur(0px)',transform:'translateX(0)',opacity:1}],{duration:380,easing:'cubic-bezier(.2,.65,.3,1)'});
    };
    image.addEventListener('load',ready,{once:true});image.addEventListener('error',()=>{if(activeImage!==image)return;slot.dataset.state='failed';slot.setAttribute('aria-busy','false');slot.replaceChildren(element('p','gallery-error',ui('imageFailed')));},{once:true});
    image.src=images[current];slot.replaceChildren(image);if(image.complete&&image.naturalWidth>0)ready();
    previous.disabled=current===0;next.disabled=current===images.length-1;count.textContent=`${current+1} / ${images.length}`;
    buttons.forEach((button,index)=>{if(index===current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
  }
  previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  gallery.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    const index=event.key==='ArrowLeft'?current-1:event.key==='ArrowRight'?current+1:event.key==='Home'?0:event.key==='End'?images.length-1:null;
    if(index===null)return;event.preventDefault();show(index);if(buttons.includes(event.target))buttons[current].focus({preventScroll:true});
  });
  attachGallerySwipe(stage,direction=>show(current+direction),event=>event.pointerType!=='mouse'||matchMedia('(max-width:760px)').matches);
  previous.hidden=next.hidden=images.length<2;pages.append(...buttons);progress.append(pages,count);stage.append(slot,previous,next);gallery.append(stage,progress);media.append(gallery);show(0,false);
}
function renderDemo(media,project,url) {
  media.classList.add('is-demo');
  const stage=element('div','demo-stage'),placeholder=coverFor(project),status=element('span','demo-status',ui('loadingDemo')),frame=element('iframe');
  placeholder.classList.add('demo-placeholder');placeholder.setAttribute('aria-hidden','true');status.setAttribute('role','status');
  frame.title=`${project.title} demo`;frame.src=url;frame.loading='eager';frame.allowFullscreen=true;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups');
  frame.addEventListener('load',()=>{stage.dataset.ready='true';placeholder.remove();status.remove();},{once:true});
  frame.addEventListener('error',()=>{status.textContent=ui('demoFailed');},{once:true});stage.append(placeholder,status,frame);media.append(stage);
}
function openProject(project,button) {
  project={...project,title:txt(project.title),summary:txt(project.summary),detail:txt(project.detail),category:categoryLabel(project.category),role:txt(project.role)};
  if(dialog.open)return; trigger=button; origin=button.getBoundingClientRect(); pageTop=scrollY; pageLeft=scrollX; previousOverflow=document.body.style.overflow; closing=false;dialog.classList.remove('is-closing');
  const media=$('.preview-media'), info=$('.preview-info'); media.replaceChildren();media.classList.remove('is-video','is-demo','is-gallery');media.setAttribute('aria-label',language==='zh'?'作品媒体':'Project media');info.replaceChildren();
  const images=(project.gallery||[]).map(path=>safeUrl(path,true)).filter(Boolean), video=safeUrl(project.video,true), demo=safeUrl(project.demo,true);
  if(video && /\.(mp4|webm|ogg)([?#]|$)/i.test(video)) { media.classList.add('is-video');const player=element('video'); player.src=video; player.controls=true; player.playsInline=true;player.autoplay=false;player.preload='metadata'; if(project.cover) player.poster=safeUrl(project.cover,true); player.addEventListener('play',()=>window.dispatchEvent(new CustomEvent('site:media-start'))); media.append(player); }
  else if(demo) renderDemo(media,project,demo);
  else if(images.length) renderGallery(media,project,images);
  else { const cover=coverFor(project); cover.classList.add('preview-art'); cover.append(element('span','preview-art-title',project.title)); media.append(cover); }
  if(project.date){const date=element('time','category-label preview-date',project.date);date.dateTime=project.date;info.append(date);}
  const title=element('h2','',project.title); title.id='preview-title'; info.append(element('p','category-label',project.category),title,element('p','preview-summary',project.summary),element('p','preview-story',project.detail));
  if(project.role){const facts=element('div','preview-facts');facts.append(element('h3','',ui('role')),element('p','',project.role));info.append(facts);}
  const url=safeUrl(project.url)||demo||video; if(url){ const link=element('a','project-link',ui('open')); link.href=url; link.target='_blank'; link.rel='noopener noreferrer'; info.append(link); }
  pushSurroundings(button);
  document.body.style.overflow='hidden'; dialog.showModal(); media.scrollTop=0; info.scrollTop=0; $('#preview-close').focus({preventScroll:true});
  if(!reducedMotion.matches) {
    previewAnimations.push(card.animate([{transform:transformFromOrigin(),opacity:.4},{transform:'none',opacity:1}],{duration:340,easing:'cubic-bezier(.22,1,.36,1)'}));
  }
}
function finishProject(restoreFocus=true) {
  if(!dialog.open)return;
  previewAnimations.forEach(animation=>animation.cancel());previewAnimations=[];pushedElements=[];
  $('.preview-media').replaceChildren();
  if(sourceVisibility){const item=sourceVisibility;if(item.value)item.node.style.setProperty('visibility',item.value,item.priority);else item.node.style.removeProperty('visibility');sourceVisibility=null;}
  dialog.close();document.body.style.overflow=previousOverflow;closing=false;dialog.classList.remove('is-closing');
  if(restoreFocus){window.scrollTo({top:pageTop,left:pageLeft,behavior:'instant'});if(trigger?.isConnected)trigger.focus({preventScroll:true});}
}
function closeProject() {
  if(!dialog.open||closing)return;closing=true;dialog.classList.add('is-closing');
  if(reducedMotion.matches){finishProject();return;}
  const cardStyle=getComputedStyle(card),startTransform=cardStyle.transform,startOpacity=cardStyle.opacity;
  const starts=pushedElements.map(item=>{const style=getComputedStyle(item.node);return {transform:style.transform,opacity:style.opacity};});
  previewAnimations.forEach(animation=>animation.cancel());previewAnimations=[];
  pushedElements.forEach((item,index)=>{if(item.node.isConnected)previewAnimations.push(item.node.animate([starts[index],{transform:item.transform,opacity:item.opacity}],{duration:260,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}));});
  const animation=card.animate([{transform:startTransform,opacity:startOpacity},{transform:transformFromOrigin(),opacity:0}],{duration:260,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});previewAnimations.push(animation);animation.finished.then(()=>finishProject(),()=>finishProject());
}
window.addEventListener('pagehide',()=>finishProject(false));
$('#preview-close').addEventListener('click',closeProject); dialog.addEventListener('cancel',event=>{event.preventDefault();closeProject();}); dialog.addEventListener('click',event=>{if(event.target===dialog)closeProject();});

try {
  const response=await fetch(new URL('./content.json',import.meta.url));
  if(!response.ok)throw Error('Content request failed');
  content=validateContent(await response.json());language=content.defaultLanguage;route=readRoute();
  const dock=element('div','bottom-dock');$('.island').before(dock);dock.append($('.island'));
  music=createMusic(content.music,{dock,element,icon,txt,ui,language:()=>language,reducedMotion,safeUrl,backToTop:()=>window.scrollTo({top:0,behavior:behavior()})});
  renderIdentity();rerenderPage(true);if(route==='work')requestAnimationFrame(scrollToWork);
} catch(error) {
  $('#page-content').replaceChildren(element('p','startup-status',ui('loadFailed')));console.error(error);
}
