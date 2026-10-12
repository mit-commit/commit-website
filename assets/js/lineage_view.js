/* Interactive lineage map, shown in the Lineage popup on COMMIT papers
   (lineage_panel.js).
     LINEAGE_VIEW.load(slug)            -> Promise of data/lineage/<slug>.json (cached)
     new LINEAGE_VIEW.View(container, data) -> a live map inside container
       view.setFocus(nodeId|null)       pre-select a paper (red outline on COMMIT papers)
       view.setLines(bool)              with nothing selected: show all lines (true) or none (false)
       view.q / view.deep / view.apply() search text, "chains only" filter
       view.onstats = function(shown, total) {}
   Hover a paper: show it and light up its ancestors and descendants.
   Click a paper: open it. Click a legend entry: hide/show that kind of link.
   Click an empty spot: clear the selection. */
var LINEAGE_VIEW = (function () {
  'use strict';
  var BASE = 'data/lineage/', cache = {}, tip = null;
  var HOW = { 'extends': 'Extends it', 'uses-tool': 'Uses it as a tool', 'adopts-idea': 'Adopts the idea', 'root': 'COMMIT paper' };

  function E(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function trackSafe(n, d) { try { if (typeof track === 'function') track(n, d); } catch (e) {} }
  function load(slug) {
    if (!cache[slug]) {
      cache[slug] = fetch(BASE + slug + '.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + slug + '.json');
        return r.json();
      });
      cache[slug].catch(function () { delete cache[slug]; });
    }
    return cache[slug];
  }
  function tipEl() {
    if (!tip) {
      tip = document.getElementById('lin-tip');
      if (!tip) { tip = document.createElement('div'); tip.id = 'lin-tip'; tip.className = 'lin-tip'; document.body.appendChild(tip); }
    }
    return tip;
  }
  function placeTip(ev) {
    var t = tipEl(), x = ev.clientX + 16, y = ev.clientY + 16;
    if (x + 440 > window.innerWidth) x = ev.clientX - 446;
    if (y + t.offsetHeight > window.innerHeight) y = ev.clientY - t.offsetHeight - 10;
    t.style.left = Math.max(4, x) + 'px'; t.style.top = Math.max(4, y) + 'px';
  }
  function tipHTML(d, n) {
    var par = (d.par[n.id] || []).map(function (p) { return d.nodes[p].title; });
    var kids = (d.kid[n.id] || []).length;
    var h = '<b>' + E(n.title) + '</b><div class="m">' + E(n.venue) + (n.year ? ' · ' + n.year : '') +
      (n.gen ? ' · generation ' + n.gen : '') + ' · ' + E(HOW[n.how] || n.how) + (n.cited ? ' · ' + n.cited + ' citations' : '') + '</div>';
    if (n.authors) h += '<div class="m">' + E(n.authors) + '</div>';
    if (par.length) h += '<div class="r"><span class="m">builds on</span> ' + E(par.slice(0, 2).join('; ')) +
      (par.length > 2 ? ' (+' + (par.length - 2) + ')' : '') + '</div>';
    if (kids) h += '<div class="r"><span class="m">built on by</span> ' + kids + ' paper' + (kids > 1 ? 's' : '') + ' in this map</div>';
    if (n.evidence && n.evidence.charAt(0) !== '(') h += '<q>\u201c' + E(n.evidence) + '\u201d</q>';
    h += '<div class="r m">Click to open the paper.</div>';
    return h;
  }

  function View(container, d) {
    var self = this;
    this.c = container; this.d = d; this.hover = null; this.focus = null;
    this.hidden = {}; this.q = ''; this.deep = false; this.onstats = null; this.lines = true;
    var wrap = document.createElement('div');
    wrap.innerHTML = d.svg;
    this.svg = wrap.querySelector('svg');
    container.appendChild(this.svg);
    container.addEventListener('mouseover', function (ev) {
      var el = ev.target.closest && ev.target.closest('.nd'); if (!el) return;
      var n = d.nodes[el.getAttribute('data-id')];
      self.hover = n.id; self.apply();
      var t = tipEl(); t.innerHTML = tipHTML(d, n); t.style.display = 'block'; placeTip(ev);
    });
    container.addEventListener('mousemove', function (ev) { if (tipEl().style.display === 'block') placeTip(ev); });
    container.addEventListener('mouseout', function (ev) {
      if (ev.target.closest && ev.target.closest('.nd')) { self.hover = null; tipEl().style.display = 'none'; self.apply(); }
    });
    container.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest('.nd');
      if (el) {
        var n = d.nodes[el.getAttribute('data-id')];
        trackSafe('lineage-open', { line: d.line, id: n.id });
        if (n.url) window.open(n.url, '_blank', 'noopener');
        return;
      }
      var lg = ev.target.closest && ev.target.closest('.lg');
      if (lg) {
        var h = lg.getAttribute('data-how'); self.hidden[h] = !self.hidden[h];
        container.querySelectorAll('.lg[data-how="' + h + '"]').forEach(function (x) { x.style.opacity = self.hidden[h] ? 0.3 : 1; });
        self.apply();
        return;
      }
      if (self.focus && ev.target.closest && ev.target.closest('svg')) { self.focus = null; self.apply(); }
    });
    this.apply();
  }
  View.prototype.setLines = function (on) { this.lines = !!on; this.apply(); };
  // The selected paper, what it builds on (up) and what builds on it (down).
  // Descendants stop at another COMMIT paper: it lights up, its own descendants belong to its own map.
  View.prototype.family = function (id) {
    var d = this.d, up = {}, down = {}, keep = {};
    up[id] = down[id] = keep[id] = 1;
    (function u(x) { (d.par[x] || []).forEach(function (p) { if (!up[p]) { up[p] = keep[p] = 1; u(p); } }); })(id);
    (function w(x) { (d.kid[x] || []).forEach(function (k) {
      if (!down[k]) { down[k] = keep[k] = 1; if (d.nodes[k].gen !== 0) w(k); } }); })(id);
    keep.up = up; keep.down = down;
    return keep;
  };
  View.prototype.setFocus = function (id) {
    this.focus = (id && this.d.nodes[id]) ? id : null;
    this.apply();
    return this.focus;
  };
  View.prototype.nodeEl = function (id) {
    var els = this.svg.querySelectorAll('.nd');
    for (var i = 0; i < els.length; i++) if (els[i].getAttribute('data-id') === id) return els[i];
    return null;
  };
  View.prototype.apply = function () {
    var d = this.d, self = this, q = (this.q || '').trim().toLowerCase();
    var sel = this.hover || this.focus, keep = sel ? this.family(sel) : null, shown = 0;
    this.svg.querySelectorAll('.nd').forEach(function (el) {
      var n = d.nodes[el.getAttribute('data-id')];
      var vis = !self.hidden[n.how] && (!self.deep || n.chain);
      el.classList.toggle('dim', !(vis && (!keep || keep[n.id])));
      el.classList.toggle('sel', n.id === sel);
      var hit = q && (n.title.toLowerCase().indexOf(q) >= 0 || (n.authors || '').toLowerCase().indexOf(q) >= 0);
      el.classList.toggle('hit', !!hit);
      if (vis && n.gen > 0) shown++;
    });
    this.svg.querySelectorAll('.ring').forEach(function (r) {        // generation-2+ rings follow their paper
      var n = d.nodes[r.getAttribute('data-id')];
      var vis = !self.hidden[n.how] && (!self.deep || n.chain);
      r.classList.toggle('dim', !(vis && (!keep || keep[n.id])));
    });
    this.svg.querySelectorAll('.edges path').forEach(function (p) {
      var a = p.getAttribute('data-a'), b = d.nodes[p.getAttribute('data-b')];
      var vis = !self.hidden[b.how] && (!self.deep || b.gen >= 2);
      // only links on a path through the selected paper light up
      var hot = keep && ((keep.down[a] && keep.down[b.id] && (a === sel || d.nodes[a].gen !== 0)) ||
                         (keep.up[a] && keep.up[b.id]));
      p.style.display = (vis && (keep || self.lines)) ? '' : 'none';
      p.classList.toggle('hot', !!hot);
      p.classList.toggle('dim', !!keep && !hot);
    });
    if (this.onstats) this.onstats(shown, d.count);
  };

  return { load: load, View: View };
})();
