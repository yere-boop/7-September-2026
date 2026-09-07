/* ===================================
   BUBU Memorial Website — JavaScript
   Scroll Reveal, Lightbox, Music, UX,
   Floating Petals, Sparkles, 3D Tilt
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEntranceOverlay();
  initScrollReveal();
  initLightbox();
  initParallaxHero();
  initMusicControl();
  initFloatingPetals();
  initSparkles();
  initGallery3DTilt();
  initHeadingUnderlines();
});


/* ---------- Entrance Overlay ---------- */
function initEntranceOverlay() {
  const overlay = document.getElementById('entrance-overlay');
  const btn     = document.getElementById('entrance-btn');

  if (!overlay || !btn) return;

  document.body.style.overflow = 'hidden';

  btn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';

    setTimeout(() => {
      startMusic();
    }, 400);
  });
}


/* ---------- YouTube Music Player ---------- */
let ytPlayer    = null;
let musicPlaying = false;
let pendingPlay  = false;
let playerReady  = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    height: '1',
    width:  '1',
    videoId: '08Ndzf5-HxI',
    playerVars: {
      autoplay: 0,
      loop: 1,
      playlist: '08Ndzf5-HxI',
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError:       onPlayerError,
    },
  });
}

function onPlayerReady(event) {
  playerReady = true;
  event.target.setVolume(40);
  if (pendingPlay) {
    pendingPlay = false;
    event.target.playVideo();
  }
}

function onPlayerError(event) {
  console.warn('YouTube player error:', event.data);
}

function onPlayerStateChange(event) {
  const musicBtn = document.getElementById('music-control');
  if (!musicBtn) return;

  if (event.data === YT.PlayerState.PLAYING) {
    musicPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.classList.remove('paused');
  } else if (event.data === YT.PlayerState.PAUSED) {
    musicPlaying = false;
    musicBtn.classList.add('paused');
  } else if (event.data === YT.PlayerState.ENDED) {
    ytPlayer.playVideo();
  }
}

function startMusic() {
  const musicBtn = document.getElementById('music-control');
  if (musicBtn) musicBtn.classList.add('visible');

  if (playerReady && ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
  } else {
    pendingPlay = true;
  }
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;


/* ---------- Music Control Button ---------- */
function initMusicControl() {
  const musicBtn = document.getElementById('music-control');
  if (!musicBtn) return;

  musicBtn.addEventListener('click', () => {
    if (!ytPlayer || !ytPlayer.getPlayerState) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      musicPlaying = false;
      musicBtn.classList.add('paused');
    } else {
      ytPlayer.playVideo();
      musicPlaying = true;
      musicBtn.classList.remove('paused');
    }
  });
}


/* ---------- Scroll Reveal — All Classes ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
}


/* ---------- Lightbox ---------- */
function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbClose   = document.getElementById('lightbox-close');
  const lbPrev    = document.getElementById('lightbox-prev');
  const lbNext    = document.getElementById('lightbox-next');
  const lbCounter = document.getElementById('lightbox-counter');

  if (!lightbox) return;

  const galleryItems = document.querySelectorAll('.gallery__item');
  let imageSources = [];
  let currentIndex = 0;

  function buildImageSources() {
    imageSources = [];
    galleryItems.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        imageSources.push({ src: img.src, alt: img.alt, domIndex: index });
      }
    });
  }

  buildImageSources();

  function openLightbox(domIndex) {
    buildImageSources();
    const idx = imageSources.findIndex((s) => s.domIndex === domIndex);
    if (idx === -1) return;
    currentIndex = idx;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    if (imageSources.length <= 1) return;
    currentIndex = (currentIndex + direction + imageSources.length) % imageSources.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const source = imageSources[currentIndex];
    if (!source) return;
    lbImg.src = source.src;
    lbImg.alt = source.alt;
    lbCounter.textContent = `${currentIndex + 1} / ${imageSources.length}`;
    const showNav = imageSources.length > 1;
    lbPrev.style.display = showNav ? '' : 'none';
    lbNext.style.display = showNav ? '' : 'none';
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const domIndex = parseInt(item.dataset.index, 10);
      if (item.querySelector('img')) openLightbox(domIndex);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });
}


/* ---------- Subtle Parallax on Hero ---------- */
function initParallaxHero() {
  const heroBg = document.querySelector('.hero__bg img');
  if (!heroBg) return;
  if ('ontouchstart' in window) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY    = window.scrollY;
        const heroHeight = document.querySelector('.hero').offsetHeight;
        if (scrollY < heroHeight) {
          heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.05)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  heroBg.style.transform  = 'scale(1.05)';
  heroBg.style.willChange = 'transform';
}


/* ---------- Floating Petals ---------- */
function initFloatingPetals() {
  const canvas = document.createElement('canvas');
  canvas.id = 'petals-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT  = window.innerWidth < 768 ? 12 : 22;
  const EMOJIS = ['🌸','🍂','✨','🌿','🌼'];

  const PETALS = Array.from({ length: COUNT }, () => ({
    x:        Math.random() * window.innerWidth,
    y:        Math.random() * window.innerHeight * 2 - window.innerHeight,
    size:     Math.random() * 14 + 8,
    speedY:   Math.random() * 0.6 + 0.2,
    speedX:   (Math.random() - 0.5) * 0.4,
    rot:      Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.015,
    emoji:    EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    opacity:  Math.random() * 0.45 + 0.2,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    PETALS.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
      ctx.restore();

      p.x   += p.speedX;
      p.y   += p.speedY;
      p.rot += p.rotSpeed;

      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
      if (p.x > canvas.width + 20)  p.x = -20;
      if (p.x < -20)                p.x = canvas.width + 20;
    });
    requestAnimationFrame(draw);
  }
  draw();
}


/* ---------- Sparkle Cursor Trail ---------- */
function initSparkles() {
  if ('ontouchstart' in window) return;

  let lastSpark = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSpark < 80) return;
    lastSpark = now;

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    const size = Math.random() * 10 + 5;
    sparkle.style.cssText = `
      left:   ${e.clientX - size / 2}px;
      top:    ${e.clientY - size / 2}px;
      width:  ${size}px;
      height: ${size}px;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  });
}


/* ---------- Gallery 3D Tilt on Mousemove ---------- */
function initGallery3DTilt() {
  if ('ontouchstart' in window) return;

  document.querySelectorAll('.gallery__item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      item.style.transform =
        `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.05) translateY(-8px)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}


/* ---------- Animated Heading Underlines ---------- */
function initHeadingUnderlines() {
  const headings = document.querySelectorAll(
    '.gallery__heading, .welcome__name, .timeline__heading, .qr__heading'
  );
  if (!headings.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  headings.forEach(h => observer.observe(h));
}
