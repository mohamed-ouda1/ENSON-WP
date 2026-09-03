/* ==========================================================================
   ENSON GmbH - Wärmepumpen Landing Page Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initMobileDrawer();
  initHeader();
  initCalculator();
  initFunnel();
  initFaqAccordion();
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   1. Theme Switcher (Dark / Light Mode & Logo Switching)
   -------------------------------------------------------------------------- */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle');
  const headerLogo = document.getElementById('header-logo-img');
  const footerLogo = document.getElementById('footer-logo-img');
  const mobileLogo = document.getElementById('mobile-logo-img');

  // Check saved theme or default to dark
  const savedTheme = localStorage.getItem('enson-theme') || 'dark';
  setTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('enson-theme', theme);

    // Switch logos: in dark mode use logo-light.png, in light mode use logo-dark.png
    const logoSrc = theme === 'dark' ? 'logo-light.png' : 'logo-dark.png';
    if (headerLogo) headerLogo.src = logoSrc;
    if (footerLogo) footerLogo.src = logoSrc;
    if (mobileLogo) mobileLogo.src = logoSrc;
  }
}

/* --------------------------------------------------------------------------
   2. Mobile Drawer Navigation
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const openBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  // Close when clicking backdrop
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
    }
  });

  // Close when clicking any mobile link
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   3. Header Scroll Effect
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   4. Interactive Savings & KfW Subsidy Calculator
   -------------------------------------------------------------------------- */
function initCalculator() {
  const areaSlider = document.getElementById('calc-area-slider');
  const areaDisplay = document.getElementById('calc-area-val');
  const fuelButtons = document.querySelectorAll('.fuel-btn');
  const buildingButtons = document.querySelectorAll('.building-btn');

  const annualSavingsEl = document.getElementById('calc-savings-val');
  const subsidyPercentEl = document.getElementById('calc-subsidy-percent');
  const subsidyAmountEl = document.getElementById('calc-subsidy-amount');
  const co2SavingsEl = document.getElementById('calc-co2-val');
  const amortizationEl = document.getElementById('calc-amort-val');

  if (!areaSlider || !annualSavingsEl) return;

  // State
  let currentArea = parseInt(areaSlider.value, 10) || 160;
  let currentFuel = 'gas'; // 'gas', 'oil', 'electric', 'pellet'
  let currentBuilding = 'teilsaniert'; // 'altbau', 'teilsaniert', 'neubau'

  function updateSliderBackground(slider) {
    const min = parseFloat(slider.min) || 80;
    const max = parseFloat(slider.max) || 350;
    const val = parseFloat(slider.value) || 160;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #D9A036 0%, #D9A036 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`;
  }

  function calculate() {
    let specificDemand = 130; // kWh/m²/year
    if (currentBuilding === 'altbau') specificDemand = 180;
    if (currentBuilding === 'teilsaniert') specificDemand = 120;
    if (currentBuilding === 'neubau') specificDemand = 65;

    const totalHeatKwh = currentArea * specificDemand;

    let oldCostPerKwh = 0.135;
    let co2PerKwh = 0.24;

    if (currentFuel === 'gas') {
      oldCostPerKwh = 0.135;
      co2PerKwh = 0.24;
    } else if (currentFuel === 'oil') {
      oldCostPerKwh = 0.155;
      co2PerKwh = 0.31;
    } else if (currentFuel === 'electric') {
      oldCostPerKwh = 0.38;
      co2PerKwh = 0.42;
    } else if (currentFuel === 'pellet') {
      oldCostPerKwh = 0.11;
      co2PerKwh = 0.04;
    }

    const oldAnnualHeatingCost = totalHeatKwh * oldCostPerKwh;
    const heatPumpPowerKwh = totalHeatKwh / 4.8;
    const heatPumpElectricityCost = heatPumpPowerKwh * 0.27;

    let annualSavings = Math.max(750, Math.round(oldAnnualHeatingCost - heatPumpElectricityCost));
    let co2SavedTons = ((totalHeatKwh * co2PerKwh - heatPumpPowerKwh * 0.35) / 1000).toFixed(1);
    if (co2SavedTons < 1.5) co2SavedTons = 1.8;

    let estInvestment = 24000 + (currentArea > 180 ? 4500 : 0);
    let maxSubsidyBase = Math.min(estInvestment, 30000);
    let subsidyAmount = Math.round(maxSubsidyBase * 0.70);

    let netInvestment = estInvestment - subsidyAmount;
    let amortYears = (netInvestment / annualSavings).toFixed(1);
    if (amortYears < 3.2) amortYears = '3.5';

    // Update DOM
    annualSavingsEl.textContent = `${annualSavings.toLocaleString('de-DE')} € / Jahr`;
    subsidyPercentEl.textContent = `Bis zu 70% Zuschuss`;
    subsidyAmountEl.textContent = `bis zu ${subsidyAmount.toLocaleString('de-DE')} €`;
    co2SavingsEl.textContent = `${co2SavedTons} Tonnen / Jahr`;
    amortizationEl.textContent = `ca. ${amortYears} Jahre`;
  }

  areaSlider.addEventListener('input', (e) => {
    currentArea = parseInt(e.target.value, 10);
    areaDisplay.textContent = `${currentArea} m²`;
    updateSliderBackground(areaSlider);
    calculate();
  });

  fuelButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      fuelButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFuel = btn.dataset.fuel;
      calculate();
    });
  });

  buildingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buildingButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentBuilding = btn.dataset.building;
      calculate();
    });
  });

  updateSliderBackground(areaSlider);
  calculate();
}

