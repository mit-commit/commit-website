/* "Lineage" panel on COMMIT papers that root a lineage map
   (data/lineage/papers.json). Sits next to the Citations and Repositories
   toggles: lists the papers that build on this one directly, and links to
   the paper's place on the Lineage page.
   Usage: LINEAGE_PANEL.attach(metaEl, bodyParent, bibtexKey) */
var LINEAGE_PANEL = (function () {
  'use strict';
  var DATA = null, waiting = [], SHOW = 12;
  var HOW = { 'extends': 'extends it', 'uses-tool': 'uses it as a tool', 'adopts-idea': 'adopts the idea', 'root': 'COMMIT paper' };

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.appendChild(document.createTextNode(String(txt)));
    return e;
  }
  function trackSafe(n, d) { try { if (typeof track === 'function') track(n, d); } catch (e) {} }

  fetch('data/lineage/papers.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (d) {
      DATA = (d && d.papers) || {};
      var w = waiting; waiting = [];
      w.forEach(function (a) { if (document.contains(a[0])) attach(a[0], a[1], a[2]); });
    });

  function renderPanel(div, entries) {
    div.innerHTML = '';
    entries.forEach(function (e) {
      var head = el('div', 'cite-row-meta');
      head.appendChild(document.createTextNode(e.direct.length + ' paper' + (e.direct.length === 1 ? '' : 's') +
        ' build on this paper directly' + (e.deeper ? ', and ' + e.deeper + ' more build on those' : '') + ' (' + e.title + '). '));
      var map = el('a', null, 'See it on the lineage map \u2192');
      map.href = 'lineage.html?line=' + encodeURIComponent(e.line) + '&focus=' + encodeURIComponent(e.focus);
      head.appendChild(map);
      div.appendChild(head);
      var ul = el('ul', 'cite-rows');
      function row(p) {
        var li = el('li', 'cite-row');
        var a = el('a', null, p.title); a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
        li.appendChild(a);
        li.appendChild(el('span', 'cite-row-meta', ' \u2014 ' + [p.venue, p.year].filter(Boolean).join(' ') +
          (HOW[p.how] ? ' \u00b7 ' + (p.root ? 'COMMIT paper' : HOW[p.how]) : '')));
        return li;
      }
      e.direct.slice(0, SHOW).forEach(function (p) { ul.appendChild(row(p)); });
      div.appendChild(ul);
      if (e.direct.length > SHOW) {
        var more = el('a', 'pub-action', 'Show all ' + e.direct.length); more.href = '#';
        more.addEventListener('click', function (ev) {
          ev.preventDefault(); e.direct.slice(SHOW).forEach(function (p) { ul.appendChild(row(p)); }); more.remove();
        });
        div.appendChild(more);
      }
    });
  }

  function attach(metaEl, bodyParent, key) {
    if (DATA === null) { waiting.push([metaEl, bodyParent, key]); return; }
    var entries = DATA[key]; if (!entries || !entries.length) return;
    var n = entries.reduce(function (s, e) { return s + e.direct.length + e.deeper; }, 0);
    var div = el('div', 'pub-summary cite-view');
    var toggle = el('a', 'pub-action pub-summary-toggle cite-toggle'); toggle.href = '#';
    function setArrow(open) { toggle.textContent = 'Lineage (' + n + ') ' + (open ? '\u25be' : '\u25b8'); }
    setArrow(false);
    var built = false;
    toggle.addEventListener('click', function (ev) {
      ev.preventDefault();
      var open = div.className.indexOf('open') === -1;
      div.className = 'pub-summary cite-view' + (open ? ' open' : '');
      if (open && !built) { renderPanel(div, entries); built = true; }
      setArrow(open);
      if (open) trackSafe('lineage-view', { key: key });
    });
    metaEl.appendChild(document.createTextNode(' '));
    metaEl.appendChild(toggle);
    bodyParent.appendChild(div);
  }

  return { attach: attach };
})();
