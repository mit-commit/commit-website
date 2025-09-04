(function () {
  const el = document.getElementById('people-rotator');
  if (!el) return;

  let images = [];
    try { images = JSON.parse(el.getAttribute('data-images') || '[]'); } catch {console.error("bad image format!")}
  if (!images.length) return;

  const N = images.length;
  const cycleMs = 6000; // full cycle per image

  images.forEach((src, i) => {
    const img = new Image();
    img.src = src;
    img.alt = '';
    img.className = 'slide' + (i === 0 ? ' first' : '');
    img.style.animationDuration = (cycleMs * N) + 'ms';
    img.style.animationDelay = (i * cycleMs) + 'ms';
    el.appendChild(img);
  });
})();
