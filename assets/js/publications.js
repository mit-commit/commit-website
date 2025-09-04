/* Publications page controller — ES5, dynamic counts, compact UI */
/* === BibTeX generation (local, ES5) === */
// --- Safe URL localizer shim (works even if pubs.js isn't loaded) ---
var localizeURL = (window.PUBS && typeof PUBS.localizeAssetURL === 'function')
  ? function(u){ try { return PUBS.localizeAssetURL(u); } catch (e) { return u || ''; } }
    : function(u){ return u || ''; };

function bibtexKeyOf(it){
  if (it.bibtexKey) return it.bibtexKey;
  var t = (it.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return t.slice(0,24) + (it.year ? it.year : '');
}
function escBib(s){
  if (!s) return '';
  return String(s).replace(/[\n\r]+/g,' ').replace(/\s+/g,' ');
}
function firstDefined(){
  for (var i=0;i<arguments.length;i++){ var v=arguments[i]; if (v!==undefined && v!==null && v!=='') return v; }
  return '';
}
function venueOf(it){ return firstDefined(it.journal, it.booktitle, it.series, it.type, it.publisher); }
function locationOf(it){ return firstDefined(it.location, it.address); }
function titleOf(it){ return it.title || 'Untitled'; }

// Normalize item type for dedupe (fallback 'misc')
function normalizeType(t){
  return String(t || 'misc').replace(/\s+/g, ' ').trim().toLowerCase();
}

/* ===== Title & Author normalization ===== */

// Normalize title for dedup (case/space insensitive)
function normalizeTitle(s){
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Turn "Last, First [Middle]" into "First [Middle] Last"
function normalizeAuthorName(name){
  var t = String(name || '').trim();
  if (!t) return '';
  // If there's a comma, treat as "Last, First…"
  var comma = t.indexOf(',');
  if (comma >= 0){
    var last  = t.slice(0, comma).trim();
    var first = t.slice(comma + 1).trim();
    if (first) return first + ' ' + last;
    return last;
  }
  return t; // already "First Last"
}

// Tokenize authors string safely.
// Prefer " and " separators (BibTeX); if none, pair up "Last, First" by commas.
function _tokenizeAuthors(raw){
  var s = String(raw || '').trim();
  if (!s) return [];

  // If it contains ' and ', split on that (common BibTeX style)
  if (/\band\b/i.test(s)){
    return s.split(/\s+\band\b\s+/i).map(function(x){ return x.trim(); }).filter(Boolean);
  }

  // Fallback: try to pair "Last, First, Last, First, ..." by commas
  var parts = s.split(/\s*,\s*/);
  var out = [], i;
  for (i = 0; i < parts.length; i += 2){
    if (i + 1 < parts.length) out.push(parts[i] + ', ' + parts[i+1]);
    else out.push(parts[i]); // odd tail, keep as-is
  }
  return out;
}

// Public: list of normalized author display names ("First Last")
function listNormalizedAuthorsFromString(s){
  var toks = _tokenizeAuthors(s);
  var out = [], i, n;
  for (i = 0; i < toks.length; i++){
    n = normalizeAuthorName(toks[i]);
    if (n) out.push(n);
  }
  return out;
}

// Convenience: from item
function listNormalizedAuthors(it){
  var a = firstDefined(it.author0, it.authors, it.author);
  return listNormalizedAuthorsFromString(a);
}

// First author (normalized)
function firstAuthorOf(it){
  var arr = listNormalizedAuthors(it);
  return arr.length ? arr[0] : '';
}


// Human-friendly labels for itemType keys
var TYPE_LABELS = {
  inproceedings: 'Conference Pub',
  article: 'Journal Article',
  mastersthesis: 'M.Eng. Thesis',
  phdthesis: 'PhD Thesis',
  techreport: 'Tech Report',
  book: 'Book',
  incollection: 'Book Chapter',
    misc: 'Other',
    'sciencethesis': "SM Thesis",
};
function typeLabel(k){
  k = (k || 'misc').toLowerCase().trim();
  return TYPE_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1));
}



