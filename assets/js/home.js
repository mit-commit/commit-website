
(async function(){
// People rotator (uses people.xml <person photo="...">)
const xmlText = await getText('data/people.xml');
const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
const photos = Array.from(xml.querySelectorAll('person[photo]')).map(p => p.getAttribute('photo')).filter(Boolean);
const win = document.getElementById('image_window');
if (win && photos.length){
photos.slice(0,8).forEach((src, i) => {
const img = new Image();
img.className = 'people_image';
img.style.animationDelay = (i*2.5)+'s';
img.src = 'assets/img/people/'+src;
win.appendChild(img);
});
}


// Featured projects: data/projects.json items where featured=true
try {
const projects = await getJSON('data/projects.json');
const feats = projects.filter(p=>p.featured).slice(0,6);
const ul = document.getElementById('featured-projects');
feats.forEach(p=>{
const li = document.createElement('li');
li.className='project';
li.innerHTML = html`<h3><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></h3><div>${p.description||''}</div>`;
ul.appendChild(li);
});
} catch(e) { console.warn('Projects load failed', e); }


// Featured publications: data/publications.json where featured=true
try {
const pubs = await getJSON('data/publications.json');
const feats = pubs.filter(p=>p.featured).slice(0,6);
const ul = document.getElementById('featured-pubs');
feats.forEach(p=>{
const li = document.createElement('li');
li.className='minipub';
const authors = (p.authors||[]).join(', ');
const venue = [p.venue, p.year].filter(Boolean).join(', ');
const links = [
p.pdf ? `<a href="${p.pdf}" target="_blank">pdf</a>` : '',
p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank">doi</a>` : '',
p.code? `<a href="${p.code}" target="_blank">code</a>` : ''
].filter(Boolean).join(' · ');
li.innerHTML = html`<div class="publication"><strong>${p.title}</strong><br/>${authors}<br/><em>${venue}</em>${links? ' — '+links:''}</div>`;
ul.appendChild(li);
});
} catch(e) { console.warn('Pubs load failed', e); }
})();

