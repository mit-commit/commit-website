(function () {
  'use strict';

  var LIST_ID  = 'projects-featured';
  var ERR_ID   = 'projects-errors';
  var XML_PATH = 'data/projects.xml';

  var listEl = document.getElementById(LIST_ID);
  var errEl  = document.getElementById(ERR_ID);
  if (!listEl) return;

  function showError(msg) {
    if (errEl) errEl.textContent = msg;
    if (window.console && console.error) console.error('[projects_featured] ' + msg);
  }

  function normalizeURL(url) {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    if (/^http:\/[^/]/i.test(url))  return url.replace(/^http:\//i, 'http://');
    if (/^https:\/[^/]/i.test(url)) return url.replace(/^https:\//i, 'https://');
    return 'https://' + String(url).replace(/^\/+/, '');
  }

  function textNode(s) { return document.createTextNode(s ? String(s) : ''); }

  function renderCard(obj) {
    var li = document.createElement('li');
    li.className = 'project-card';

    var a = document.createElement('a');
    a.className = 'project-title';
    a.href = normalizeURL(obj.url || '');
    a.target = '_blank';
    a.rel = 'noopener';
    a.appendChild(textNode(obj.name || 'Untitled'));

    var p = document.createElement('p');
    p.className = 'project-desc';
    p.appendChild(textNode(obj.desc || ''));

    li.appendChild(a);
    li.appendChild(p);
    return li;
  }

  function parseXML(xmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, 'application/xml');

    var perr = doc.getElementsByTagName('parsererror')[0];
    if (perr) throw new Error(perr.textContent || 'XML parse error');

    var nodes = doc.getElementsByTagName('project');
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      out.push({
        url:      n.getAttribute('url') || '',
        name:     n.getAttribute('name') || '',
        desc:     n.getAttribute('desc') || '',
        featured: n.getAttribute('featured') === '1'
      });
    }
    return out;
  }

  function renderFeatured(items) {
    // Keep original order; filter to featured only
    var featured = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].featured) featured.push(items[i]);
    }

    if (!featured.length) {
      showError('No featured projects found.');
      return;
    }

    var frag = document.createDocumentFragment();
    for (var j = 0; j < featured.length; j++) {
      frag.appendChild(renderCard(featured[j]));
    }
    listEl.appendChild(frag);
  }

  function cacheBust(path) {
    return path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + String(Date.now());
  }

  // Fetch XML and render
  if (typeof fetch === 'function') {
    fetch(cacheBust(XML_PATH), { cache: 'no-store' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status + ' loading ' + XML_PATH);
        return resp.text();
      })
      .then(function (txt) { return parseXML(txt); })
      .then(function (items) { renderFeatured(items); })
      .catch(function (err) { showError('Failed to load projects: ' + err.message); });
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', cacheBust(XML_PATH), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try { renderFeatured(parseXML(xhr.responseText)); }
        catch (e) { showError('Failed to parse XML: ' + e.message); }
      } else {
        showError('HTTP ' + xhr.status + ' loading ' + XML_PATH);
      }
    };
    xhr.send();
  }
})();
