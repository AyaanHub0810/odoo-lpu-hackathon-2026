/**
 * THREAT SHIELD — Cyber Telemetry & Interactive Engine
 */

function initThreatShield() {
  const createVisibleAnimationLoop = (element, renderFrame, framesPerSecond = 30) => {
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const minFrameTime = 1000 / framesPerSecond;
    let isVisible = false;
    let frameId = null;
    let lastFrameTime = 0;

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      lastFrameTime = 0;
    };

    const tick = (time) => {
      frameId = null;
      if (!isVisible || document.hidden || reducedMotion.matches) return;

      const elapsed = time - lastFrameTime;
      if (elapsed >= minFrameTime) {
        renderFrame(Math.min(elapsed, 100));
        lastFrameTime = time;
      }

      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!isVisible || document.hidden || frameId !== null) return;
      renderFrame(0);
      if (reducedMotion.matches) return;
      lastFrameTime = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      }, { rootMargin: '120px 0px' })
      : null;

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMotionChange = () => {
      stop();
      start();
    };

    if (observer) observer.observe(element);
    else {
      isVisible = true;
      start();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', onMotionChange);

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  };

  // Modal Handling
  const demoModal = document.getElementById('demoModal');
  const openDemoBtn = document.getElementById('openDemoBtn');
  const closeDemoBtn = document.getElementById('closeDemoBtn');
  const demoForm = document.getElementById('demoForm');

  // "Launch App" opens StockSense Web App
  if (openDemoBtn) {
    openDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = '/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } catch {
        window.location.href = '/dashboard';
      }
    });
  }

  const openBriefingBtn = document.getElementById('openBriefingBtn');
  if (openBriefingBtn) {
    openBriefingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = '/login';
        } else {
          window.location.href = '/login';
        }
      } catch {
        window.location.href = '/login';
      }
    });
  }

  if (closeDemoBtn && demoModal) {
    closeDemoBtn.addEventListener('click', () => {
      demoModal.close();
    });
  }

  // Close modal when clicking outside of card
  if (demoModal) {
    demoModal.addEventListener('click', (e) => {
      const rect = demoModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        demoModal.close();
      }
    });
  }

  window.submitDemoRequest = () => {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>DISPATCHING BRIEFING...</span>';
      submitBtn.style.opacity = '0.7';
      setTimeout(() => {
        submitBtn.innerHTML = '<span>CONFIRMED ✓ BRIEFING SCHEDULED</span>';
        submitBtn.style.background = '#22c55e';
        submitBtn.style.color = '#ffffff';
        setTimeout(() => {
          if (demoModal) demoModal.close();
          submitBtn.innerHTML = '<span>REQUEST BRIEFING</span><span class="submit-arrow">→</span>';
          submitBtn.style.background = '';
          submitBtn.style.color = '';
          demoForm.reset();
        }, 1200);
      }, 900);
    }
  };

  // -------------------------------------------------------------
  // 3D Adaptive Navigation Pill Controller
  // -------------------------------------------------------------
  const initAdaptiveNavPill = () => {
    const navPill = document.getElementById('adaptiveNavPill');
    const activeLabel = document.getElementById('pillActiveLabel');
    const navBtns = document.querySelectorAll('.pill-nav-btn');

    if (!navPill || !activeLabel) return;

    let hoverTimeout = null;
    let activeSection = 'home';

    // Handle hover expansion with 600ms grace collapse
    navPill.addEventListener('mouseenter', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      navPill.classList.add('expanded');
    });

    navPill.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        navPill.classList.remove('expanded');
      }, 600);
    });

    // Handle section click
    navBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sectionId = btn.getAttribute('data-id');
        const label = btn.textContent.trim();

        // Trigger transition state on pill
        navPill.classList.add('transitioning');
        navPill.classList.remove('expanded');
        if (hoverTimeout) clearTimeout(hoverTimeout);

        // Update active buttons
        navBtns.forEach((b) => b.classList.toggle('active', b === btn));

        // Smooth blur/fade transition on collapsed active label
        activeLabel.style.opacity = '0';
        activeLabel.style.filter = 'blur(4px)';
        activeLabel.style.transform = 'translateY(6px)';

        setTimeout(() => {
          activeLabel.textContent = label;
          activeLabel.style.opacity = '1';
          activeLabel.style.filter = 'blur(0px)';
          activeLabel.style.transform = 'translateY(0)';
          activeSection = sectionId;
        }, 200);

        setTimeout(() => {
          navPill.classList.remove('transitioning');
        }, 400);

        // Smooth navigation to target section
        if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (sectionId === 'problem') {
          const el = document.getElementById('problem');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (sectionId === 'solution') {
          const el = document.getElementById('solution');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Dynamic Scroll Spy for Nav Pill Active Section Chip
    const navSections = [
      { id: 'home', label: 'Home', el: document.getElementById('home') || document.querySelector('.hero-stage') },
      { id: 'problem', label: 'Problem', el: document.getElementById('problem') },
      { id: 'solution', label: 'Solution', el: document.getElementById('solution') },
    ];

    let pillScrollThrottle = null;
    window.addEventListener('scroll', () => {
      if (pillScrollThrottle) return;
      pillScrollThrottle = setTimeout(() => {
        pillScrollThrottle = null;
        const scrollPos = window.scrollY + window.innerHeight * 0.35;
        let matched = navSections[0];
        for (const s of navSections) {
          if (s.el) {
            const top = s.el.offsetTop;
            if (scrollPos >= top) {
              matched = s;
            }
          }
        }
        if (matched && activeSection !== matched.id && !navPill.classList.contains('expanded')) {
          activeSection = matched.id;
          activeLabel.textContent = matched.label;
          navBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-id') === matched.id));
        }
      }, 60);
    }, { passive: true });
  };

  initAdaptiveNavPill();

  // Unit Fleet Seamless In-Place Animated Transition Controller
  const aircraftImgs = document.querySelectorAll('.hero-aircraft-img');
  const selectorBtns = document.querySelectorAll('.selector-btn');
  const progressEl = document.getElementById('selectorProgress');
  const modelKeys = ['highbay', 'amr', 'twin', 'dispatch'];
  const CYCLE_INTERVAL = 6000; // 6 seconds per unit for lively showcase
  
  let currentIndex = 0;
  let autoCycleTimer = null;

  const resetProgressBar = () => {
    if (!progressEl) return;
    progressEl.style.transition = 'none';
    progressEl.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressEl.style.transition = `width ${CYCLE_INTERVAL}ms linear`;
        progressEl.style.width = '100%';
      });
    });
  };

  const transitionTo = (nextIndex) => {
    if (nextIndex === currentIndex) return;

    const currentImg = aircraftImgs[currentIndex];
    const nextImg = aircraftImgs[nextIndex];

    if (!nextImg) return;

    // Clean up any non-current images
    aircraftImgs.forEach((img, i) => {
      if (i !== currentIndex && i !== nextIndex) {
        img.classList.remove('active', 'exit');
      }
    });

    // Trigger smooth aerodynamic climb exit on current aircraft
    if (currentImg) {
      currentImg.classList.remove('active');
      currentImg.classList.add('exit');
      setTimeout(() => {
        currentImg.classList.remove('exit');
      }, 1300);
    }

    // Trigger smooth climb enter on next aircraft
    nextImg.classList.remove('exit');
    nextImg.classList.add('active');
    currentIndex = nextIndex;

    // Update switcher buttons
    const targetModel = modelKeys[currentIndex];
    selectorBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-model') === targetModel);
    });

    // Reset the cycle progress bar
    resetProgressBar();
  };

  const startAutoCycle = () => {
    if (autoCycleTimer) clearInterval(autoCycleTimer);
    resetProgressBar();
    autoCycleTimer = setInterval(() => {
      const next = (currentIndex + 1) % modelKeys.length;
      transitionTo(next);
    }, CYCLE_INTERVAL);
  };

  // Button manual controls with instant smooth transition
  selectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const model = btn.getAttribute('data-model');
      const idx = modelKeys.indexOf(model);
      if (idx !== -1) {
        transitionTo(idx);
        startAutoCycle(); // Restart cycle timer from 0
      }
    });
  });

  // Start initial auto cycle and progress bar immediately
  startAutoCycle();

  // Subtle Interactive Mouse Parallax
  const aircraftLayer = document.getElementById('aircraftLayer');

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let parallaxFrame = null;
  const parallaxMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const animateParallax = () => {
    parallaxFrame = null;
    const deltaX = targetX - mouseX;
    const deltaY = targetY - mouseY;
    mouseX += deltaX * 0.12;
    mouseY += deltaY * 0.12;

    if (aircraftLayer) {
      aircraftLayer.style.transform = `translateX(calc(-50% + ${mouseX * 8}px)) translateY(${mouseY * 5}px)`;
    }

    if (Math.abs(deltaX) > 0.001 || Math.abs(deltaY) > 0.001) {
      parallaxFrame = requestAnimationFrame(animateParallax);
    }
  };

  window.addEventListener('mousemove', (e) => {
    if (parallaxMotion.matches) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx;
    targetY = (e.clientY - cy) / cy;
    if (parallaxFrame === null) parallaxFrame = requestAnimationFrame(animateParallax);
  }, { passive: true });

  parallaxMotion.addEventListener('change', (event) => {
    if (!event.matches) return;
    if (parallaxFrame !== null) cancelAnimationFrame(parallaxFrame);
    parallaxFrame = null;
    mouseX = 0;
    mouseY = 0;
    if (aircraftLayer) aircraftLayer.style.transform = 'translateX(-50%)';
  });

  // Monospace Log Dynamic Clock Sync
  const updateLogTimestamps = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    
    // Compute current HH:MM:SS with small relative step intervals
    const t4 = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const d3 = new Date(now.getTime() - 4000);
    const t3 = `${pad(d3.getHours())}:${pad(d3.getMinutes())}:${pad(d3.getSeconds())}`;
    
    const d2 = new Date(now.getTime() - 7000);
    const t2 = `${pad(d2.getHours())}:${pad(d2.getMinutes())}:${pad(d2.getSeconds())}`;

    const d1 = new Date(now.getTime() - 11000);
    const t1 = `${pad(d1.getHours())}:${pad(d1.getMinutes())}:${pad(d1.getSeconds())}`;

    const el1 = document.getElementById('logTime1');
    const el2 = document.getElementById('logTime2');
    const el3 = document.getElementById('logTime3');
    const el4 = document.getElementById('logTime4');

    if (el1) el1.textContent = t1;
    if (el2) el2.textContent = t2;
    if (el3) el3.textContent = t3;
    if (el4) el4.textContent = t4;
  };

  setInterval(updateLogTimestamps, 3000);
  updateLogTimestamps();

  // Micro-fluctuation on uptime (99.999% rock-solid cyber security)
  const uptimeVal = document.getElementById('uptimeVal');
  let counter = 0;
  setInterval(() => {
    counter++;
    if (counter % 12 === 0) {
      uptimeVal.textContent = '94.2%';
    }
  }, 4000);

  // -------------------------------------------------------------
  // Section 04 — Interactive 3D Earth Globe Model (Three.js)
  // -------------------------------------------------------------
  const initEarthGlobe = () => {
    const container = document.getElementById('globeCanvasContainer');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, skipping 3D earth initialization');
      return;
    }

    const width = container.clientWidth || 250;
    const height = container.clientHeight || 175;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Earth Sphere Geometry
    const earthRadius = 1.22;
    const geometry = new THREE.SphereGeometry(earthRadius, 48, 48);

    // Load Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('assets/earth_texture.jpg', () => {
      renderer.render(scene, camera);
    });
    earthTexture.wrapS = THREE.RepeatWrapping;

    // Earth Material with deep blue oceans & specular highlight
    const material = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.52,
      metalness: 0.15,
      color: 0xffffff,
      emissive: new THREE.Color(0x031838),
      emissiveIntensity: 0.35,
    });

    const earthMesh = new THREE.Mesh(geometry, material);
    earthMesh.rotation.z = 0.22; // Axial tilt
    earthMesh.rotation.x = 0.12; // Slight camera pitch
    earthMesh.rotation.y = 1.25; // Frame Europe / Africa / Atlantic initially
    scene.add(earthMesh);

    // Atmosphere Glow Layer (Fresnel back-facing halo)
    const glowGeo = new THREE.SphereGeometry(earthRadius * 1.035, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // Dynamic Lighting matching reference
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(-4, 3, 3.5);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x0ea5e9, 1.2);
    blueRimLight.position.set(3, -2, -2);
    scene.add(blueRimLight);

    // Interactive Drag / Orbit rotation
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
      dragVelocity = { x: 0, y: 0 };
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      dragVelocity = { x: deltaX * 0.005, y: deltaY * 0.005 };
      earthMesh.rotation.y += dragVelocity.x;
      earthMesh.rotation.x += dragVelocity.y;

      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // Auto-rotation and continuous render loop
    createVisibleAnimationLoop(container, (elapsed) => {
      if (elapsed > 0 && !isDragging) {
        const frameScale = elapsed / (1000 / 60);
        earthMesh.rotation.y += 0.0022 * frameScale;
        dragVelocity.x *= Math.pow(0.92, frameScale);
        dragVelocity.y *= Math.pow(0.92, frameScale);
        earthMesh.rotation.y += dragVelocity.x;
        earthMesh.rotation.x += dragVelocity.y;
      }
      renderer.render(scene, camera);
    }, 60);

    // Auto-resize on layout shift
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
  };

  initEarthGlobe();

  // ==========================================================================
  // Stage 2: Threat Detection Interactive Cards & Scroll-Triggered Entrance
  // ==========================================================================
  const initThreatDetection = () => {
    const section = document.getElementById('problem');
    const flow = section ? section.querySelector('.threat-flow') : null;
    const cards = document.querySelectorAll('.threat-card');
    if (!cards.length) return;

    // Scroll reveal observer: fires when user reaches the section
    if (section) {
      const revealThreats = () => {
        section.classList.add('is-revealed');
      };

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                revealThreats();
                observer.disconnect();
              }
            });
          },
          { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
        );
        observer.observe(flow || section);
      } else {
        revealThreats();
      }

      // Check if already in viewport
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.75) {
        revealThreats();
      }
    }

    cards.forEach((card) => {
      const activateCard = () => {
        cards.forEach((c) => {
          c.classList.remove('is-active');
          c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('is-active');
        card.setAttribute('aria-pressed', 'true');
      };

      card.addEventListener('mouseenter', activateCard);
      card.addEventListener('focus', activateCard);
      card.addEventListener('click', activateCard);
    });
  };

  initThreatDetection();

  // ==========================================================================
  // Stage 3: Global Coverage Section (Particle Sphere Animation & HUD)
  // ==========================================================================
  const initGlobalCoverage = () => {
    const section = document.getElementById('coverage');
    if (!section) return;

    // 1. Workflow steps toggle
    const stepBtns = section.querySelectorAll('.global-coverage-steps button');
    const titleEl = document.getElementById('globalCoverageStepTitle');
    const descEl = document.getElementById('globalCoverageStepDesc');

    const stepData = [
      {
        title: 'Double-entry inbound verification with zero inventory drift.',
        desc: 'Vendor shipments (WH/IN/xxxx) are verified via camera barcode scanning against PO specifications. Validating instantly credits the destination rack and commits an immutable IN ledger entry with zero phantom discrepancies.',
      },
      {
        title: 'Atomic reservation engine & dynamic rack-to-rack routing.',
        desc: 'Free-to-Use stock is calculated dynamically: Free = On Hand - Allocated in Ready Deliveries. Inter-warehouse transfers (WH/INT/xxxx) balance source and destination locations without affecting net company stock.',
      },
      {
        title: 'Precision dispatch fulfillment & instant discrepancy reconciliation.',
        desc: 'Customer deliveries (WH/OUT/xxxx) verify items before deducting on-hand quantities. Physical stock audits instantly compute discrepancies (Counted - Recorded) and commit compensating adjustment ledger records.',
      },
    ];

    stepBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        stepBtns.forEach((b) => {
          b.classList.remove('is-current');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-current');
        btn.setAttribute('aria-pressed', 'true');

        if (stepData[index] && titleEl && descEl) {
          titleEl.textContent = stepData[index].title;
          descEl.textContent = stepData[index].desc;
        }
      });
    });

    // 2. Status filter toggle
    const statusBtns = section.querySelectorAll('.global-coverage-status button');
    statusBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        statusBtns.forEach((b) => {
          b.classList.remove('is-current');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-current');
        btn.setAttribute('aria-pressed', 'true');
      });
    });

    // 3. 3D Particle Sphere Canvas
    const canvas = document.getElementById('particleSphereCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const PARTICLE_COUNT = 5000;
    const RADIUS = 275;
    const SIZE = 575;
    const COLORS = [
      '#ea580c',
      '#d97706',
      '#84cc16',
      '#f1f5f9',
      '#94a3b8',
      '#2563eb',
      '#3b82f6',
      '#60a5fa',
      '#f97316',
    ];

    canvas.width = SIZE;
    canvas.height = SIZE;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Generate sphere points
    const points = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const z = Math.random() * 2 - 1;
      const theta = Math.random() * 2 * Math.PI;
      const radiusAtZ = Math.sqrt(1 - z * z);
      const radius = RADIUS * (0.97 + Math.random() * 0.06);
      const x = radius * radiusAtZ * Math.cos(theta);
      const y = radius * radiusAtZ * Math.sin(theta);
      const pointZ = radius * z;
      const yFactor = (y + RADIUS) / (2 * RADIUS);
      let colorIndex;

      if (Math.random() > 0.9) colorIndex = 7;
      else if (yFactor > 0.6) colorIndex = Math.floor(Math.random() * 3);
      else if (yFactor < 0.4) colorIndex = 3 + Math.floor(Math.random() * 3);
      else colorIndex = Math.floor(Math.random() * COLORS.length);

      points.push({ x, y, z: pointZ, color: COLORS[colorIndex] });
    }

    let rotation = 0;
    const transformedPoints = points.map((point) => ({
      x: 0,
      y: point.y,
      z: 0,
      color: point.color,
      opacity: 0,
      size: 0,
    }));

    const drawSphere = (elapsed) => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      rotation += 0.003 * (elapsed / (1000 / 60));
      ctx.save();
      ctx.translate(SIZE / 2, SIZE / 2);
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x = p.x * cos - p.z * sin;
        const z = p.x * sin + p.z * cos;
        const scale = (z + RADIUS) / (2 * RADIUS);
        const distance = Math.hypot(x, p.y);
        const rimFactor = Math.min(distance / RADIUS, 1);
        const point = transformedPoints[i];
        point.x = x;
        point.y = p.y;
        point.z = z;
        point.color = p.color;
        point.opacity = Math.max(0.1, Math.pow(rimFactor, 3) * 0.8) * (0.4 + 0.6 * scale);
        point.size = (0.4 + 0.8 * scale) * 1.5;
      }

      transformedPoints.sort((a, b) => a.z - b.z);
      for (let i = 0; i < transformedPoints.length; i++) {
        const pt = transformedPoints[i];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    createVisibleAnimationLoop(canvas, drawSphere);
  };

  initGlobalCoverage();

  // ==========================================================================
  // Stage 4: Process Section Interactive Timeline & Rail Tracking
  // ==========================================================================
  const initProcessSection = () => {
    const section = document.getElementById('process');
    if (!section) return;

    const navBtns = section.querySelectorAll('.process-nav-step');
    const rows = section.querySelectorAll('.process-row');
    const stageLabel = document.getElementById('processCurrentStage');
    const railProgress = document.getElementById('processRailProgress');
    const beacon = document.getElementById('processBeacon');
    const beaconBtn = document.getElementById('processNextBtn');
    const rail = document.getElementById('processRail');

    if (!rows.length) return;

    const stages = ['01_INBOUND', '02_ALLOCATE', '03_RECONCILE'];
    let activeIdx = 0;

    const updateBeacon = (idx) => {
      if (!rail || !rows[idx]) return;
      const railRect = rail.getBoundingClientRect();
      const rowRect = rows[idx].getBoundingClientRect();
      const center = rowRect.top + rowRect.height / 2 - railRect.top;
      const beaconY = Math.max(16, Math.min(railRect.height - 16, center));

      if (railProgress) railProgress.style.height = `${beaconY}px`;
      if (beacon) beacon.style.top = `${beaconY}px`;
      if (beaconBtn) beaconBtn.style.top = `${beaconY}px`;
    };

    const activate = (idx) => {
      if (idx < 0 || idx >= rows.length) return;
      activeIdx = idx;

      // Update Nav Buttons
      navBtns.forEach((btn, i) => {
        const isCur = i === idx;
        btn.classList.toggle('is-current', isCur);
        if (isCur) btn.setAttribute('aria-current', 'step');
        else btn.removeAttribute('aria-current');
      });

      // Update Row Articles
      rows.forEach((row, i) => {
        const isCur = i === idx;
        row.classList.toggle('is-active', isCur);
        row.classList.toggle('is-inactive', !isCur);
      });

      // Update Telemetry Stage text
      if (stageLabel && stages[idx]) {
        stageLabel.textContent = stages[idx];
      }

      updateBeacon(idx);
    };

    const goToStep = (idx) => {
      if (idx < 0 || idx >= rows.length) return;
      activate(idx);
      rows[idx].scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
    };

    navBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => goToStep(i));
    });

    if (beaconBtn) {
      beaconBtn.addEventListener('click', () => {
        const next = (activeIdx + 1) % rows.length;
        goToStep(next);
      });
    }

    // Scroll Observer for sticky timeline tracking
    let scrollRaf = null;
    const onScroll = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        let closest = 0;
        let minDistance = Infinity;

        rows.forEach((row, index) => {
          const rect = row.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closest = index;
          }
        });

        activate(closest);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    setTimeout(() => activate(0), 150);
  };

  initProcessSection();

  // ==========================================================================
  // Stage 5: Capabilities Section Rotating Particle Globe (Canvas 2D)
  // ==========================================================================
  const initThreatParticleGlobe = () => {
    const canvas = document.getElementById('threatParticleGlobeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const SIZE = 240;
    const RADIUS = 102;
    const POINT_COUNT = 1600;
    const PALETTE = ['#0284c7', '#2563eb', '#38bdf8', '#67e8f9', '#e2e8f0'];

    const points = Array.from({ length: POINT_COUNT }, () => {
      const y = Math.random() * 2 - 1;
      const longitude = Math.random() * Math.PI * 2;
      const atY = Math.sqrt(1 - y * y);
      const radius = RADIUS * (0.97 + Math.random() * 0.06);
      return {
        x: Math.cos(longitude) * atY * radius,
        y: y * radius,
        z: Math.sin(longitude) * atY * radius,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        highlight: Math.sin(longitude * 2 + y * 3) > 0.7 ? 1.6 : 1,
      };
    });

    let rotation = 0;
    const transformedPoints = points.map((point) => ({
      x: 0,
      y: point.y,
      z: 0,
      color: point.color,
      size: 0,
      opacity: 0,
    }));

    const render = (elapsed) => {
      rotation += elapsed * 0.00065;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.translate(SIZE / 2, SIZE / 2);

      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const x = point.x * cos - point.z * sin;
        const z = point.x * sin + point.z * cos;
        const depth = (z + RADIUS) / (2 * RADIUS);
        const rim = Math.min(Math.hypot(x, point.y) / RADIUS, 1);
        const transformedPoint = transformedPoints[i];
        transformedPoint.x = x;
        transformedPoint.y = point.y;
        transformedPoint.z = z;
        transformedPoint.color = point.color;
        transformedPoint.size = 0.45 + depth * 1.25;
        transformedPoint.opacity = Math.min(1, (0.16 + Math.pow(rim, 2) * 0.7) * (0.45 + depth * 0.55) * point.highlight);
      }

      transformedPoints.sort((a, b) => a.z - b.z);
      for (const point of transformedPoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.globalAlpha = point.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    createVisibleAnimationLoop(canvas, render);
  };

  initThreatParticleGlobe();

  // Stage 6: Operational Proof quote navigation
  const prevQuoteBtn = document.getElementById('prevQuoteBtn');
  const nextQuoteBtn = document.getElementById('nextQuoteBtn');
  const quoteEl = document.getElementById('testimonialQuote');
  const nameEl = document.getElementById('testimonialName');
  const roleEl = document.getElementById('testimonialRole');
  const avatarEl = document.getElementById('testimonialAvatar');
  const testimonials = [
    {
      name: 'ALEX MORGAN',
      role: 'INVENTORY MANAGER // MAIN CENTRAL WAREHOUSE (WH)',
      avatar: 'assets/hero_twin.png',
      quote: 'Before StockSense, our warehouse floor suffered from phantom stockouts and disconnected WhatsApp updates. With the double-entry immutable ledger and dynamic Free-to-Use stock calculations, book stock matches physical rack counts with 99.4% accuracy across 128 bins.',
    },
    {
      name: 'SAMANTHA REYES',
      role: 'HEAD OF LOGISTICS // NORTH DISTRIBUTION HUB (NDH)',
      avatar: 'assets/hero_amr.png',
      quote: 'The in-app camera barcode scanner and 3D digital twin visual map completely eliminated hardware terminal dependencies. Our warehouse staff processes inbound shipments in under 90 seconds, and transfer reconciliation is fully automated.',
    },
  ];

  if (quoteEl && nameEl && roleEl) {
    let currentTestimonial = 0;
    const showTestimonial = (index) => {
      currentTestimonial = (index + testimonials.length) % testimonials.length;
      const item = testimonials[currentTestimonial];
      const cursor = document.createElement('span');
      cursor.className = 'trusted-typing-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '_';
      quoteEl.replaceChildren(document.createTextNode(`"${item.quote}"`), cursor);
      nameEl.textContent = item.name;
      roleEl.textContent = item.role;
      if (avatarEl) {
        avatarEl.src = item.avatar;
        avatarEl.alt = item.name;
      }
    };

    prevQuoteBtn?.addEventListener('click', () => showTestimonial(currentTestimonial - 1));
    nextQuoteBtn?.addEventListener('click', () => showTestimonial(currentTestimonial + 1));
  }

  // Footer "Get in Touch" button triggers briefing modal
  const openDemoBtnFooter = document.getElementById('openDemoBtnFooter');
  if (openDemoBtnFooter && demoModal) {
    openDemoBtnFooter.addEventListener('click', () => {
      demoModal.showModal();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreatShield);
} else {
  initThreatShield();
}
