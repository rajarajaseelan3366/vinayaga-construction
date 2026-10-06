/* ══════════════════════════════════════════════════════
   VINAYAGA CONSTRUCTION — MAIN JAVASCRIPT
   Three.js + GSAP ScrollTrigger + Canvas Animation
   ══════════════════════════════════════════════════════ */

'use strict';

/* ─── CONSTANTS ─────────────────────────────────────── */
const TOTAL_FRAMES = 50;
const FRAME_PATH = (n) => `image/ezgif-frame-${String(n).padStart(3,'0')}.jpg`;

const CONSTRUCTION_STAGES = [
  { frame: 1,  number: '01', name: 'EMPTY LAND',          desc: 'Your journey begins here. An empty canvas of possibility.' },
  { frame: 5,  number: '02', name: 'SITE PREPARATION',    desc: 'Clearing and levelling the site. The foundation of everything.' },
  { frame: 8,  number: '03', name: 'EXCAVATION',          desc: 'Heavy machinery arrives. The earth is shaped for your vision.' },
  { frame: 13, number: '04', name: 'FOUNDATION',          desc: 'Deep footings laid with precision. Strength built from the ground up.' },
  { frame: 18, number: '05', name: 'PLINTH & BASE',       desc: 'The plinth rises. Structure begins to take form.' },
  { frame: 23, number: '06', name: 'GROUND FLOOR',        desc: 'Ground floor structure emerges. Space starts to define itself.' },
  { frame: 28, number: '07', name: 'FIRST FLOOR',         desc: 'Rising to the first floor. Your home grows toward the sky.' },
  { frame: 33, number: '08', name: 'WALLS & ROOF',        desc: 'Walls enclose the space. The roof seals in your dream.' },
  { frame: 38, number: '09', name: 'PLASTERING',          desc: 'Surfaces refined. Every wall smoothed to perfection.' },
  { frame: 43, number: '10', name: 'EXTERIOR FINISHING',  desc: 'Cladding, glass, and fine finishes bring the architecture to life.' },
  { frame: 47, number: '11', name: 'LANDSCAPING',         desc: 'The gardens bloom. The driveway gleams. Luxury surrounds you.' },
  { frame: 50, number: '12', name: 'YOUR DREAM HOME',     desc: 'From vision to reality — your Vinayaga-built home is complete.' },
];

/* ──────────────────────────────────────────────────────
   LOADING SCREEN
   ────────────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loading-screen');
  // Minimum display time: 2.8s
  const minTime = 2800;
  const start = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minTime - elapsed);
    setTimeout(() => {
      loader.classList.add('loaded');
      document.body.style.overflow = '';
      startHeroAnimation();
    }, remaining);
  });

  document.body.style.overflow = 'hidden';
})();

/* ──────────────────────────────────────────────────────
   GSAP SETUP
   ────────────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ──────────────────────────────────────────────────────
   HEADER BEHAVIOUR
   ────────────────────────────────────────────────────── */
(function initHeader() {
  const header = document.getElementById('main-header');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target, offsetY: 70 },
        ease: 'power3.inOut'
      });
    });
  });
})();

/* ──────────────────────────────────────────────────────
   HERO ANIMATION
   ────────────────────────────────────────────────────── */
