function logDebug(){ /* no-op in lite build */ }

function byLastName(a,b){
  const al=(a.name||'').split(/\s+/).slice(-1)[0].toLowerCase();
  const bl=(b.name||'').split(/\s+/).slice(-1)[0].toLowerCase();
  return al.localeCompare(bl);
}

function bucketFor(title){
  const t=(title||'').toLowerCase();
  if (t.includes('professor')) return 'faculty';
  if (t.includes('graduate')) return 'grad';
  if (t.includes('meng')) return 'meng';
  if (t.includes('urop')) return 'urop';
  if (t.includes('visiting')) return 'visiting';
  if (t.includes('postdoc')) return 'researchers';
  if (t.includes('research scientist') || t.includes('affiliate')) return 'researchers';
  return 'researchers';
}

function personLink(p){
  const url = p.url || p.oldurl || p.nourl;
  return url ? `<a href="${url}" target="_blank" rel="noopener">${p.name}</a>` : p.name;
}


function renderBucket(bucketEl, people) {
  if (!bucketEl) return;
  if (!people.length) return;

  // Make container grid with two ULs
  var container = document.createElement('div');
  container.className = 'grid2';
  var left = document.createElement('ul'); left.className = 'person';
  var right = document.createElement('ul'); right.className = 'person';
  container.appendChild(left); container.appendChild(right);

  // Split people into two columns
  people.forEach(function(p, i) {
    var li = document.createElement('li');
    li.className = 'person';
    li.innerHTML = '<strong>' + personLink(p) + '</strong>' + (p.title ? ' — ' + p.title : '');
    (i % 2 ? right : left).appendChild(li);
  });

  // Clear the original <ul> and replace with grid container
  bucketEl.innerHTML = '';
  bucketEl.appendChild(container);
}

(async function(){
  try {
    const xmlText = await getText('data/people.xml');
    const xml = new DOMParser().parseFromString(xmlText, 'application/xml');

    const current = Array.from(xml.querySelectorAll('current > person')).map(p=>({
      name: p.getAttribute('name'),
      title: p.getAttribute('title')||'',
      url: p.getAttribute('url'),
      oldurl: p.getAttribute('oldurl'),
      nourl: p.getAttribute('nourl')
    }));
    current.sort((a,b)=> (a.title||'').localeCompare(b.title||'') || byLastName(a,b));

    const buckets = {
      faculty:    document.getElementById('faculty'),
      researchers:document.getElementById('researchers'),
      grad:       document.getElementById('grad'),
      meng:       document.getElementById('meng'),
      urop:       document.getElementById('urop'),
      visiting:   document.getElementById('visiting')
    };

    // Group people by bucket
    var grouped = {};
    current.forEach(function(p){
      var key = bucketFor(p.title);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });

    // Render each bucket double-column
    for (var key in grouped) {
      renderBucket(buckets[key], grouped[key]);
    }

  } catch (error){
    console.error(error);
    const holder = document.getElementById('people-errors') || document.body;
    const p=document.createElement('p');
    p.style.color='#b00';
    p.textContent='Could not load people.xml for current members.';
    holder.prepend(p);
  }
})();
