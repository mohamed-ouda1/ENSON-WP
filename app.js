/* ==========================================================================
   ENSON WÄRMEPUMPEN - INTERACTIVE JAVASCRIPT
   Energy Flow Canvas | KfW Subsidy Calculator | Modals | Mobile Nav & Lead Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Animated Energy Flow Canvas in Hero
  initEnergyCanvas();

  // 2. Initialize KfW Subsidy Calculator
  initSubsidyCalculator();

  // 3. Initialize 3D Modal & Interactive Badges
  init3DModal();

  // 4. Initialize Mobile Menu Navigation & Smooth Scrolling
  initNavigation();

  // 5. Initialize Lead Form & Toast Notification
  initLeadForm();
});

/* ==========================================================================
   1. ENERGY FLOW CANVAS ANIMATION
   ========================================================================== */
function initEnergyCanvas() {
  const canvas = document.getElementById('energyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  const particleCount = 28;

  const paths = [
    [
      { x: 0.68, y: 0.76 },
      { x: 0.60, y: 0.77 },
      { x: 0.50, y: 0.76 },
      { x: 0.35, y: 0.75 },
      { x: 0.20, y: 0.74 },
      { x: 0.05, y: 0.74 }
    ],
    [
      { x: 0.68, y: 0.76 },
      { x: 0.75, y: 0.78 },
      { x: 0.85, y: 0.75 },
      { x: 0.92, y: 0.65 }
    ],
    [
      { x: 0.68, y: 0.76 },
      { x: 0.65, y: 0.60 },
      { x: 0.55, y: 0.50 },
      { x: 0.45, y: 0.50 }
    ]
  ];

  class EnergyParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.pathIndex = Math.floor(Math.random() * paths.length);
      this.path = paths[this.pathIndex];
      this.progress = Math.random();
      this.speed = 0.003 + Math.random() * 0.004;
      this.radius = 2 + Math.random() * 2.5;
      this.alpha = 0.4 + Math.random() * 0.6;
    }

    update() {
      this.progress += this.speed;
      if (this.progress > 1) {
        this.reset();
        this.progress = 0;
      }
    }

    getPosition() {
      const totalSegments = this.path.length - 1;
      const currentSegment = Math.min(Math.floor(this.progress * totalSegments), totalSegments - 1);
      const segmentProgress = (this.progress * totalSegments) - currentSegment;

      const p0 = this.path[currentSegment];
      const p1 = this.path[currentSegment + 1];

      const x = (p0.x + (p1.x - p0.x) * segmentProgress) * canvas.width;
      const y = (p0.y + (p1.y - p0.y) * segmentProgress) * canvas.height;

      return { x, y };
    }

    draw(ctx) {
      const pos = this.getPosition();
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(16, 232, 138, ${this.alpha})`;
      ctx.shadowColor = '#10e88a';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new EnergyParticle());
  }

  function drawPaths() {
    ctx.save();
    paths.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p[0].x * canvas.width, p[0].y * canvas.height);
      for (let i = 1; i < p.length; i++) {
        ctx.lineTo(p[i].x * canvas.width, p[i].y * canvas.height);
      }
      ctx.strokeStyle = 'rgba(16, 232, 138, 0.25)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10e88a';
      ctx.shadowBlur = 8;
      ctx.stroke();
    });
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaths();

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. FÖRDERUNGS-CHECK & WÄRMEPUMPEN MULTI-STEP WIZARD 2026
   ========================================================================== */
function initSubsidyCalculator() {
  const steps = document.querySelectorAll('.calc-step');
  const totalSteps = steps.length || 4;
  let currentStep = 1;

  // Step Indicators & Progress
  const currentStepNum = document.getElementById('currentStepNum');
  const stepTitleHint = document.getElementById('stepTitleHint');
  const wizardProgressFill = document.getElementById('wizardProgressFill');
  const indicatorDots = document.querySelectorAll('.step-dot-item');

  // Summary Elements
  const sumBuilding = document.getElementById('sumBuilding');
  const sumHeating = document.getElementById('sumHeating');
  const sumArea = document.getElementById('sumArea');
  const sumDistribution = document.getElementById('sumDistribution');

  // Interactive Inputs
  const buildingCards = document.querySelectorAll('#calcBuildingType .calc-choice-card');
  const heatingCards = document.querySelectorAll('#calcCurrentHeating .calc-choice-card');
  const distributionCards = document.querySelectorAll('#calcHeatDistribution .calc-choice-card');
  const areaRange = document.getElementById('areaRange');
  const areaDisplay = document.getElementById('areaDisplay');

  // Nav Buttons
  const nextBtns = document.querySelectorAll('.wizard-btn-next');
  const prevBtns = document.querySelectorAll('.wizard-btn-prev');
  const form = document.getElementById('subsidyInquiryForm');
  const toast = document.getElementById('toastNotification');

  const stepHints = [
    'Gebäudetyp auswählen',
    'Bestehende Heizung wählen',
    'Wohnfläche & Wärmeverteilung',
    'Kontaktdaten eingeben'
  ];

  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > totalSteps) return;

    currentStep = stepNum;

    // 1. Update Step Containers
    steps.forEach(step => {
      const s = parseInt(step.dataset.step, 10);
      if (s === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // 2. Update Progress Bar & Counter
    const progressPercent = (currentStep / totalSteps) * 100;
    if (wizardProgressFill) {
      wizardProgressFill.style.width = `${progressPercent}%`;
    }
    if (currentStepNum) {
      currentStepNum.textContent = currentStep;
    }
    if (stepTitleHint) {
      stepTitleHint.textContent = stepHints[currentStep - 1] || '';
    }

    // 3. Update Indicator Dots
    indicatorDots.forEach(dot => {
      const target = parseInt(dot.dataset.stepTarget, 10);
      dot.classList.remove('active', 'completed');
      if (target === currentStep) {
        dot.classList.add('active');
      } else if (target < currentStep) {
        dot.classList.add('completed');
      }
    });
  }

  // Next / Prev button listeners
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.nextStep, 10) || currentStep + 1;
      goToStep(nextStep);
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.dataset.prevStep, 10) || currentStep - 1;
      goToStep(prevStep);
    });
  });

  // Step 1: Gebäudeart Choices
  buildingCards.forEach(card => {
    card.addEventListener('click', () => {
      buildingCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const val = card.dataset.val || card.querySelector('.choice-title')?.textContent.trim();
      if (sumBuilding) sumBuilding.textContent = val;

      // Smooth auto-advance to step 2
      setTimeout(() => {
        if (currentStep === 1) goToStep(2);
      }, 250);
    });
  });

  // Step 2: Aktuelle Heizung Choices
  heatingCards.forEach(card => {
    card.addEventListener('click', () => {
      heatingCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const val = card.dataset.val || card.querySelector('.choice-title')?.textContent.trim();
      if (sumHeating) sumHeating.textContent = val;

      // Smooth auto-advance to step 3
      setTimeout(() => {
        if (currentStep === 2) goToStep(3);
      }, 250);
    });
  });

  // Step 3: Wohnfläche Slider & Heat Distribution
  if (areaRange && areaDisplay) {
    areaRange.addEventListener('input', (e) => {
      const val = `${e.target.value} m²`;
      areaDisplay.textContent = val;
      if (sumArea) sumArea.textContent = val;
    });
  }

  distributionCards.forEach(card => {
    card.addEventListener('click', () => {
      distributionCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const val = card.dataset.val || card.querySelector('.choice-title')?.textContent.trim();
      if (sumDistribution) sumDistribution.textContent = val;
    });
  });

  // Direct Click on step indicators (if already reached)
  indicatorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.stepTarget, 10);
      if (target <= currentStep || dot.classList.contains('completed')) {
        goToStep(target);
      }
    });
  });

  // Step 4: Final Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('calcUserName')?.value.trim();
      const phone = document.getElementById('calcUserPhone')?.value.trim();
      const email = document.getElementById('calcUserEmail')?.value.trim();

      if (!name || !phone || !email) {
        alert('Bitte füllen Sie alle erforderlichen Kontaktdaten aus (Name, Telefon und E-Mail).');
        return;
      }

      if (toast) {
        toast.classList.add('active');

        // Reset inputs
        const nameInput = document.getElementById('calcUserName');
        const phoneInput = document.getElementById('calcUserPhone');
        const emailInput = document.getElementById('calcUserEmail');
        const msgInput = document.getElementById('calcUserMsg');
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (emailInput) emailInput.value = '';
        if (msgInput) msgInput.value = '';

        // Return to step 1 after success
        setTimeout(() => {
          goToStep(1);
          toast.classList.remove('active');
        }, 5000);
      }
    });
  }

  // Initialize at step 1
  goToStep(1);
}

/* ==========================================================================
   3. 3D CUTAWAY MODAL (DESKTOP & MOBILE RESPONSIVE)
   ========================================================================== */
function init3DModal() {
  const trigger = document.getElementById('cutawayTrigger');
  const modal = document.getElementById('cutawayModal');
  const closeBtn = document.getElementById('modalClose');

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (trigger) trigger.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   4. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
      }
    });
  }

  // Active Link Highlight on Scroll
  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 140;
      const secHeight = sec.clientHeight;
      if (pageYOffset >= secTop && pageYOffset < secTop + secHeight) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   5. LEAD FORM SUBMISSION & TOAST
   ========================================================================== */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  const toast = document.getElementById('toastNotification');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('userName').value.trim();
      const phone = document.getElementById('userPhone').value.trim();
      const email = document.getElementById('userEmail').value.trim();

      if (!name || !phone || !email) {
        alert('Bitte füllen Sie alle erforderlichen Felder aus.');
        return;
      }

      if (toast) {
        toast.classList.add('active');
        form.reset();

        setTimeout(() => {
          toast.classList.remove('active');
        }, 5000);
      }
    });
  }
}