function startHeroAnimation() {
  // Slight parallax on hero image
  gsap.to('#hero-img', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

/* ──────────────────────────────────────────────────────
   CANVAS-BASED CONSTRUCTION ANIMATION
   ────────────────────────────────────────────────────── */
(function initConstructionCanvas() {
  const canvas = document.getElementById('journey-canvas');
  const ctx = canvas.getContext('2d');
  const scrollSpace = document.getElementById('journey-scroll-space');

  // Set scroll space height: more frames = more scroll
  const scrollHeight = window.innerHeight * (TOTAL_FRAMES * 0.14 + 2);
  scrollSpace.style.height = scrollHeight + 'px';

  // Preload all frames
  const frames = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let lastDrawnFrame = -1;
  let animationReady = false;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    if (animationReady) drawFrame(currentFrame);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete) return;

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const ratio = Math.max(cw / iw, ch / ih);
    const dw = iw * ratio, dh = ih * ratio;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
    lastDrawnFrame = index;
  }

  // Load frames
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);
    img.onload = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        animationReady = true;
        drawFrame(0);
      } else if (loadedCount <= 3) {
        // Draw early as first frames load
        animationReady = true;
        drawFrame(0);
      }
    };
    frames.push(img);
  }

  // Stage info elements
  const stageNumber = document.getElementById('stage-number');
  const stageName = document.getElementById('stage-name');
  const stageDesc = document.getElementById('stage-desc');
  const progressBar = document.getElementById('progress-bar');

  function getStageForFrame(frame) {
    let stage = CONSTRUCTION_STAGES[0];
    for (let i = 0; i < CONSTRUCTION_STAGES.length; i++) {
      if (frame >= CONSTRUCTION_STAGES[i].frame) stage = CONSTRUCTION_STAGES[i];
    }
    return stage;
  }

  let displayedStage = null;

  function updateStageInfo(frame) {
    const stage = getStageForFrame(frame);
    if (stage === displayedStage) return;
    displayedStage = stage;
    gsap.to([stageNumber, stageName, stageDesc], {
      opacity: 0, y: 15, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        stageNumber.textContent = stage.number;
        stageName.textContent = stage.name;
        stageDesc.textContent = stage.desc;
        gsap.to([stageNumber, stageName, stageDesc], {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06
        });
      }
    });
  }

  // ScrollTrigger driving the canvas
  ScrollTrigger.create({
    trigger: '#construction-journey',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    onUpdate: (self) => {
      const progress = self.progress;
      const frameIndex = Math.min(
        Math.floor(progress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      );
      progressBar.style.width = (progress * 100) + '%';

      if (frameIndex !== lastDrawnFrame && animationReady) {
        currentFrame = frameIndex;
        drawFrame(frameIndex);
        updateStageInfo(frameIndex + 1);
      }
    }
  });
})();

/* ──────────────────────────────────────────────────────
   THREE.JS INTERACTIVE HOUSE VIEWER
   ────────────────────────────────────────────────────── */