function venueOf(it){ return firstDefined(it.journal, it.booktitle, it.series, it.type, it.publisher); }
function monthNum(s){
  if(!s) return 0;
  var m = String(s).slice(0,3).toLowerCase();
  var map = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  return map[m] || 0;
}

function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function makeSorter(key){
  // returns a function(a,b) for within-year sorting
  if (key === 'title')       return function(a,b){ return cmp((a.title||'').toLowerCase(), (b.title||'').toLowerCase()); };
  if (key === 'venue')       return function(a,b){ return cmp((venueOf(a)||'').toLowerCase(), (venueOf(b)||'').toLowerCase()); };
  if (key === 'firstAuthor') return function(a,b){ return cmp((firstAuthorOf(a)||'').toLowerCase(), (firstAuthorOf(b)||'').toLowerCase()); };
  if (key === 'type')        return function(a,b){ return cmp((a.itemType||'misc').toLowerCase(), (b.itemType||'misc').toLowerCase()); };
  if (key === 'month')       return function(a,b){ return cmp(monthNum(a.month), monthNum(b.month)); };
  return null; // default order (as in data) within year
}



function buildBibtex(it, localizeURLFn){
  var typ = it.itemType || 'misc';
  var key = bibtexKeyOf(it);
  var out = [];
  out.push('@' + typ + '{' + key + ',');

  function pushLine(k, v){ if (v) out.push('  ' + k + ' = {' + v + '},'); }

  var url = localizeURLFn ? localizeURLFn(it.url || '') : (it.url || '');
  var slides = localizeURLFn ? localizeURLFn(it.slides || '') : (it.slides || '');

  pushLine('author',    escBib(firstDefined(it.author0, it.authors, it.author)));
  pushLine('title',     '{' + escBib(titleOf(it)) + '}');
  pushLine('booktitle', escBib(it.booktitle || ''));
  pushLine('journal',   escBib(it.journal || ''));
  pushLine('series',    escBib(it.series || ''));
  pushLine('publisher', escBib(it.publisher || ''));
  pushLine('school',    escBib(it.school || ''));
  pushLine('address',   escBib(locationOf(it)));
  pushLine('location',  escBib(locationOf(it)));
  pushLine('month',     escBib(it.month || ''));
  pushLine('year',      escBib(it.year || ''));
  pushLine('volume',    escBib(it.volume || ''));
  pushLine('number',    escBib(it.issue || it.number || ''));
  pushLine('pages',     escBib(it.pages || ''));
  pushLine('doi',       escBib(it.doi || ''));
  pushLine('keywords',  escBib(it.keywords || ''));
  pushLine('url',       escBib(url));
  if (slides) pushLine('note', 'Slides: ' + slides);

  // drop trailing comma
  if (out.length > 1) out[out.length-1] = out[out.length-1].replace(/,+\s*$/, '');
  out.push('}');
  return out.join('\n');
}

function createBibLink(it){
  var a = document.createElement('a');
  a.className = 'pub-action';
  a.textContent = 'BibTeX';
  var bib = buildBibtex(it, localizeURL);
  var blob = new Blob([bib], {type:'text/plain'});
  a.href = URL.createObjectURL(blob);
  a.download = bibtexKeyOf(it) + '.bib';
  a.addEventListener('click', function(){
    var href = a.href;
    setTimeout(function(){ URL.revokeObjectURL(href); }, 1500);
  });
  return a;
}


