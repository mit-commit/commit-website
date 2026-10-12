/* Lineage page: which later papers build on COMMIT research lines.
   Data: data/lineage/index.json (list of lines) and data/lineage/<slug>.json
   (pre-laid-out SVG + node/edge data), written offline — see data/lineage/README.md.
   Hover a paper: show it and light up its ancestors and descendants
   (a selected COMMIT paper gets a red outline). Click: open the paper.
   URL: lineage.html?line=<slug>&focus=<node id> pre-selects a paper. */
(function () {
  'use strict';
  var BASE = 'data/lineage/';
  var LINES = {}, cur = null, hoverId = null, focusId = null, hidden = {};
  var els = {};

  function E(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function trackSafe(name, data) { try { if (typeof track === 'function') track(name, data); } catch (e) {} }
  function getJSON(path) {
    return fetch(BASE + path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + path);
      return r.json();
    });
  }
  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }
  function svgOf() { return els.mount.querySelector('svg.lin[data-line="' + cur + '"]'); }

  function family(id) {
    var d = LINES[cur], keep = {};
    keep[id] = 1;
    (function up(x) { (d.par[x] || []).forEach(function (p) { if (!keep[p]) { keep[p] = 1; up(p); } }); })(id);
    (function down(x) { (d.kid[x] || []).forEach(function (k) { if (!keep[k]) { keep[k] = 1; down(k); } }); })(id);
    return keep;
  }

  function apply() {
    var s = svgOf(); if (!s) return;
    var d = LINES[cur];
    var q = els.q.value.trim().toLowerCase();
    var deep = els.deep.checked;
    var sel = hoverId || focusId;
    var keep = sel ? family(sel) : null, shown = 0;
    s.querySelectorAll('.nd').forEach(function (el) {
      var n = d.nodes[el.getAttribute('data-id')];
      var vis = !hidden[n.how] && (!deep || n.chain);
      el.classList.toggle('dim', !(vis && (!keep || keep[n.id])));
      el.classList.toggle('sel', n.id === sel);
      var hit = q && (n.title.toLowerCase().indexOf(q) >= 0 || (n.authors || '').toLowerCase().indexOf(q) >= 0);
      el.classList.toggle('hit', !!hit);
      if (vis && n.gen > 0) shown++;
    });
    s.querySelectorAll('.edges path').forEach(function (p) {
      var a = p.getAttribute('data-a'), b = d.nodes[p.getAttribute('data-b')];
      var vis = !hidden[b.how] && (!deep || b.gen >= 2);
      var hot = keep && keep[a] && keep[b.id];
      p.style.display = vis ? '' : 'none';
      p.classList.toggle('hot', !!hot);
      p.classList.toggle('dim', !!keep && !hot);
    });
    els.stats.textContent = shown + ' of ' + d.count + ' descendant papers shown';
  }

  function tipHTML(n) {
    var d = LINES[cur];
    var how = { 'extends': 'Extends it', 'uses-tool': 'Uses it as a tool', 'adopts-idea': 'Adopts the idea',
                'root': 'COMMIT paper' }[n.how] || n.how;
    var par = (d.par[n.id] || []).map(function (p) { return d.nodes[p].title; });
    var kids = (d.kid[n.id] || []).length;
    var h = '<b>' + E(n.title) + '</b><div class="m">' + E(n.venue) + (n.year ? ' · ' + n.year : '') +
      (n.gen ? ' · generation ' + n.gen : '') + ' · ' + E(how) + (n.cited ? ' · ' + n.cited + ' citations' : '') + '</div>';
    if (n.authors) h += '<div class="m">' + E(n.authors) + '</div>';
    if (par.length) h += '<div class="r"><span class="m">builds on</span> ' + E(par.slice(0, 2).join('; ')) +
      (par.length > 2 ? ' (+' + (par.length - 2) + ')' : '') + '</div>';
    if (kids) h += '<div class="r"><span class="m">built on by</span> ' + kids + ' paper' + (kids > 1 ? 's' : '') + ' in this map</div>';
    if (n.evidence && n.evidence.charAt(0) !== '(') h += '<q>\u201c' + E(n.evidence) + '\u201d</q>';
    else if (n.gen === 1) h += '<div class="r m">Link from this site\u2019s citation classification.</div>';
    h += '<div class="r m">Click to open the paper.</div>';
    return h;
  }

  function placeTip(ev) {
    var t = els.tip, x = ev.clientX + 16, y = ev.clientY + 16;
    if (x + 440 > window.innerWidth) x = ev.clientX - 446;
    if (y + t.offsetHeight > window.innerHeight) y = ev.clientY - t.offsetHeight - 10;
    t.style.left = Math.max(4, x) + 'px'; t.style.top = Math.max(4, y) + 'px';
  }

  function setFocus(id) {
    focusId = id;
    if (id && LINES[cur].nodes[id]) {
      els.focus.innerHTML = 'Showing what builds on <b>' + E(LINES[cur].nodes[id].title) +
        '</b> &nbsp;<a href="#" id="lin-clear">show everything</a>';
      els.focus.style.display = 'block';
    } else {
      focusId = null; els.focus.style.display = 'none';
    }
    apply();
  }

  function show(slug) {
    cur = slug;
    els.tabs.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-line') === slug); });
    var ready = LINES[slug] ? Promise.resolve(LINES[slug]) : getJSON(slug + '.json').then(function (d) {
      LINES[slug] = d;
      var wrap = document.createElement('div');
      wrap.innerHTML = d.svg;
      els.mount.appendChild(wrap.firstElementChild || wrap.firstChild);
      return d;
    });
    return ready.then(function () {
      els.mount.querySelectorAll('svg.lin').forEach(function (s) {
        s.style.display = s.getAttribute('data-line') === slug ? 'block' : 'none';
      });
      hoverId = null; setFocus(null);
      if (history.replaceState) history.replaceState(null, '', '?line=' + encodeURIComponent(slug));
    });
  }

  function boot() {
    els = { tabs: document.getElementById('lin-tabs'), mount: document.getElementById('lin-mount'),
            q: document.getElementById('lin-q'), deep: document.getElementById('lin-deep'),
            stats: document.getElementById('lin-stats'), tip: document.getElementById('lin-tip'),
            focus: document.getElementById('lin-focus'), method: document.getElementById('lin-method'),
            err: document.getElementById('lin-errors') };
    getJSON('index.json').then(function (idx) {
      els.method.textContent = idx.method || '';
      idx.lines.forEach(function (l) {
        var b = document.createElement('button');
        b.className = 'tab'; b.setAttribute('data-line', l.slug);
        b.textContent = l.title.replace(/ lineage$/, '') + ' (' + l.count + ')';
        els.tabs.appendChild(b);
      });
      var want = param('line'), f = param('focus'), first = idx.lines[0].slug;   // read before show() rewrites the URL
      var slug = idx.lines.some(function (l) { return l.slug === want; }) ? want : first;
      return show(slug).then(function () {
        if (f && LINES[cur].nodes[f]) {
          setFocus(f);
          if (history.replaceState) history.replaceState(null, '', '?line=' + encodeURIComponent(cur) + '&focus=' + encodeURIComponent(f));
          var el = svgOf().querySelector('.nd[data-id="' + (window.CSS && CSS.escape ? CSS.escape(f) : f) + '"]');
          if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', inline: 'center' });
        }
      });
    }).catch(function (e) { els.err.textContent = 'Could not load the lineage data (' + e.message + ').'; });

    els.mount.addEventListener('mouseover', function (ev) {
      var el = ev.target.closest && ev.target.closest('.nd'); if (!el) return;
      var n = LINES[cur].nodes[el.getAttribute('data-id')];
      hoverId = n.id; apply();
      els.tip.innerHTML = tipHTML(n); els.tip.style.display = 'block'; placeTip(ev);
    });
    els.mount.addEventListener('mousemove', function (ev) { if (els.tip.style.display === 'block') placeTip(ev); });
    els.mount.addEventListener('mouseout', function (ev) {
      if (ev.target.closest && ev.target.closest('.nd')) { hoverId = null; els.tip.style.display = 'none'; apply(); }
    });
    els.mount.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest('.nd');
      if (el) {
        var n = LINES[cur].nodes[el.getAttribute('data-id')];
        trackSafe('lineage-open', { line: cur, id: n.id });
        if (n.url) window.open(n.url, '_blank', 'noopener');
        return;
      }
      var lg = ev.target.closest && ev.target.closest('.lg');
      if (lg) {
        var h = lg.getAttribute('data-how'); hidden[h] = !hidden[h];
        els.mount.querySelectorAll('.lg[data-how="' + h + '"]').forEach(function (x) { x.style.opacity = hidden[h] ? 0.3 : 1; });
        apply();
      }
    });
    els.tabs.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('.tab'); if (!b) return;
      trackSafe('lineage-tab', { line: b.getAttribute('data-line') });
      show(b.getAttribute('data-line'));
    });
    els.focus.addEventListener('click', function (ev) {
      if (ev.target.id === 'lin-clear') { ev.preventDefault(); setFocus(null);
        if (history.replaceState) history.replaceState(null, '', '?line=' + encodeURIComponent(cur)); }
    });
    els.q.addEventListener('input', apply);
    els.deep.addEventListener('change', apply);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