(function initInteractiveHouse() {
  const canvas = document.getElementById('house-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0A0A);
  scene.fog = new THREE.Fog(0x0A0A0A, 30, 80);

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 500;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
  camera.position.set(12, 8, 18);
  camera.lookAt(0, 3, 0);

  // Resize observer
  const resizeObserver = new ResizeObserver(() => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(canvas);

  /* ── LIGHTING ── */
  // Ambient
  const ambient = new THREE.AmbientLight(0xfff5e0, 0.6);
  scene.add(ambient);

  // Sun / Key light
  const sun = new THREE.DirectionalLight(0xfff8e7, 2.5);
  sun.position.set(20, 30, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  scene.add(sun);

  // Fill light
  const fill = new THREE.DirectionalLight(0xc8d5ff, 0.8);
  fill.position.set(-15, 10, -10);
  scene.add(fill);

  // Warm interior glow
  const interiorGlow = new THREE.PointLight(0xffd080, 3, 15);
  interiorGlow.position.set(0, 3, 0);
  scene.add(interiorGlow);

  /* ── MATERIALS ── */
  const matWhiteWall = new THREE.MeshStandardMaterial({ color: 0xF0EDE8, roughness: 0.5, metalness: 0.02 });
  const matStone = new THREE.MeshStandardMaterial({ color: 0x7A6A58, roughness: 0.85, metalness: 0 });
  const matGlass = new THREE.MeshStandardMaterial({
    color: 0x88AACC, roughness: 0.05, metalness: 0,
    transparent: true, opacity: 0.45,
    envMapIntensity: 1.0
  });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.6, metalness: 0.3 });
  const matWood = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.8, metalness: 0 });
  const matGold = new THREE.MeshStandardMaterial({ color: 0xC9A84C, roughness: 0.2, metalness: 0.9 });
  const matGround = new THREE.MeshStandardMaterial({ color: 0x3A5A30, roughness: 1, metalness: 0 });
  const matDrive = new THREE.MeshStandardMaterial({ color: 0xBBAA99, roughness: 0.9, metalness: 0 });
  const matWater = new THREE.MeshStandardMaterial({
    color: 0x4488BB, roughness: 0, metalness: 0.3,
    transparent: true, opacity: 0.7
  });

  /* ── GROUND ── */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), matGround);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Driveway
  const driveway = new THREE.Mesh(new THREE.PlaneGeometry(6, 18), matDrive);
  driveway.rotation.x = -Math.PI / 2;
  driveway.position.set(-8, 0.01, 5);
  scene.add(driveway);

  /* ── HELPER: create box ── */
  function box(w, h, d, mat, x, y, z, shadow = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (shadow) { m.castShadow = true; m.receiveShadow = true; }
    scene.add(m);
    return m;
  }

  /* ── HOUSE STRUCTURE ── */
  // Ground floor base
  box(18, 0.5, 12, matWhiteWall,  0, 0.25, 0);

  // Ground floor walls — left wing
  box(6, 4, 0.3, matWhiteWall,  -6, 2.5, -5.85); // back
  box(6, 4, 0.3, matGlass,       -6, 2.5,  5.85); // front glass
  box(0.3, 4, 12, matStone,     -9.15, 2.5, 0);   // left
  box(0.3, 4, 12, matWhiteWall,  -2.85, 2.5, 0);  // divider

  // Ground floor walls — right wing
  box(6, 4, 0.3, matWhiteWall,   6, 2.5, -5.85);
  box(6, 4, 0.3, matGlass,       6, 2.5,  5.85);
  box(0.3, 4, 12, matStone,      9.15, 2.5, 0);
  box(0.3, 4, 12, matWhiteWall,  2.85, 2.5, 0);

  // Center connector
  box(5.7, 4, 12, matGlass, 0, 2.5, 0);

  // Ground floor slab
  box(18, 0.3, 12, matDark, 0, 4.65, 0);

  // First floor — white walls with glass strips
  box(18, 3.5, 0.3, matWhiteWall,  0, 6.5, -5.85);
  box(18, 3.5, 0.3, matGlass,      0, 6.5,  5.85);
  box(0.3, 3.5, 12, matStone,    -9.15, 6.5, 0);
  box(0.3, 3.5, 12, matStone,     9.15, 6.5, 0);

  // First floor slab
  box(18, 0.3, 12, matDark, 0, 8.35, 0);

  // Cantilevered roof — main + overhang
  box(22, 0.3, 16, matDark, 0, 9.4, 0);

  // Roof overhang supports (columns)
  for (let xPos of [-7, -3, 3, 7]) {
    box(0.25, 8.5, 0.25, matDark, xPos, 4.25, -4);
  }

  // Stone accent pillar corners
  box(1, 8.5, 1, matStone, -9.15, 4.25, -5.5);
  box(1, 8.5, 1, matStone,  9.15, 4.25, -5.5);
  box(1, 8.5, 1, matStone, -9.15, 4.25,  5.5);
  box(1, 8.5, 1, matStone,  9.15, 4.25,  5.5);

  // Wood accent strips on first floor
  box(18, 0.2, 0.4, matWood, 0, 5.0, 5.75);
  box(18, 0.2, 0.4, matWood, 0, 7.5, 5.75);

  // First floor balcony slab
  box(18, 0.2, 2.5, matDark, 0, 4.75, 7.0);

  // Balcony glass railing
  box(18, 0.8, 0.08, matGlass, 0, 5.15, 8.2);

  // Pool
  box(10, 0.5, 5, matWater, 2, 0.01, 11);
  box(10.3, 0.4, 0.3, matDrive, 2, 0.25, 8.25);
  box(10.3, 0.4, 0.3, matDrive, 2, 0.25, 13.75);
  box(0.3, 0.4, 5.3, matDrive, -3.15, 0.25, 11);
  box(0.3, 0.4, 5.3, matDrive, 7.15, 0.25, 11);

  // Garage / side building
  box(5, 3.5, 8, matStone, -11.5, 1.75, -2);
  box(5, 0.3, 8, matDark, -11.5, 3.65, -2);
  // Garage door
  box(4, 2.8, 0.1, matDark, -11.5, 1.4, 2);

  // Entrance steps
  box(3, 0.2, 1, matDrive,  0, 0.1, 6.3);
  box(3, 0.2, 1, matDrive,  0, 0.3, 7.3);
  box(3, 0.2, 1, matDrive,  0, 0.5, 8.3);

  // Palm trees (simplified cylinders + spheres)
  function addPalm(x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x7B5E3D, roughness: 1 })
    );
    trunk.position.set(x, 2.5, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x2A6E2A, roughness: 1 })
    );
    canopy.position.set(x, 5.5, z);
    canopy.castShadow = true;
    canopy.scale.y = 0.6;
    scene.add(canopy);
  }

  addPalm(-12, 8); addPalm(-11, 12); addPalm(12, 8); addPalm(11, 12);
  addPalm(-5, 15); addPalm(5, 15); addPalm(-13, 4); addPalm(13, 4);

  // Boundary wall
  box(40, 1.5, 0.4, matDrive,  0, 0.75, 20);
  box(40, 1.5, 0.4, matDrive,  0, 0.75, -20);
  box(0.4, 1.5, 40, matDrive,  20, 0.75, 0);
  box(0.4, 1.5, 40, matDrive, -20, 0.75, 0);

  // Gate posts
  box(0.8, 3, 0.8, matDark, -2.5, 1.5, 20);
  box(0.8, 3, 0.8, matDark,  2.5, 1.5, 20);
  // Gate accent
  box(0.1, 0.1, 0.1, matGold, -2.5, 3.1, 20);
  box(0.1, 0.1, 0.1, matGold,  2.5, 3.1, 20);

  // Luxury car (simplified)
  const carMat = new THREE.MeshStandardMaterial({ color: 0x222244, roughness: 0.2, metalness: 0.9 });
  box(4.2, 0.6, 1.8, carMat, -9, 0.6, 2);    // body
  box(2.8, 0.5, 1.7, carMat, -9.1, 1.2, 2);  // cabin
  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.2, metalness: 1 });
  function addWheel(x, z) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16), wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.3, z);
    scene.add(w);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 8), rimMat);
    r.rotation.z = Math.PI / 2;
    r.position.set(x, 0.3, z);
    scene.add(r);
  }
  addWheel(-7.3, 1.1); addWheel(-7.3, 2.9);
  addWheel(-10.7, 1.1); addWheel(-10.7, 2.9);

  /* ── AMBIENT PARTICLES ── */
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xC9A84C, size: 0.06, transparent: true, opacity: 0.4,
    sizeAttenuation: true
  });
  scene.add(new THREE.Points(particleGeo, particleMat));

  /* ── MOUSE / DRAG ORBIT ── */
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let spherical = { theta: 0.8, phi: 0.55, radius: 26 };
  let targetSpherical = { theta: 0.8, phi: 0.55, radius: 26 };

  canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
  canvas.addEventListener('touchstart', e => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, { passive: true });

  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('touchend', () => isDragging = false);

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    targetSpherical.theta -= dx * 0.008;
    targetSpherical.phi = Math.max(0.15, Math.min(1.5, targetSpherical.phi + dy * 0.006));
    prevX = e.clientX; prevY = e.clientY;
  });

  window.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - prevX;
    const dy = e.touches[0].clientY - prevY;
    targetSpherical.theta -= dx * 0.008;
    targetSpherical.phi = Math.max(0.15, Math.min(1.5, targetSpherical.phi + dy * 0.006));
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    targetSpherical.radius = Math.max(12, Math.min(40, targetSpherical.radius + e.deltaY * 0.04));
  }, { passive: false });

  /* ── HOTSPOT CLICKS ── */
  document.querySelectorAll('.hotspot-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const hotspot = dot.closest('.hotspot');
      document.querySelectorAll('.hotspot').forEach(h => {
        if (h !== hotspot) h.classList.remove('active');
      });
      hotspot.classList.toggle('active');
    });
  });

  /* ── AUTO ROTATION ── */
  let autoRotateTimer = null;
  let isAutoRotating = true;
  canvas.addEventListener('mousedown', () => {
    isAutoRotating = false;
    clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => { isAutoRotating = true; }, 5000);
  });

  /* ── SCROLL INTO VIEW DETECTION ── */
  let houseVisible = false;
  const houseSection = document.getElementById('interactive-house');
  const houseObserver = new IntersectionObserver(entries => {
    houseVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  if (houseSection) houseObserver.observe(houseSection);

  /* ── RENDER LOOP ── */
  let frame = 0;
  function render() {
    requestAnimationFrame(render);
    frame++;

    if (!houseVisible) return; // Don't render when off screen

    // Smooth camera interpolation
    spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
    spherical.phi   += (targetSpherical.phi   - spherical.phi)   * 0.08;
    spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;

    if (isAutoRotating) {
      targetSpherical.theta += 0.003;
    }

    // Convert spherical to cartesian
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi) + 3;
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 3, 0);

    // Animate interior glow
    interiorGlow.intensity = 2.5 + Math.sin(frame * 0.02) * 0.5;

    renderer.render(scene, camera);
  }
  render();
})();

