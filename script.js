// Scroll Animation Controller
class ScrollAnimationController {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.hero = document.querySelector('.hero');
        this.heroTitle = document.querySelector('.hero-title');
        this.logos = document.querySelectorAll('.logo');
        this.floatingLogos = document.querySelector('.floating-logos');
        this.mockupContainer = document.querySelector('.mockup-container');
        this.iphoneMockup = document.querySelector('.iphone-mockup');
        this.zoomAreas = document.querySelectorAll('.zoom-area');
        this.logoContainer = document.querySelector('.logo-container');
        this.downloadButtons = document.querySelector('.download-buttons');
        this.cashbackAnnotation = document.querySelector('.cashback-annotation-external');
        this.giftcardsAnnotation = document.querySelector('.giftcards-annotation-external');

        this.heroHeight = window.innerHeight;
        this.mockupSectionStart = this.heroHeight;
        this.timeline = this.computeTimeline();
        // Debug disabled
        this.debug = false;
        this.prevStage = 'init';
        this._lastStickyState = undefined;
        // 0..1 of unified timeline to unstick; set <1 for earlier unstick
        this.unstickFrac = 1.0;

        this.currentZoomIndex = -1;

        // Store initial logo data after a delay to ensure CSS is applied
        setTimeout(() => {
            this.storeInitialLogoData();
        }, 100);

