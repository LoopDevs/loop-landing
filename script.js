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
        this.currentZoomIndex = -1;

        // Store initial logo data after a delay to ensure CSS is applied
        setTimeout(() => {
            this.storeInitialLogoData();
        }, 100);
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

        console.log(`Initialized ${this.logoData.length} logos`);
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

                // Debug first logo
                if (index === 0 && animProgress > 0.1) {
                    console.log(`Logo 0: Progress ${animProgress.toFixed(2)}, Translation: (${currX.toFixed(0)}, ${currY.toFixed(0)})`);
                }
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

        if (scrollProgress > slideInStart) {
            const slideProgress = Math.min((scrollProgress - slideInStart) / (slideInEnd - slideInStart), 1);
            this.mockupContainer.style.opacity = 1; // Always full opacity

            // Unstick after simplified animations complete
            const unstickAt = this.heroHeight * 3.8;
            if (scrollY > unstickAt) {
                // Stop being sticky; let it scroll naturally
                this.mockupContainer.style.display = 'flex';
                this.mockupContainer.style.position = 'relative';
                this.mockupContainer.style.top = 'auto';
                this.mockupContainer.style.marginBottom = '0';
                this.mockupContainer.style.transform = 'translateY(0) scale(1)';
            } else {
                this.mockupContainer.style.display = 'flex';
                // Stay sticky and centered during all animation stages
                this.mockupContainer.style.position = 'sticky';
                this.mockupContainer.style.top = '50%';
                this.mockupContainer.style.marginBottom = '0';


                if (slideProgress < 1) {
                    // Stage 1: Sliding up over header
                    const translateY = 50 - (slideProgress * 100);
                    const scale = 0.9 + (slideProgress * 0.1);
                    this.mockupContainer.style.transform = `translateY(${translateY}vh) scale(${scale})`;
                } else {
                    // Centered for zoom animations
                    this.mockupContainer.style.transform = `translateY(-50%) scale(1)`;
                }
            }
        } else {
            // Initial state - hidden below
            this.mockupContainer.style.opacity = 0;
            this.mockupContainer.style.transform = 'translateY(50vh) scale(0.9)';
            this.mockupContainer.style.position = 'sticky';
            this.mockupContainer.style.top = '50%';
            this.mockupContainer.style.marginBottom = '0';
        }
    }

    handleZoomAnimations(scrollY) {
        // Simplified stages: full view -> top zoom -> middle zoom -> zoom out
        const mockupScrollStart = this.heroHeight * 0.5;

        const stageTopZoom = mockupScrollStart;                                 // Zoom to top
        const stageMiddleZoom = mockupScrollStart + this.heroHeight * 0.8;     // Start middle zoom a bit earlier
        const stageZoomOut = mockupScrollStart + this.heroHeight * 2.6;        // Extend middle zoom duration
        const stageEnd = mockupScrollStart + this.heroHeight * 3.0;            // End window for zoom-out

        // Fade gift-cards annotation slightly before zoom-out begins
        const giftcardsHide = mockupScrollStart + this.heroHeight * 2.4;

        // Reset classes each frame
        this.iphoneMockup.className = 'iphone-mockup';
        // Reset annotations each frame
        if (this.cashbackAnnotation) this.cashbackAnnotation.classList.remove('visible');
        if (this.giftcardsAnnotation) this.giftcardsAnnotation.classList.remove('visible');

        if (scrollY < stageTopZoom) {
            // Full view
        } else if (scrollY < stageMiddleZoom) {
            // Top zoom
            this.iphoneMockup.classList.add('zoom-card');
            if (this.cashbackAnnotation) this.cashbackAnnotation.classList.add('visible');
        } else if (scrollY < stageZoomOut) {
            // Middle zoom
            this.iphoneMockup.classList.add('zoom-merchants');
            if (this.giftcardsAnnotation && scrollY < giftcardsHide) {
                this.giftcardsAnnotation.classList.add('visible');
            }
        } else if (scrollY < stageEnd) {
            // Zoom out
            this.iphoneMockup.classList.add('zoom-out');
        }

        // Trigger review animations when in view
        this.animateReviewsInView();
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

// Force scroll reset on page load (before DOM ready)
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// Also reset on beforeunload for some browsers
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Disable smooth scroll temporarily
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    // Force scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Multiple attempts to ensure scroll reset
    requestAnimationFrame(() => {
        window.scrollTo(0, 0);

        setTimeout(() => {
            window.scrollTo(0, 0);
            // Re-enable smooth scrolling after all resets
            document.documentElement.style.scrollBehavior = 'smooth';
            document.body.style.scrollBehavior = 'smooth';
        }, 50);
    });

    new ScrollAnimationController();
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
});
