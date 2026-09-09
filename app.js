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
   2. FÖRDERUNGSRECHNER (KfW 458 SUBSIDY CALCULATOR)
   ========================================================================== */
function initSubsidyCalculator() {
  const oldHeatingBtns = document.querySelectorAll('#calcOldHeating .calc-btn');
  const investRange = document.getElementById('investRange');
  const investDisplay = document.getElementById('investDisplay');
  const selfUsedCheck = document.getElementById('selfUsed');
  const lowIncomeCheck = document.getElementById('lowIncome');

  const subsidyPercentEl = document.getElementById('subsidyPercent');
  const speedBonusValEl = document.getElementById('speedBonusVal');
  const incomeBonusValEl = document.getElementById('incomeBonusVal');
  const subsidyAmountEl = document.getElementById('subsidyAmount');
  const netAmountEl = document.getElementById('netAmount');

  let oldHeatingBonus = 20;

  oldHeatingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      oldHeatingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      oldHeatingBonus = parseInt(btn.dataset.bonus, 10);
      calculateSubsidy();
    });
  });

  if (investRange) {
    investRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      investDisplay.textContent = formatEuro(val);
      calculateSubsidy();
    });
  }

  if (selfUsedCheck) selfUsedCheck.addEventListener('change', calculateSubsidy);
  if (lowIncomeCheck) lowIncomeCheck.addEventListener('change', calculateSubsidy);

  function calculateSubsidy() {
    const investTotal = parseInt(investRange ? investRange.value : 30000, 10);
    const maxEligibleCost = 30000;

    let baseRate = 30;
    let speedBonus = (selfUsedCheck && selfUsedCheck.checked && oldHeatingBonus > 0) ? 20 : 0;
    let incomeBonus = (lowIncomeCheck && lowIncomeCheck.checked && selfUsedCheck && selfUsedCheck.checked) ? 30 : 0;

    let totalRate = Math.min(70, baseRate + speedBonus + incomeBonus);

    const eligibleAmount = Math.min(investTotal, maxEligibleCost);
    const totalSubsidy = (eligibleAmount * (totalRate / 100));
    const netCost = investTotal - totalSubsidy;

    if (subsidyPercentEl) subsidyPercentEl.textContent = `${totalRate}%`;
    if (speedBonusValEl) speedBonusValEl.textContent = `+${speedBonus}%`;
    if (incomeBonusValEl) incomeBonusValEl.textContent = `+${incomeBonus}%`;
    if (subsidyAmountEl) subsidyAmountEl.textContent = formatEuro(totalSubsidy);
    if (netAmountEl) netAmountEl.textContent = formatEuro(netCost);
  }

  function formatEuro(num) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
  }

  calculateSubsidy();
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
