/**
 * ENSON Wärmepumpen Landing Page Scripts
 * Fully integrated with the design system of index1.css
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeader();
    initMobileNav();
    initWizard();
    initFaqAccordion();
    initPrivacyAccordion();
    initScrollAnimations();
    initContactForms();
    initModal();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check saved theme or default to dark
    const savedTheme = localStorage.getItem('enson-theme') || 'dark';
    
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
                localStorage.setItem('enson-theme', 'light');
            } else {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                localStorage.setItem('enson-theme', 'dark');
            }
        });
    }
}

/* --------------------------------------------------------------------------
   2. Header Scroll Effect
   -------------------------------------------------------------------------- */
function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Menu
   -------------------------------------------------------------------------- */
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (!toggleBtn || !mainNav) return;

    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });

    // Close on nav link click
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleBtn.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (mainNav.classList.contains('active') && !mainNav.contains(e.target) && !toggleBtn.contains(e.target)) {
            toggleBtn.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });
}

/* --------------------------------------------------------------------------
   4. Multi-Step Online Check Wizard
   -------------------------------------------------------------------------- */
function initWizard() {
    const form = document.getElementById('online-check-form');
    if (!form) return;

    const steps = form.querySelectorAll('.wizard-step');
    const stepLabel = document.getElementById('wizard-step-label');
    const percentageLabel = document.getElementById('wizard-percentage');
    const progressFill = document.getElementById('wizard-progress-fill');
    
    let currentStep = 1;
    const totalSteps = steps.length;

    // Option cards selection handling
    form.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function () {
            const container = this.closest('.option-cards-list');
            if (!container) return;

            container.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    function updateStepView(stepNum) {
        currentStep = stepNum;

        steps.forEach(step => {
            const stepIndex = parseInt(step.dataset.step, 10);
            if (stepIndex === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        const progressPercent = Math.round((currentStep / totalSteps) * 100);
        
        if (stepLabel) {
            stepLabel.textContent = `Frage ${currentStep} von ${totalSteps}`;
        }
        if (percentageLabel) {
            percentageLabel.textContent = `${progressPercent}%`;
        }
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
    }

    // Next buttons
    form.querySelectorAll('.wizard-next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                updateStepView(currentStep + 1);
            }
        });
    });

    // Prev buttons
    form.querySelectorAll('.wizard-prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                updateStepView(currentStep - 1);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wird übermittelt...';
        }

        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kostenloses Angebot anfordern →';
            }
            openModal();
            form.reset();
            updateStepView(1);
        }, 800);
    });
}

/* --------------------------------------------------------------------------
   5. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close others
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });

            // Toggle current
            if (isOpen) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

function initPrivacyAccordion() {
    const privacyItems = document.querySelectorAll('.privacy-card-item');
    if (!privacyItems.length) return;

    privacyItems.forEach(item => {
        const trigger = item.querySelector('.privacy-trigger');
        const panel = item.querySelector('.privacy-panel');
        if (!trigger || !panel) return;

        // Set initial state
        if (item.classList.contains('active')) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
            trigger.setAttribute('aria-expanded', 'true');
        } else {
            panel.style.maxHeight = '0px';
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            if (isOpen) {
                item.classList.remove('active');
                panel.style.maxHeight = '0px';
                trigger.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                panel.style.maxHeight = panel.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   6. Contact Lead Forms
   -------------------------------------------------------------------------- */
function initContactForms() {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) return;

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = leadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wird gesendet...';
        }

        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kostenlose Beratung anfordern →';
            }
            openModal();
            leadForm.reset();
        }, 800);
    });
}

/* --------------------------------------------------------------------------
   7. Success Modal Popup
   -------------------------------------------------------------------------- */
function initModal() {
    const modal = document.getElementById('success-modal');
    const closeX = document.getElementById('modal-x-close');
    const closeBtn = document.getElementById('success-modal-close');

    if (!modal) return;

    window.openModal = function () {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function () {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (closeX) closeX.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* --------------------------------------------------------------------------
   8. Scroll Triggered Animations
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}
