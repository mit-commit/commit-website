    function toYear(val) {
  return typeof val === "string" ? parseInt(val, 10) : val;
}

/* assets/js/pubs.js — ES5, generates BibTeX + localizes PDFs/slides */
(function (global) {
  'use strict';

  var PUBS = {};
  var JSON_PATH_DEFAULT = 'data/publications.json';

  /* ---------- Fetch JSON ---------- */
  function getJSON(path, cb, eb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try { cb(JSON.parse(xhr.responseText)); }
        catch (e) { eb && eb(new Error('Bad JSON: ' + e.message)); }
      } else {
        eb && eb(new Error('HTTP ' + xhr.status + ' loading ' + path));
      }
    };
    xhr.send();
  }

  /* ---------- URL localization for site-hosted PDFs/Slides ---------- */
  // If something is under groups.csail.mit.edu/commit/papers/... or presentations/...
  // rewrite to local "papers/..." or "presentations/..."
function localizeAssetURL(url) {
  if (!url) return '';
  try {
    // Already relative? leave it
    if (/^(?:\.{1,2}\/|\/?(?:papers|presentations)\/)/i.test(url)) return url;

    // Normalize and capture after (optional) 'commit/' + (papers|presentations)/...
    // Works for both groups.csail.mit.edu/commit/... and commit.csail.mit.edu/...
    var m = url.match(/^https?:\/\/[^/]+\/(?:commit\/)?(papers|presentations)\/(.+)$/i);
    if (m) return m[1].toLowerCase() + '/' + m[2];

    // Otherwise, do not rewrite
    return url;
  } catch (_e) {
    return url;
  }
}

  /* ---------- Field helpers ---------- */
  function firstDefined() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  }
  function authorsOf(it)  { return firstDefined(it.author0, it.authors, it.author); }
  function venueOf(it)    { return firstDefined(it.journal, it.booktitle, it.series, it.type, it.publisher); }
  function locationOf(it) { return firstDefined(it.location, it.address); }
  function titleOf(it)    { return it.title || 'Untitled'; }
  function monthOf(it)    { return it.month ? String(it.month) : ''; }
  function yearOf(it)     { return it.year ? String(it.year) : ''; }

  /* ---------- BibTeX generation ---------- */
  function bibtexKeyOf(it) {
    if (it.bibtexKey) return it.bibtexKey;
    // fallback: title-year slug
    var t = (it.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '');
    return t.slice(0, 24) + (it.year ? it.year : '');
  }

  function escBib(s) {
    if (!s) return '';
    // Keep simple; wrap title later in braces to preserve capitalization
    return s.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
  }

  function pushLine(out, k, v) {
    if (!v) return;
    out.push('  ' + k + ' = {' + v + '},');
  }

  function buildBibtex(it) {
    var typ = it.itemType || 'misc';
    var key = bibtexKeyOf(it);

    // Compose a URL preferring localized PDF if available
    var url = localizeAssetURL(it.url) || '';
    var slides = localizeAssetURL(it.slides || '');

    var out = [];
    out.push('@' + typ + '{' + key + ',');
    pushLine(out, 'author',  escBib(authorsOf(it)));
    pushLine(out, 'title',   '{' + escBib(titleOf(it)) + '}'); // keep caps
    pushLine(out, 'booktitle', escBib(it.booktitle || ''));
    pushLine(out, 'journal', escBib(it.journal || ''));
    pushLine(out, 'series',  escBib(it.series || ''));
    pushLine(out, 'publisher', escBib(it.publisher || ''));
    pushLine(out, 'school',  escBib(it.school || ''));
    pushLine(out, 'address', escBib(locationOf(it)));
    pushLine(out, 'location', escBib(locationOf(it))); // some styles prefer 'location'
    pushLine(out, 'month',   escBib(monthOf(it)));
    pushLine(out, 'year',    escBib(yearOf(it)));
    pushLine(out, 'volume',  escBib(it.volume || ''));
    pushLine(out, 'number',  escBib(it.issue || it.number || ''));
    pushLine(out, 'pages',   escBib(it.pages || ''));
    pushLine(out, 'doi',     escBib(it.doi || ''));
    pushLine(out, 'keywords',escBib(it.keywords || ''));
    pushLine(out, 'url',     escBib(url));
    if (slides) pushLine(out, 'note', 'Slides: ' + slides);
    // trim final comma of last field line
    if (out.length > 1) {
      var last = out[out.length - 1];
      out[out.length - 1] = last.replace(/,+\s*$/, '');
    }
    out.push('}');
    return out.join('\n');
  }

  function makeBibDownloadLink(it) {
    var a = document.createElement('a');
    a.className = 'pub-action';
    a.textContent = 'BibTeX';
    var bib = buildBibtex(it);
    var blob = new Blob([bib], { type: 'text/plain' });
    a.href = URL.createObjectURL(blob);
    a.download = bibtexKeyOf(it) + '.bib';
    // optional: revoke after click to avoid blob leaks
    a.addEventListener('click', function () {
      var href = a.href;
      setTimeout(function () { URL.revokeObjectURL(href); }, 2000);
    });
    return a;
  }

  /* ---------- Rendering ---------- */
  function textNode(s) { return document.createTextNode(s || ''); }

  function renderItem(it) {
    var li = document.createElement('li');
    li.className = 'pub-item';

    var localPDF = localizeAssetURL(it.url || '');
    var titleLine = document.createElement('div');
    titleLine.className = 'pub-title';
    if (localPDF) {
      var a = document.createElement('a');
      a.href = localPDF; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(textNode(titleOf(it)));
      titleLine.appendChild(a);
    } else {
      titleLine.appendChild(textNode(titleOf(it)));
    }
    titleLine.appendChild(textNode('.'));
    li.appendChild(titleLine);

    var authors = authorsOf(it);
    if (authors) {
      var authorsLine = document.createElement('div');
      authorsLine.className = 'pub-authors';
      authorsLine.appendChild(textNode(authors + '.'));
      li.appendChild(authorsLine);
    }

    var venue = venueOf(it);
    if (venue) {
      var venueLine = document.createElement('div');
      venueLine.className = 'pub-venue';
      venueLine.appendChild(textNode(venue + '.'));
      li.appendChild(venueLine);
    }

    var metaLine = document.createElement('div');
    metaLine.className = 'pub-meta';
    var loc = locationOf(it);
    var bits = [];
    if (loc) bits.push(loc + '.');
    if (it.month) bits.push(String(it.month) + ',');
    if (it.year)  bits.push(String(it.year) + '.');
    if (bits.length) metaLine.appendChild(textNode(bits.join(' ') + ' '));

    // Actions: BibTeX + Slides
    metaLine.appendChild(makeBibDownloadLink(it));

    var slides = localizeAssetURL(it.slides || '');
    if (slides) {
      metaLine.appendChild(textNode(' '));
      var sA = document.createElement('a');
      sA.href = slides; sA.target = '_blank'; sA.rel = 'noopener';
      sA.className = 'pub-action';
      sA.appendChild(textNode('Slides'));
      metaLine.appendChild(sA);
    }

    li.appendChild(metaLine);

    if (it.price) {
      var price = document.createElement('div');
      price.className = 'pub-price';
      price.appendChild(textNode(it.price));
      li.appendChild(price);
    }

    return li;
  }

  function renderList(mount, items) {
    if (!mount) return;
    var ul = document.createElement('ul');
    ul.className = 'pub-list';
    for (var i = 0; i < items.length; i++) {
      ul.appendChild(renderItem(items[i]));
    }
    mount.innerHTML = '';
    mount.appendChild(ul);
  }


  /* ---------- Public API ---------- */
  PUBS.loadAndRender = function (opts) {
    var path = (opts && opts.jsonPath) || JSON_PATH_DEFAULT;
    getJSON(path, function (arr) {
      var featured = [];
      var all = [];
      for (var i = 0; i < arr.length; i++) {
        var it = arr[i];
          all.push(it);
	  console.log(it);
        if (it.price || it.featured) featured.push(it); // feature rule: has price
      }
	featured.sort((a, b) => toYear(b.year) - toYear(a.year));
	console.log(featured);
	console.log("hi")
      if (opts && opts.filterFn) all = opts.filterFn(all) || all;
      if (opts && opts.mountAll)      renderList(opts.mountAll, all);
      if (opts && opts.mountFeatured) renderList(opts.mountFeatured, featured);
    }, function (err) {
      if (opts && opts.mountAll)      opts.mountAll.textContent = 'Failed to load publications: ' + err.message;
      if (opts && opts.mountFeatured) opts.mountFeatured.textContent = 'Failed to load featured publications: ' + err.message;
      if (window.console) console.error(err);
    });
  };

  global.PUBS = PUBS;
})(this);