/* --------------------------------------------------------------------------
   5. Multi-Step Lead Funnel (60-Sekunden Förder-Check)
   -------------------------------------------------------------------------- */
function initFunnel() {
  const steps = document.querySelectorAll('.funnel-step');
  const progressBar = document.getElementById('funnel-progress');
  const prevBtn = document.getElementById('funnel-prev-btn');
  const nextBtn = document.getElementById('funnel-next-btn');
  const submitBtn = document.getElementById('funnel-submit-btn');
  const stepIndicators = document.querySelectorAll('.funnel-step-indicators span');

  let currentStep = 1;
  const totalSteps = 5;

  const funnelData = {
    buildingType: 'Einfamilienhaus',
    currentHeating: 'Gasheizung',
    heatingType: 'Klassische Heizkörper',
    hasPv: 'Bereits vorhanden',
    zipCode: '',
    name: '',
    phone: '',
    email: ''
  };

  document.querySelectorAll('.funnel-choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.funnel-choice-grid');
      parent.querySelectorAll('.funnel-choice-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      const field = btn.dataset.field;
      const value = btn.dataset.value;
      if (field) {
        funnelData[field] = value;
      }

      setTimeout(() => {
        if (currentStep < totalSteps) {
          goToStep(currentStep + 1);
        }
      }, 250);
    });
  });

  function goToStep(step) {
    if (step < 1 || step > totalSteps + 1) return;

    currentStep = step;

    steps.forEach((s) => {
      s.classList.remove('active');
      if (parseInt(s.dataset.step, 10) === currentStep) {
        s.classList.add('active');
      }
    });

    const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    stepIndicators.forEach((ind, idx) => {
      ind.classList.remove('active', 'completed');
      if (idx + 1 === currentStep) {
        ind.classList.add('active');
      } else if (idx + 1 < currentStep) {
        ind.classList.add('completed');
      }
    });

    if (prevBtn) {
      prevBtn.style.display = currentStep > 1 && currentStep <= totalSteps ? 'inline-flex' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    }
    if (submitBtn) {
      submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) goToStep(currentStep + 1);
    });
  }

  const leadForm = document.getElementById('funnel-lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      funnelData.name = document.getElementById('lead-name')?.value || '';
      funnelData.phone = document.getElementById('lead-phone')?.value || '';
      funnelData.email = document.getElementById('lead-email')?.value || '';
      funnelData.zipCode = document.getElementById('lead-zip')?.value || '';

      if (!funnelData.phone || !funnelData.email) {
        alert('Bitte geben Sie Ihre Telefonnummer und E-Mail-Adresse ein.');
        return;
      }

      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fördermittel werden reserviert...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        goToStep(6);
        const footerNav = document.querySelector('.funnel-nav-footer');
        if (footerNav) footerNav.style.display = 'none';

        const summaryUserEl = document.getElementById('success-user-name');
        if (summaryUserEl && funnelData.name) {
          summaryUserEl.textContent = funnelData.name;
        }
      }, 1000);
    });
  }
}

/* --------------------------------------------------------------------------
   6. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('open');
      });

      if (isOpen) {
        item.classList.remove('open');
      } else {
        item.classList.add('open');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Smooth Scroll for Anchor Links
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