        // Set initial section height so sticky ends cleanly without large gaps
        this.updateSectionHeight();
    }

    computeTimeline() {
        // Unified scroll timeline for the mockup sequence
        // start: when sequence begins
        // end: when sequence finishes and mockup unsticks
        const start = this.heroHeight * 0.5;     // after initial header/slide-in
        const total = this.heroHeight * 3.2;     // total sequence length
        const end = start + total;
        return { start, end, total };
    }

    updateSectionHeight() {
        // Compute container height so sticky holds only as long as needed
        const desktop = window.innerWidth >= 1024;
        const zoomOutStartAbs = 3200; // desktop zoom-out threshold

        // Runway after the zoom-out phase before the section ends
        const runway = desktop ? this.heroHeight * 2.0 : this.heroHeight * 1.0;

        // Base needed height (timeline end + runway)
        const baseNeeded = this.timeline.end + runway;
        // Ensure enough space for desktop absolute zoom-out start + runway
        const desktopNeeded = desktop ? (zoomOutStartAbs + runway + this.heroHeight * 0.2) : 0;
        const needed = Math.max(baseNeeded, desktopNeeded);

        const section = document.querySelector('.mockup-section');
        if (section) {
            section.style.height = `${Math.ceil(needed)}px`;
        }
    }

    storeInitialLogoData() {
        this.logoData = [];

        this.logos.forEach((logo, index) => {
            // Get the initial bounding rect
            const rect = logo.getBoundingClientRect();

            // Store initial data for each logo
            this.logoData.push({
                element: logo,
                initialX: rect.left + rect.width / 2,
                initialY: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height
            });
        });

        // debug removed
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.heroHeight;

        // Show/hide logo background
        this.updateLogoBackground(scrollY);

        // Animate logos converging to center
        this.animateLogos(scrollProgress);

        // Animate title fading
        this.animateTitleFade(scrollProgress);

        // Show iPhone mockup
        this.showMockup(scrollY);

        // Handle zoom animations
        this.handleZoomAnimations(scrollY);
    }

    // debug helpers removed

    updateLogoBackground(scrollY) {
        // Add background to logo when scrolling
        if (scrollY > 50) {
            this.logoContainer?.classList.add('scrolled');
        } else {
            this.logoContainer?.classList.remove('scrolled');
        }
    }

    animateLogos(scrollProgress) {
        if (!this.logoData || this.logoData.length === 0) return;

        // Center of viewport
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Animation progress (0 to 1, completes at 50% scroll)
        const animProgress = Math.min(scrollProgress * 2, 1);

        this.logoData.forEach((data, index) => {
            const logo = data.element;

            if (animProgress > 0) {
                // Disable float animation
                logo.style.animation = 'none';

                // Calculate distance to center from initial position
                const distX = centerX - data.initialX;
                const distY = centerY - data.initialY;

                // Current position based on animation progress
                const currX = distX * animProgress;
                const currY = distY * animProgress;

                // Scale and fade
                const scale = 1 - (animProgress * 0.5);
                const opacity = Math.max(0, 1 - animProgress);

                // Apply transform
                logo.style.transform = `translate(${currX}px, ${currY}px) scale(${scale})`;
                logo.style.opacity = opacity;

                // debug removed
            } else {
                // Reset to original state
                logo.style.animation = '';
                logo.style.transform = '';
                logo.style.opacity = '';
            }
        });
    }

    animateTitleFade(progress) {
        // Scale down the title as phone appears
        const scaleStart = 0.05;  // Start scaling when phone starts appearing
        const scaleEnd = 0.4;     // Complete when phone is in position

        if (progress > scaleStart) {
            const scaleProgress = Math.min((progress - scaleStart) / (scaleEnd - scaleStart), 1);

            // Scale down and fade - completely disappear at the end
            const scale = 1 - (scaleProgress * 0.4);  // Scale down to 60%
            const opacity = Math.max(0, 1 - scaleProgress); // Fade to 0 opacity
            const blur = scaleProgress * 8;            // Add blur

            this.heroTitle.style.transform = `scale(${scale})`;
            this.heroTitle.style.opacity = opacity;
            this.heroTitle.style.filter = `blur(${blur}px)`;

            // Hide completely when fully faded
            if (opacity === 0) {
                this.heroTitle.style.visibility = 'hidden';
            } else {
                this.heroTitle.style.visibility = 'visible';
            }

            // Also fade and scale down download buttons
            if (this.downloadButtons) {
                const btnScale = 1 - (scaleProgress * 0.3);  // Scale down to 70%
                const btnOpacity = Math.max(0, 1 - scaleProgress); // Fade completely
                this.downloadButtons.style.transform = `scale(${btnScale})`;
                this.downloadButtons.style.opacity = btnOpacity;
                this.downloadButtons.style.filter = `blur(${blur * 0.5}px)`;

                // Hide completely when fully faded
                if (btnOpacity === 0) {
                    this.downloadButtons.style.visibility = 'hidden';
                } else {
                    this.downloadButtons.style.visibility = 'visible';
                }
            }
        } else {
            this.heroTitle.style.transform = 'scale(1)';
            this.heroTitle.style.opacity = 1;
            this.heroTitle.style.filter = 'blur(0px)';
            this.heroTitle.style.visibility = 'visible';

            if (this.downloadButtons) {
                this.downloadButtons.style.transform = 'scale(1)';
                this.downloadButtons.style.opacity = 1;
                this.downloadButtons.style.filter = 'blur(0px)';
                this.downloadButtons.style.visibility = 'visible';
            }
        }
    }

    showMockup(scrollY) {
        // Progressive slide-up for the mockup (no fade, full opacity)
        const scrollProgress = scrollY / this.heroHeight;
        const slideInStart = 0.1;  // Start as header begins to fade
        const slideInEnd = 0.4;    // Complete slide-in as header disappears

        const isMobile = window.innerWidth < 768;
        if (scrollProgress > slideInStart) {
            const slideProgress = Math.min((scrollProgress - slideInStart) / (slideInEnd - slideInStart), 1);
            this.mockupContainer.style.opacity = 1; // Always full opacity

            // Keep container sticky at top:0, and animate the phone element instead
            this.mockupContainer.style.display = 'flex';
            this.mockupContainer.style.position = 'sticky';
            this.mockupContainer.style.top = '0';
            this.mockupContainer.style.marginBottom = '0';
            this._lastStickyState = 'sticky';

            if (slideProgress < 1) {
                // Slide the phone up from below the viewport and scale in
                const translateY = 50 - (slideProgress * 50); // 50vh -> 0
                const startScale = isMobile ? 0.78 : 0.9;
                const endScale = isMobile ? 0.92 : 1.0;
                const scale = startScale + (endScale - startScale) * slideProgress;
                this.iphoneMockup.style.transform = `translateY(${translateY}vh) scale(${scale})`;
            } else {
                // Clear inline transforms so zoom classes take over
                this.iphoneMockup.style.transform = '';
            }

            // debug removed
        } else {
            // Initial state - hidden below
            this.mockupContainer.style.opacity = 0;
            this.mockupContainer.style.position = 'sticky';
            this.mockupContainer.style.top = '0';
            this.mockupContainer.style.marginBottom = '0';
            // Phone starts lowered and slightly scaled down (smaller on mobile)
            const startScale = isMobile ? 0.78 : 0.9;
            this.iphoneMockup.style.transform = `translateY(50vh) scale(${startScale})`;
        }
    }

    handleZoomAnimations(scrollY) {
        // Simplified stages: full view -> top zoom -> middle zoom -> zoom out
        const start = this.timeline.start;
        const end = this.timeline.end;
        const progress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));

        // Stage fractions (relative), with desktop override for zoom-out start
        const topEndFrac = 0.30;      // end of top zoom
        const middleEndFrac = 0.78;   // end of extended middle zoom
        const desktop = window.innerWidth >= 1024;
        const zoomOutStartAbs = 3200; // desktop zoom-out threshold (scrollY)
        const topEndAbs = start + (end - start) * topEndFrac;
        const middleEndAbsDefault = start + (end - start) * middleEndFrac;
        const middleEndAbs = desktop ? zoomOutStartAbs : middleEndAbsDefault;

        // Reset classes each frame
        this.iphoneMockup.className = 'iphone-mockup';
        // Reset annotations each frame
        if (this.cashbackAnnotation) this.cashbackAnnotation.classList.remove('visible');
        if (this.giftcardsAnnotation) this.giftcardsAnnotation.classList.remove('visible');

        let stage = 'full';
        if (progress <= 0) {
            // Full view
        } else if (scrollY < topEndAbs) {
            // Top zoom
            this.iphoneMockup.classList.add('zoom-card');
            if (this.cashbackAnnotation) this.cashbackAnnotation.classList.add('visible');
            stage = 'zoom-top';
        } else if (scrollY < middleEndAbs) {
            // Middle zoom (longer)
            this.iphoneMockup.classList.add('zoom-merchants');
            // Hide slightly before the end to avoid overlap with transition
            const hideAhead = desktop ? 120 : (end - start) * 0.08; // px vs fraction
            if ((desktop ? (middleEndAbs - scrollY > hideAhead) : (progress < middleEndFrac - 0.08)) && this.giftcardsAnnotation) {
                this.giftcardsAnnotation.classList.add('visible');
            }
            stage = 'zoom-middle';
        } else {
            // Zoom out and hold full view through the end (single zoom-out stage)
            this.iphoneMockup.classList.add('zoom-out');
            stage = 'zoom-out';
        }

        // Trigger review animations when in view
        this.animateReviewsInView();

        // debug removed
    }

    animateReviewsInView() {
        const reviewsSection = document.querySelector('.reviews-section');
        if (!reviewsSection) return;

        const rect = reviewsSection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInView && !reviewsSection.classList.contains('animated')) {
            reviewsSection.classList.add('animated');
            // Reviews will animate via CSS animation
        }
    }

    handleResize() {
        this.heroHeight = window.innerHeight;
        this.mockupSectionStart = this.heroHeight;
        this.timeline = this.computeTimeline();
        this.updateSectionHeight();
        // Recalculate logo positions
        this.storeInitialLogoData();
    }
}

