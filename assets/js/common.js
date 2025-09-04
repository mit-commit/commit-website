const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const html = (strings, ...vals) => strings.map((s,i)=>s+(vals[i]??"")).join("");


async function getJSON(path){ const r = await fetch(path); if(!r.ok) throw new Error("Fetch failed "+path); return r.json(); }
async function getText(path){ const r = await fetch(path); if(!r.ok) throw new Error("Fetch failed "+path); return r.text(); }


function setActiveNav(){
const here = location.pathname.split('/').pop() || 'index.html';
$$('.menuitemlink').forEach(a=>{ if(a.getAttribute('href').endsWith(here)) a.style.backgroundColor = '#dfdfdf'; });
}


document.addEventListener('DOMContentLoaded', setActiveNav);