(function () {
  'use strict';

  var JSON_PATH = 'data/publications.json';

  var state = {
    mode: 'interactive',     // 'noninteractive' | 'interactive'
    years: {},                  // map of selected year -> true
    titleQuery: '',
    keywords: {},               // map of selected keyword -> true
    authors: {},                // map of selected author -> true
    types: {},                  // map of selected itemType -> true
    scroll: {                   // range-controlled scroll positions (0..1)
      keywords: 0,
      authors: 0,
      types: 0
    },
      sortKey: 'none',   // 'none' | 'title' | 'venue' | 'firstAuthor' | 'type' | 'month'
      sortDesc: false,

  };

  var els = {
    errors: document.getElementById('pubs-errors'),
    results: document.getElementById('pubs-results'),
    filtersInteractive: document.getElementById('filters-interactive'),
    btnClear: document.getElementById('btn-clear'),
    years: document.getElementById('facet-years'),
    title: document.getElementById('facet-title'),
    kwBox: document.getElementById('facet-keywords'),
    auBox: document.getElementById('facet-authors'),
      tyBox: document.getElementById('facet-types'),
      sortKey: document.getElementById('sort-key'),
      sortDesc: document.getElementById('sort-desc')

  };

  var DATA = [];  // raw array

  /* ---------- Small helpers ---------- */
  function text(s){ return document.createTextNode(s || ''); }
  function firstDefined(){ for(var i=0;i<arguments.length;i++){ var v=arguments[i]; if(v!==undefined&&v!==null&&v!=='') return v; } return ''; }
  function authorsOf(it){ return firstDefined(it.author0, it.authors, it.author); }
  function titleOf(it){ return it.title || 'Untitled'; }
  function venueOf(it){ return firstDefined(it.journal, it.booktitle, it.series, it.type, it.publisher); }
  function locationOf(it){ return firstDefined(it.location, it.address); }
  function splitAuthors(s){
    if(!s) return [];
    var parts = s.split(/\s+and\s+|,/i), out=[], i, p;
    for(i=0;i<parts.length;i++){ p = parts[i].trim(); if(p) out.push(p); }
    return out;
  }
  function splitKeywords(s){
    if(!s) return [];
    var parts = s.split(/[,;]+/), out=[], i, p;
    for(i=0;i<parts.length;i++){ p = parts[i].trim(); if(p) out.push(p); }
    return out;
  }

  // If pubs.js is loaded, reuse its localizer and bib link; else graceful fallback
  var localizeURL = (window.PUBS && PUBS.localizeAssetURL) ? function(u){ try{return PUBS.localizeAssetURL(u);}catch(_){return u;} } : function(u){ return u; };
  var makeBibLink = (window.PUBS && PUBS.makeBibDownloadLink) ? PUBS.makeBibDownloadLink : function(){ var a=document.createElement('span'); return a; };

  /* ---------- Build static UI shells (kept; content dynamic) ---------- */

  // Year grid entries and their count badges
  var yearBtnMap = {}; // year -> {btn, badgeNode}

  function buildYearGrid(yearValuesSortedDesc) {
    els.years.innerHTML = '';
    yearBtnMap = {};
    for (var i=0;i<yearValuesSortedDesc.length;i++){
      var y = String(yearValuesSortedDesc[i]);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'year-btn';
      btn.setAttribute('data-year', y);
      btn.appendChild(text(y));
      // space + badge
      btn.appendChild(text(' '));
      var badge = document.createElement('span');
      badge.className = 'year-badge';
      badge.appendChild(text('0'));
      btn.appendChild(badge);

      btn.onclick = (function(yy){
        return function(){
          state.years[yy] = !state.years[yy];
          applyFilters();
        };
      })(y);

      yearBtnMap[y] = { btn: btn, badge: badge.firstChild };
      els.years.appendChild(btn);
    }
  }

function buildFacetBox(list, mount, facetKey, stateMap, labelFor) {
  mount.innerHTML = '';

  var scrollWrap = document.createElement('div');   // the element that scrolls
  scrollWrap.className = 'facet-scroll';

  var listEl = document.createElement('div');       // tall inner list
  listEl.className = 'facet-items';
  scrollWrap.appendChild(listEl);

  // Build checkboxes
  var itemMap = {}; // value -> { cb, textNode }
  for (var i = 0; i < list.length; i++) {
    var value = list[i];                 // canonical filter value (e.g., itemType key)
    var labelText = labelFor ? labelFor(value) : value;  // pretty label

    var label = document.createElement('label');
    label.className = 'facet-item';

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = value;

    var txt = document.createElement('span');
    txt.className = 'facet-text';
    var textNodeValue = document.createTextNode(labelText + ' (0)');
    txt.appendChild(textNodeValue);
    txt.title = labelText; // show full label on hover (handles truncation)

    cb.onchange = (function (val, map) {
      return function () { map[val] = !!this.checked; applyFilters(); };
    })(value, stateMap);

    label.appendChild(cb);
    label.appendChild(txt);
    listEl.appendChild(label);

    itemMap[value] = { cb: cb, textNode: textNodeValue, labelText: labelText };
  }

  mount.appendChild(scrollWrap);

  // Stash references for dynamic count updates
  mount._facet = { listEl: listEl, itemMap: itemMap, scrollWrap: scrollWrap, key: facetKey, labelFor: labelFor || null };
}


  /* ---------- Rendering one publication (same look as index) ---------- */
  function renderItem(it){
    var li = document.createElement('li');
    li.className = 'pub-item';

    var localPDF = localizeURL(it.url || '');

    var t = document.createElement('div');
    t.className = 'pub-title';
    if (localPDF) {
      var a = document.createElement('a');
      a.href = localPDF; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(text(titleOf(it)));
      t.appendChild(a);
    } else {
      t.appendChild(text(titleOf(it)));
    }
    t.appendChild(text('.'));
    li.appendChild(t);

    var auth = authorsOf(it);
    if (auth){ var al = document.createElement('div'); al.className = 'pub-authors'; al.appendChild(text(auth + '.')); li.appendChild(al); }

    var ven = venueOf(it);
    if (ven){ var vl = document.createElement('div'); vl.className = 'pub-venue'; vl.appendChild(text(ven + '.')); li.appendChild(vl); }

    var meta = document.createElement('div'); meta.className = 'pub-meta';
    var loc = locationOf(it), bits=[];
    if (loc) bits.push(loc + '.');
    if (it.month) bits.push(String(it.month) + ',');
    if (it.year)  bits.push(String(it.year) + '.');
    if (bits.length) meta.appendChild(text(bits.join(' ') + ' '));
    // Bib + Slides
      meta.appendChild(makeBibLink(it));
      meta.appendChild(createBibLink(it));

    var slides = localizeURL(it.slides || '');
    if (slides) { meta.appendChild(text(' ')); var sA=document.createElement('a'); sA.href=slides; sA.target='_blank'; sA.rel='noopener'; sA.className='pub-action'; sA.appendChild(text('Slides')); meta.appendChild(sA); }
    li.appendChild(meta);

    if (it.price){ var pr=document.createElement('div'); pr.className='pub-price'; pr.appendChild(text(it.price)); li.appendChild(pr); }

    return li;
  }

function renderList(mount, items){
  // Group items by year (string), with 0/unknown at end as "Other"
  var groups = {};
  for (var i=0;i<items.length;i++){
    var y = items[i].year ? String(items[i].year) : 'Other';
    if (!groups[y]) groups[y] = [];
    groups[y].push(items[i]);
  }

  // Sort year buckets: numeric desc, "Other" last
  var years = Object.keys(groups).sort(function(a,b){
    if (a==='Other' && b!=='Other') return 1;
    if (b==='Other' && a!=='Other') return -1;
    var ai = parseInt(a,10)||0, bi = parseInt(b,10)||0;
    return bi - ai;
  });

  // Sort within each year by selected key (optional)
  var sorter = makeSorter(state.sortKey);
  var dir = state.sortDesc ? -1 : 1;

  var container = document.createElement('div');
  for (var yi=0; yi<years.length; yi++){
    var y = years[yi];
    var section = document.createElement('div');

    var h = document.createElement('h3');
    h.textContent = y;
    section.appendChild(h);

    var arr = groups[y].slice();
    if (sorter) arr.sort(function(a,b){ return dir * sorter(a,b); });

    var ul = document.createElement('ul'); ul.className = 'pub-list';
    for (var j=0; j<arr.length; j++) ul.appendChild(renderItem(arr[j]));
    section.appendChild(ul);

    container.appendChild(section);
  }

  mount.innerHTML = '';
  mount.appendChild(container);
}


  /* ---------- Filtering & Dynamic counts ---------- */

  // Returns items filtered by current state, optionally excluding one facet ("years"|"keywords"|"authors"|"types")
  function filteredItems(excludeFacet){
    var items = DATA.slice();

    // Title
    var q = state.titleQuery.replace(/\s+/g,' ').trim().toLowerCase();
    if (q) {
      items = items.filter(function(it){
        return (it.title||'').toLowerCase().indexOf(q) >= 0;
      });
    }

    // Years
    if (excludeFacet !== 'years') {
      var yKeys = keysSelected(state.years);
      if (yKeys.length){
        items = items.filter(function(it){ return it.year && yKeys.indexOf(String(it.year)) >= 0; });
      }
    }

    // Keywords
    if (excludeFacet !== 'keywords') {
      var kwKeys = keysSelected(state.keywords);
      if (kwKeys.length){
        items = items.filter(function(it){
          var kws = splitKeywords(it.keywords || '');
          for (var i=0;i<kws.length;i++) if (kwKeys.indexOf(kws[i]) >= 0) return true;
          return false;
        });
      }
    }

    // Authors
    if (excludeFacet !== 'authors') {
// Authors (OR within facet)
var auKeys = keysSelected(state.authors);
if (auKeys.length){
  items = items.filter(function (it) {
    var as = listNormalizedAuthors(it);   // <-- normalized
    for (var i = 0; i < as.length; i++) if (auKeys.indexOf(as[i]) >= 0) return true;
    return false;
  });
}

    }

    // Types
    if (excludeFacet !== 'types') {
      var tyKeys = keysSelected(state.types);
      if (tyKeys.length){
        items = items.filter(function(it){
          var t = it.itemType || 'misc';
          return tyKeys.indexOf(t) >= 0;
        });
      }
    }

    return items;
  }

  function keysSelected(map){
    var out=[], k;
    for (k in map) if (map[k]) out.push(k);
    return out;
  }

  function updateDynamicCounts(){
    // Years (exclude its own selections)
    var itemsY = filteredItems('years'), yCounts = {}, i;
    for (i=0;i<itemsY.length;i++){
      var y = itemsY[i].year ? String(itemsY[i].year) : '';
      if (y) yCounts[y] = (yCounts[y]||0) + 1;
    }
    // update year badges + active class
    for (var yKey in yearBtnMap){
      var badgeNode = yearBtnMap[yKey].badge;
	badgeNode.nodeValue = ' (' + String(yCounts[yKey] || 0) + ')';

      yearBtnMap[yKey].btn.className = state.years[yKey] ? 'year-btn active' : 'year-btn';
    }

    // Keywords
    var itemsK = filteredItems('keywords'), kCounts = {}, j;
    for (i=0;i<itemsK.length;i++){
      var kws = splitKeywords(itemsK[i].keywords || '');
      for (j=0;j<kws.length;j++) kCounts[kws[j]] = (kCounts[kws[j]]||0) + 1;
    }
    updateFacetCounts(els.kwBox, 'keywords', kCounts, state.keywords);

    // Authors
// Authors dynamic counts
var itemsA = filteredItems('authors'), aCounts = {};
for (i = 0; i < itemsA.length; i++){
  var as = listNormalizedAuthors(itemsA[i]);  // <-- normalized
  for (j = 0; j < as.length; j++) aCounts[as[j]] = (aCounts[as[j]] || 0) + 1;
}
updateFacetCounts(els.auBox, 'authors', aCounts, state.authors);


    // Types
var itemsT = filteredItems('types'), tCounts = {};
for (i = 0; i < itemsT.length; i++){
  var t = (itemsT[i].itemType || 'misc').toLowerCase().trim();
  tCounts[t] = (tCounts[t] || 0) + 1;
}
updateFacetCounts(els.tyBox, 'types', tCounts, state.types);

  }

function updateFacetCounts(mount, facetKey, countsMap, stateMap) {
  var facet = mount._facet;
  if (!facet) return;

  var itemMap = facet.itemMap;
  for (var val in itemMap) {
    var cnt = countsMap[val] || 0;
    var display = facet.labelFor ? facet.labelFor(val) : val;
    itemMap[val].textNode.nodeValue = display + ' (' + cnt + ')';

    var disabled = (cnt === 0) && !stateMap[val];
    itemMap[val].cb.disabled = disabled;
    itemMap[val].cb.parentNode.className = disabled ? 'facet-item disabled' : 'facet-item';
    itemMap[val].cb.checked = !!stateMap[val];
  }
}

  function applyFilters(){
    // recompute dynamic counts first (so user sees availability)
    updateDynamicCounts();

    // then produce final result set (include all active facets)
    var items = filteredItems(null);

    // sort by year desc, stable
    items.sort(function(a,b){
      var ay = a.year ? parseInt(a.year,10) : 0;
      var by = b.year ? parseInt(b.year,10) : 0;
      if (ay !== by) return by - ay;
      return 0;
    });

    renderList(els.results, items);

    // interactive panel visibility
    els.filtersInteractive.className = (state.mode === 'interactive') ? 'filters-interactive' : 'filters-interactive hidden';
  }

  function clearAll(){
    state.years = {};
    state.titleQuery = '';
    state.keywords = {};
    state.authors = {};
    state.types = {};
    state.scroll = { keywords:0, authors:0, types:0 };
    if (els.title) els.title.value = '';
    applyFilters();
  }

  /* ---------- Boot ---------- */
  function boot(){
    // Mode toggle
    var radios = document.querySelectorAll('input[name=mode]');
    for (var i=0;i<radios.length;i++){
      radios[i].onchange = function(){ state.mode = this.value; applyFilters(); };
    }

    // Title search
    els.title.oninput = function(){ state.titleQuery = els.title.value || ''; applyFilters(); };

    // Clear
      els.btnClear.onclick = function(){ clearAll(); };

function downloadText(filename, text){
  var blob = new Blob([text], {type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 0);
}

// Ensure the button exists; if not, create it in the filter row
var btnExport = document.getElementById('btn-export-bib') || (function(){
  var row = document.querySelector('.filter-row');
  if (!row) return null;
  var b = document.createElement('button');
  b.id = 'btn-export-bib';
  b.type = 'button';
  b.className = 'btn';
  b.textContent = 'Export .bib';
  row.appendChild(b);
  return b;
})();

if (btnExport) {
  btnExport.onclick = function(){
    // Export exactly what’s currently shown
 var items = filteredItems(null);

// Group by year like the UI
var byYear = {};
for (var i=0;i<items.length;i++){
  var y = items[i].year ? String(items[i].year) : 'Other';
  if (!byYear[y]) byYear[y] = [];
  byYear[y].push(items[i]);
}
var years = Object.keys(byYear).sort(function(a,b){
  if (a==='Other' && b!=='Other') return 1;
  if (b==='Other' && a!=='Other') return -1;
  var ai = parseInt(a,10)||0, bi = parseInt(b,10)||0;
  return bi - ai;
});

// Within-year sort same as UI
var sorter = makeSorter(state.sortKey);
var dir = state.sortDesc ? -1 : 1;

var out = [], yi, y;
for (yi=0; yi<years.length; yi++){
  y = years[yi];
  var arr = byYear[y].slice();
  if (sorter) arr.sort(function(a,b){ return dir * sorter(a,b); });

  for (var k=0; k<arr.length; k++){
    out.push(buildBibtex(arr[k], localizeURL));
    if (yi !== years.length-1 || k !== arr.length-1) out.push('\n\n');
  }
}

downloadText('commit-publications.bib', out.join(''));

  };
}

      // Sort controls
if (els.sortKey) els.sortKey.onchange = function(){
  state.sortKey = els.sortKey.value || 'none';
  applyFilters();
};
if (els.sortDesc) els.sortDesc.onchange = function(){
  state.sortDesc = !!els.sortDesc.checked;
  applyFilters();
};



    // Load JSON
    var xhr = new XMLHttpRequest();
    xhr.open('GET', JSON_PATH, true);
    xhr.onreadystatechange = function(){
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300){
        try {
            DATA = JSON.parse(xhr.responseText);

	    // --- Dedupe by normalized title ---
// --- Dedupe by normalized (title + type) ---
// Prefer the entry that has a URL (PDF) or DOI; otherwise keep first seen.
(function(){
  var bestByKey = Object.create(null);
  var order = []; // preserve overall order for stable output

  function isBetter(a, b){
    // Return true if a is better than b
    var aHasPdf = !!(a && a.url);
    var bHasPdf = !!(b && b.url);
    if (aHasPdf !== bHasPdf) return aHasPdf;

    var aHasDoi = !!(a && a.doi);
    var bHasDoi = !!(b && b.doi);
    if (aHasDoi !== bHasDoi) return aHasDoi;

    // (optional) prefer one with slides
    var aHasSlides = !!(a && a.slides);
    var bHasSlides = !!(b && b.slides);
    if (aHasSlides !== bHasSlides) return aHasSlides;

    return false; // otherwise don't replace
  }

  for (var i = 0; i < DATA.length; i++){
    var it = DATA[i];
    var key = normalizeTitle(it.title) + '|' + normalizeType(it.itemType);
    if (!bestByKey[key]) {
      bestByKey[key] = it;
      order.push(key);
    } else if (isBetter(it, bestByKey[key])) {
      bestByKey[key] = it;
    }
  }

  var dedup = [];
  for (var j = 0; j < order.length; j++){
    dedup.push(bestByKey[order[j]]);
  }
  DATA = dedup;
})();



          // YEARS: compute global list first (unique, desc)
          var ySet = {}, i;
          for (i=0;i<DATA.length;i++){ if (DATA[i].year) ySet[String(DATA[i].year)] = 1; }
          var years = []; for (var k in ySet) years.push(parseInt(k,10));
          years.sort(function(a,b){ return b-a; });
          buildYearGrid(years);

            // Facets static lists (values only; counts dynamic)
            var kwSet = {}, auSet = {};
            for (i=0;i<DATA.length;i++){
		var it = DATA[i], j;
		var kws = splitKeywords(it.keywords || '');
		for (j=0;j<kws.length;j++) kwSet[kws[j]] = 1;
		var aus = listNormalizedAuthors(it);
		for (j=0;j<aus.length;j++) auSet[normalizeAuthorName(aus[j])] = 1;
            }
	    // Types (canonical keys), values sorted by pretty label
	    var tySet = {}, i;
	    for (i = 0; i < DATA.length; i++){
		var ty = (DATA[i].itemType || 'misc').toLowerCase().trim();
		tySet[ty] = 1;
	    }
	    var tyVals = Object.keys(tySet).sort(function(a,b){ return typeLabel(a).localeCompare(typeLabel(b)); });

	    // Build types facet; pass labelFor so UI shows friendly names but values remain canonical
	    buildFacetBox(tyVals, els.tyBox, 'types', state.types, typeLabel);

          var kwVals = Object.keys(kwSet).sort(function(a,b){ return a.localeCompare(b); });
          var auVals = Object.keys(auSet).sort(function(a,b){ return a.localeCompare(b); });


          buildFacetBox(kwVals, els.kwBox, 'keywords', state.keywords);
          buildFacetBox(auVals, els.auBox, 'authors', state.authors);

          applyFilters(); // initial render and dynamic counts
        } catch (e) {
          els.errors.textContent = 'Failed to parse publications.json: ' + e.message;
        }
      } else {
        els.errors.textContent = 'HTTP ' + xhr.status + ' loading ' + JSON_PATH;
      }
    };
    xhr.send();
  }

  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
