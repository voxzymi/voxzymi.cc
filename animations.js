/**
 * Page Animations System - FIXED
 */

class PageAnimations {
    constructor() {
        this.isTransitioning = false;
        this.animationDuration = 400;
        this.init();
    }

    init() {
        // Prevent pre-applied animate classes from auto-running before JS controls them
        try {
            document.querySelectorAll('[class*="animate-in"]').forEach(el => el.classList.remove('animate-in'));
        } catch (e) {}

        // Mark page as ready for animations
        if (document.body) {
            document.body.classList.add('animations-ready');
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.classList.add('animations-ready'), { once: true });
        }

        // FIXED: Only trigger entrance once by removing duplicate listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.animatePageEntry());
        } else {
            this.animatePageEntry();
        }

        this.setupNavigation();
        try {
            this.observeScrollAnimations();
        } catch (e) {
            console.warn('[PageAnimations] observeScrollAnimations failed', e);
        }
    }

    animatePageEntry() {
        document.body.classList.add('page-entering');

        // Delay elements for the stagger effect
        setTimeout(() => {
            this.animateElements([
                '.about-panel', '.container', '.page-grid', 'h1', 'h2', 'h3',
                '.card', '.input-group', 'button', '.social-list a',
                '.profile-photo', '#log', '.status', 'video', 'canvas'
            ]);
        }, 50);
    }

    animateElements(selectors) {
        selectors.forEach((selector, index) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, elementIndex) => {
                // FIXED: Clear any existing animation state first
                element.classList.remove('animate-in');
                void element.offsetWidth; // Trigger reflow

                setTimeout(() => {
                    element.classList.add('animate-in');
                }, index * 50 + elementIndex * 30);
            });
        });
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !link.target && !link.classList.contains('no-transition')) {
                e.preventDefault();
                this.navigateTo(href, link);
            }
        });
    }

    async navigateTo(url, linkElement = null) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        await this.animatePageExit();
        window.location.href = url;
    }

    animatePageExit() {
        return new Promise((resolve) => {
            document.body.classList.remove('page-entering');
            document.body.classList.add('page-leaving');
            setTimeout(() => resolve(), this.animationDuration);
        });
    }

    observeScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('[data-animate-on-scroll]').forEach(el => observer.observe(el));
    }
}

// Global initialization
window.pageAnimations = new PageAnimations();

// Smooth hover fixes for buttons
document.addEventListener('mouseover', (e) => {
    const button = e.target.closest('button');
    if (button && !button.disabled) button.style.transform = 'translateY(-2px)';
});

document.addEventListener('mouseout', (e) => {
    const button = e.target.closest('button');
    if (button) button.style.transform = '';
});