// Smooth Scroll Performance Optimization
class SmoothScrollOptimizer {
    constructor() {
        this.ticking = false;
        this.scrollY = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.requestTick());
    }

    requestTick() {
        this.scrollY = window.scrollY;
        if (!this.ticking) {
            window.requestAnimationFrame(() => this.updateAnimations());
            this.ticking = true;
        }
    }

    updateAnimations() {
        this.ticking = false;
    }
}

// Robust scroll-to-top helper (handles Safari/BCache quirks)
function forceScrollToTop() {
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) {}
    const el = document.scrollingElement || document.documentElement;

    const setTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        el.scrollTop = 0;
        document.body && (document.body.scrollTop = 0);
    };

    // Try a few frames to win any late layout/restore
    let attempts = 0; const maxAttempts = 20;
    const tick = () => {
        setTop();
        attempts++;
        if ((window.scrollY !== 0 || el.scrollTop !== 0) && attempts < maxAttempts) {
            requestAnimationFrame(tick);
        }
    };
    tick();
    // Extra timed nudges
    setTimeout(setTop, 50);
    setTimeout(setTop, 200);
}

// Reset on load and pageshow (including bfcache restores)
window.addEventListener('load', forceScrollToTop, { once: true });
window.addEventListener('pageshow', (e) => { forceScrollToTop(); });
window.addEventListener('beforeunload', () => { try { history.scrollRestoration = 'manual'; } catch (_) {} });

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Disable smooth scroll temporarily
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    // Force scroll to top
    forceScrollToTop();

    // Multiple attempts to ensure scroll reset
    requestAnimationFrame(() => {
        forceScrollToTop();

        setTimeout(() => {
            forceScrollToTop();
            // Re-enable smooth scrolling after all resets
            document.documentElement.style.scrollBehavior = 'smooth';
            document.body.style.scrollBehavior = 'smooth';
        }, 50);
    });

    const ctrl = new ScrollAnimationController();
    new SmoothScrollOptimizer();

    // Preload images for better performance
    const images = [
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nike.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/adidas.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/target.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/walmart.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ebay.svg',
        'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/etsy.svg'
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Load brand logos in scroller with robust fallbacks
    const loadWithFallback = (img) => {
        const srcs = (img.getAttribute('data-srcs') || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!srcs.length) return;
        let i = 0;
        const tryNext = () => {
            if (i >= srcs.length) return;
            img.onerror = () => { i++; tryNext(); };
            img.src = srcs[i];
        };
        tryNext();
    };
    document.querySelectorAll('.merchant-logo img[data-srcs]').forEach(loadWithFallback);
});