/* ──────────────────────────────────────────────────────
   DYNAMIC CONTENT SYNCHRONIZATION WITH ADMIN PORTAL
   ────────────────────────────────────────────────────── */
async function syncDynamicContent() {
  try {
    const response = await fetch('api.php?action=bootstrap', {cache:'no-store'});
    const result = await response.json();
    if (!result.ok) throw new Error(result.message || 'Could not load site data');
    const {projects: projs, services: servs, contact: c} = result.data || {};

    const grid = document.querySelector('.projects-grid');
    if (grid && Array.isArray(projs)) {
      grid.innerHTML = projs.map(p => {
        const status = p.status || 'COMPLETED';
        const img = p.image || 'image/ezgif-frame-050.jpg';
        return `<div class="project-card">
          <div class="project-img"><img src="${img}" alt="${escapeHtml(p.title || 'Project')}" loading="lazy" />
            <div class="project-overlay"><div class="project-tag">${escapeHtml(status)}</div></div>
          </div>
          <div class="project-info"><h3>${escapeHtml(p.title || 'Project')}</h3>
            <p>${escapeHtml(p.location || 'Karaikudi, Tamil Nadu')}</p>
            <span>${escapeHtml(p.category || 'Residential')}</span>
            ${p.description ? `<div class="project-description">${escapeHtml(p.description)}</div>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid && Array.isArray(servs)) {
      servicesGrid.innerHTML = servs.map(s => `<div class="service-card">
        <div class="service-num">${escapeHtml(s.num || '01')}</div>
        <div class="service-icon">${escapeHtml(s.icon || '🏛️')}</div>
        <h3>${escapeHtml(s.title || '')}</h3><p>${escapeHtml(s.desc || '')}</p>
      </div>`).join('');
    }

    if (c) {
      if (c.phone) document.querySelectorAll('a[href^="tel:"]').forEach(a => { a.href=`tel:${c.phone.replace(/\s+/g,'')}`; a.textContent=a.textContent.includes('📞')?`📞 ${c.phone}`:c.phone; });
      if (c.email) document.querySelectorAll('a[href^="mailto:"]').forEach(a => { a.href=`mailto:${c.email}`; if(!a.classList.contains('social-link')) a.textContent=a.textContent.includes('✉️')?`✉️ ${c.email}`:c.email; });
      if (c.whatsapp) { const cleanWa=c.whatsapp.replace(/\D/g,''); const waUrl=`https://wa.me/${cleanWa}?text=Hi%20Vinayaga%20Construction%2C%20I'm%20interested%20in%20building%20my%20dream%20home.%20I%20would%20like%20to%20discuss%20my%20project%20and%20get%20a%20free%20quotation.%20Please%20contact%20me.`; document.querySelectorAll('a[href*="wa.me"]').forEach(a=>a.href=waUrl); }
      if (c.location) document.querySelectorAll('.contact-item span, .footer-contact-item span').forEach(s=>{ if(s.textContent.includes('Karaikudi')||s.textContent.includes('Tamil Nadu')) s.textContent=s.textContent.includes('📍')?`📍 ${c.location}`:c.location; });
      if (c.tagline) { const el=document.querySelector('.footer-tagline'); if(el) el.textContent=c.tagline; }
      if (c.brandMessage) { const el=document.querySelector('.footer-brand-msg'); if(el) el.textContent=c.brandMessage; }
    }
  } catch (e) { console.warn('Online content sync error:', e); }
}

function escapeHtml(str) { return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Load online admin data on every public-site visit.
syncDynamicContent();
// Refresh periodically so another device's admin changes appear without a hard reload.
setInterval(syncDynamicContent, 30000);
