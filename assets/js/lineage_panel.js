/* "Lineage" link on COMMIT papers that root a lineage map (data/lineage/papers.json).
   Sits next to the Citations and Repositories toggles. Clicking it opens a popup
   window with the lineage map centred on this paper (red outline); hover a paper
   to see it, click to open it; click an empty spot to clear the selection. The
   "Show all lines" switch (remembered): off draws only the selected paper's lines.
   Esc, the close button, or a click outside closes it.
   Needs lineage_view.js (the map) loaded first.
   Usage: LINEAGE_PANEL.attach(metaEl, bodyParent, bibtexKey) */
var LINEAGE_PANEL = (function () {
  'use strict';
  var DATA = null, waiting = [], modal = null;

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

  // remembered "Show all lines" choice (default: on)
  function linesPref(set) {
    try {
      if (set !== undefined) localStorage.setItem('linLines', set ? '1' : '0');
      return localStorage.getItem('linLines') !== '0';
    } catch (e) { return set !== undefined ? !!set : true; }
  }

  function close() {
    if (!modal) return;
    modal.remove(); modal = null;
    document.body.style.overflow = '';
    var tip = document.getElementById('lin-tip'); if (tip) tip.style.display = 'none';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(ev) { if (ev.key === 'Escape') close(); }

  function open(entry) {
    close();
    modal = el('div', 'lin-modal');
    var box = el('div', 'lin-modal-box');
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    var x = el('button', 'lin-modal-close', '\u00d7'); x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', close);
    var bar = el('div', 'lin-modal-bar');
    var sw = el('label', 'lin-switch'), cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = linesPref();
    sw.appendChild(cb); sw.appendChild(el('span', 'lin-knob'));
    sw.appendChild(el('span', 'lin-switch-txt', 'Show all lines'));
    sw.title = 'Off: only the selected paper\u2019s lines. Click an empty spot on the map to clear the selection.';
    bar.appendChild(sw);
    var mapBox = el('div', 'lin-wrap');
    mapBox.appendChild(el('div', 'cite-loading', 'Loading the map\u2026'));
    box.appendChild(x); box.appendChild(bar); box.appendChild(mapBox); modal.appendChild(box);
    modal.addEventListener('click', function (ev) { if (ev.target === modal) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    LINEAGE_VIEW.load(entry.line).then(function (d) {
      if (!modal || !box.contains(mapBox)) return;
      mapBox.innerHTML = '';
      var v = new LINEAGE_VIEW.View(mapBox, d);
      v.lines = cb.checked;
      cb.addEventListener('change', function () { v.setLines(cb.checked); linesPref(cb.checked); });
      v.setFocus(entry.focus);
      var sel = v.nodeEl(entry.focus);                     // bring the paper into view
      if (sel && sel.getBoundingClientRect && box.scrollTo) {
        var r = sel.getBoundingClientRect(), b = box.getBoundingClientRect();
        box.scrollTo({ left: Math.max(0, r.left - b.left - b.width / 3), top: 0 });
      }
    }).catch(function (err) {
      mapBox.innerHTML = '';
      mapBox.appendChild(el('div', 'cite-loading', 'Could not load the map (' + err.message + ').'));
    });
    trackSafe('lineage-view', { line: entry.line, focus: entry.focus });
  }

  function attach(metaEl, bodyParent, key) {
    if (!window.LINEAGE_VIEW) return;
    if (DATA === null) { waiting.push([metaEl, bodyParent, key]); return; }
    var entries = DATA[key]; if (!entries || !entries.length) return;
    entries.forEach(function (e) {
      var n = e.direct.length + e.deeper;
      var a = el('a', 'pub-action pub-summary-toggle cite-toggle',
                 'Lineage (' + n + ')' + (entries.length > 1 ? ' \u2014 ' + e.title.replace(/ lineage$/, '') : ''));
      a.href = '#';
      a.title = n + ' papers build on this paper; opens the lineage map';
      a.addEventListener('click', function (ev) { ev.preventDefault(); open(e); });
      metaEl.appendChild(document.createTextNode(' '));
      metaEl.appendChild(a);
    });
  }

  return { attach: attach, close: close };
})();
