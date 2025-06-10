class EnhancedCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.autoplayInterval = null;
        this.isPlaying = true;
        this.isPaused = false;
        this.progressDuration = 5000;
        this.transitionDuration = 500;
        
        this.carousel = document.getElementById('carousel');
        this.carouselImages = document.getElementById('carouselImages');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        if (!this.carousel || !this.carouselImages || !this.indicators.length) {
            console.warn('Elementos del carrusel no encontrados');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.prevBtn?.addEventListener('click', () => {
            this.prevSlide();
            this.restartAutoplay();
        });
        
        this.nextBtn?.addEventListener('click', () => {
            this.nextSlide();
            this.restartAutoplay();
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
                this.restartAutoplay();
            });
        });
        
        this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.carousel.addEventListener('mouseleave', () => this.resumeAutoplay());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else if (!this.isPaused) {
                this.resumeAutoplay();
            }
        });
        
        this.addTouchSupport();
        
        this.updateCarousel();
        this.updateIndicators();
        this.startAutoplay();
    }
    
    addTouchSupport() {
        let startX = 0;
        let endX = 0;
        const threshold = 50;
        
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        this.carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const difference = startX - endX;
            
            if (Math.abs(difference) > threshold) {
                if (difference > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                this.restartAutoplay();
            }
        }, { passive: true });
    }
    
    goToSlide(slideIndex) {
        if (slideIndex === this.currentSlide) return;
        
        this.currentSlide = slideIndex;
        this.updateCarousel();
        this.updateIndicators();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
        this.updateIndicators();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        this.updateIndicators();
    }
    
    updateCarousel() {
        const translateX = -this.currentSlide * (100 / this.totalSlides);
        this.carouselImages.style.transform = `translateX(${translateX}%)`;
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            const isActive = index === this.currentSlide;
            indicator.classList.toggle('active', isActive);
            
            const progressBar = indicator.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.animation = 'none';
                progressBar.offsetHeight;
                
                if (isActive && this.isPlaying && !this.isPaused) {
                    progressBar.style.animation = `progressFill ${this.progressDuration}ms linear forwards`;
                } else {
                    progressBar.style.width = '0%';
                }
            }
        });
    }
    
    startAutoplay() {
        this.stopAutoplay();
        
        if (!this.isPlaying) return;
        
        this.autoplayInterval = setInterval(() => {
            if (this.isPlaying && !this.isPaused && !document.hidden) {
                this.nextSlide();
            }
        }, this.progressDuration);
        
        this.updateIndicators();
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
        
        this.indicators.forEach(indicator => {
            const progressBar = indicator.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.animation = 'none';
                progressBar.style.width = '0%';
            }
        });
    }
    
    restartAutoplay() {
        this.stopAutoplay();
        this.isPlaying = true;
        this.isPaused = false;
        this.startAutoplay();
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        if (this.isPlaying && !this.isPaused) {
            setTimeout(() => this.startAutoplay(), 100);
        }
    }
    
    pauseAutoplay() {
        this.isPaused = true;
        
        const activeIndicator = this.indicators[this.currentSlide];
        if (activeIndicator) {
            const progressBar = activeIndicator.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'paused';
            }
        }
    }
    
    resumeAutoplay() {
        if (!this.isPlaying) return;
        
        this.isPaused = false;
        
        const activeIndicator = this.indicators[this.currentSlide];
        if (activeIndicator) {
            const progressBar = activeIndicator.querySelector('.progress-bar');
            if (progressBar && progressBar.style.animation !== 'none') {
                progressBar.style.animationPlayState = 'running';
            } else {
                this.resetAutoplay();
            }
        }
    }
    
    play() {
        this.isPlaying = true;
        this.isPaused = false;
        this.startAutoplay();
    }
    
    pause() {
        this.isPlaying = false;
        this.stopAutoplay();
    }
    
    destroy() {
        this.stopAutoplay();
    }
}

class WhatsAppButton {
    constructor(phoneNumber = '51987654321', message = 'Hola, me interesa conocer más sobre sus productos') {
        this.phoneNumber = phoneNumber;
        this.message = encodeURIComponent(message);
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.createButton();
        this.addEventListeners();
        this.handleScroll();
    }
    
    createButton() {
        this.button = document.createElement('div');
        this.button.className = 'whatsapp-float';
        this.button.innerHTML = `
            <a href="https://wa.me/${this.phoneNumber}?text=${this.message}" 
               target="_blank" 
               rel="noopener noreferrer"
               aria-label="Contactar por WhatsApp"
               title="Contactar por WhatsApp">
                <div class="whatsapp-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28">
                        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.687"/>
                    </svg>
                </div>
                <span class="whatsapp-text">WhatsApp</span>
            </a>
        `;
        
        document.body.appendChild(this.button);
    }
    
    addEventListeners() {
        const link = this.button.querySelector('a');
        link.addEventListener('mouseenter', () => {
            this.button.classList.add('hover');
        });
        
        link.addEventListener('mouseleave', () => {
            this.button.classList.remove('hover');
        });
        
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldShow = scrollY > 300;
        
        if (shouldShow && !this.isVisible) {
            this.show();
        } else if (!shouldShow && this.isVisible) {
            this.hide();
        }
    }
    
    show() {
        this.isVisible = true;
        this.button.classList.add('visible');
    }
    
    hide() {
        this.isVisible = false;
        this.button.classList.remove('visible');
    }
    
    updatePhone(newPhone) {
        this.phoneNumber = newPhone;
        const link = this.button.querySelector('a');
        link.href = `https://wa.me/${this.phoneNumber}?text=${this.message}`;
    }
    
    updateMessage(newMessage) {
        this.message = encodeURIComponent(newMessage);
        const link = this.button.querySelector('a');
        link.href = `https://wa.me/${this.phoneNumber}?text=${this.message}`;
    }
}

class HamburgerMenu {
    constructor() {
        this.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.navegador = document.getElementById('navegador');
        this.overlay = document.getElementById('overlay');
        this.isOpen = false;
        this.body = document.body;
        
        if (!this.hamburgerMenu || !this.navegador) {
            console.warn('Elementos del menú hamburguesa no encontrados');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        this.overlay?.addEventListener('click', () => this.close());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        const menuLinks = this.navegador.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.close(), 100);
            });
        });
        
        this.navegador.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.stopPropagation();
            }
        }, { passive: false });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.hamburgerMenu.classList.add('active');
        this.navegador.classList.add('active');
        this.overlay?.classList.add('active');
        
        this.body.style.overflow = 'hidden';
        this.body.style.position = 'fixed';
        this.body.style.width = '100%';
        
        this.navegador.setAttribute('aria-expanded', 'true');
        this.hamburgerMenu.setAttribute('aria-expanded', 'true');
    }
    
    close() {
        this.isOpen = false;
        this.hamburgerMenu.classList.remove('active');
        this.navegador.classList.remove('active');
        this.overlay?.classList.remove('active');
        
        this.body.style.overflow = '';
        this.body.style.position = '';
        this.body.style.width = '';
        
        this.navegador.setAttribute('aria-expanded', 'false');
        this.hamburgerMenu.setAttribute('aria-expanded', 'false');
    }
}

class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header-fixed')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

class HeaderEffects {
    constructor() {
        this.header = document.querySelector('.header-fixed');
        this.lastScrollY = 0;
        this.ticking = false;
        
        if (!this.header) {
            console.warn('Header no encontrado');
            return;
        }
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.handleScroll());
            this.ticking = true;
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            this.header.style.background = 'var(--bg-primary);';
            this.header.style.backdropFilter = 'blur(15px)';
            this.header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
        } else {
            this.header.style.background = 'var(--bg-primary);';
            this.header.style.backdropFilter = 'blur(10px)';
            this.header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }
        
        this.lastScrollY = scrollY;
        this.ticking = false;
    }
}

class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupLazyLoading();
        
        this.preloadCriticalImages();
    }
    
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    preloadCriticalImages() {
        const criticalImages = [
            './imagenes/bienvenido.png',
            './imagenes/banner1.png',
            './imagenes/banner2.png'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
}

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
    new ConnectionMonitor();
    try {
        const carousel = new EnhancedCarousel();
        
        const whatsappButton = new WhatsAppButton('51987654321', 'Hola, me interesa conocer más sobre sus productos del supermercado');
        
        let hamburgerMenu = null;
        const initHamburgerMenu = () => {
            if (window.innerWidth <= 768 && !hamburgerMenu) {
                hamburgerMenu = new HamburgerMenu();
            } else if (window.innerWidth > 768 && hamburgerMenu) {
                hamburgerMenu.close();
            }
        };
        
        initHamburgerMenu();

        new SmoothScroll();
        new HeaderEffects();
        new PerformanceOptimizer();

        const debouncedResize = debounce(() => {
            initHamburgerMenu();

            if (carousel) {
                carousel.updateCarousel();
                carousel.updateIndicators();
            }
        }, 250);
        
        window.addEventListener('resize', debouncedResize);

        window.addEventListener('beforeunload', () => {
            if (carousel) {
                carousel.destroy();
            }
        });
        
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedCarousel,
        WhatsAppButton,
        HamburgerMenu,
        SmoothScroll,
        HeaderEffects,
        debounce,
        throttle
    };
}
class DarkModeToggle {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.button = null;
        
        this.init();
    }
    
    init() {
        this.createToggleButton();
        this.applyTheme(this.currentTheme);
        this.addEventListeners();
    }
    
    createToggleButton() {
        this.button = document.createElement('button');
        this.button.className = 'theme-toggle';
        this.button.setAttribute('aria-label', 'Cambiar tema');
        this.button.innerHTML = `
            <svg class="sun-icon" viewBox="0 0 24 24">
                <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0-2a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0-3v2M4.22 4.22l1.42 1.42M2 12h2m1.64 6.36l1.42-1.42M12 19v2m4.95-1.64l1.42 1.42M19 12h2m-1.64-6.36l-1.42 1.42"/>
            </svg>
            <svg class="moon-icon" viewBox="0 0 24 24">
                <path d="M12.34 2.02c5.08.87 8.66 5.36 8.66 10.98 0 6.08-4.92 11-11 11-5.62 0-10.11-3.58-10.98-8.66-.1-.58.39-1.07.98-.97 4.27.73 8.04-2.87 8.04-7.35 0-1.09-.2-2.13-.56-3.09-.2-.53.25-1.03.86-.91z"/>
            </svg>
        `;
        
        document.body.appendChild(this.button);
    }
    
    addEventListeners() {
        this.button.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#0d47a1');
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = theme === 'dark' ? '#1a1a1a' : '#0d47a1';
            document.head.appendChild(meta);
        }
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}
class ConnectionMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.statusElement = null;
        this.hideTimeout = null;
        
        this.init();
    }
    
    init() {
        this.createStatusElement();
        this.addEventListeners();
        
        this.checkInitialConnection();
    }
    async checkInitialConnection() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            
            this.isOnline = true;
            this.enablePageFunctions();
        } catch (error) {
            this.isOnline = false;
            this.showStatus(false);
            this.disablePageFunctions();
        }
    }
    async checkInitialConnection() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            
            this.isOnline = true;
            this.enablePageFunctions();
        } catch (error) {
            this.isOnline = false;
            this.showStatus(false);
            this.disablePageFunctions();
        }
    }
    
    createStatusElement() {
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'connection-status';
        document.body.appendChild(this.statusElement);
    }
    
    addEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showStatus(false);
        });
        
        this.startPeriodicCheck();
    }
    
    showStatus(isOnline) {
        clearTimeout(this.hideTimeout);
    
        const icon = isOnline ? '🟢' : '🔴';
        const message = isOnline ? 'Conexión restaurada' : 'Sin conexión a internet';
        
        if (isOnline) {
            this.enablePageFunctions();
        } else {
            this.disablePageFunctions();
        }
        
        this.statusElement.innerHTML = `
            <span class="status-icon">${icon}</span>
            ${message}
        `;
        
        this.statusElement.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
        
        setTimeout(() => {
            this.statusElement.classList.add('show');
        }, 100);
        
        if (isOnline) {
            this.hideTimeout = setTimeout(() => {
                this.hideStatus();
            }, 3000);
        }
    }
    
    hideStatus() {
        this.statusElement.classList.remove('show');
    }
    
    startPeriodicCheck() {
        setInterval(() => {
            this.checkConnection();
        }, 15000);
    }
    
    async checkConnection() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            
            if (!this.isOnline) {
                this.isOnline = true;
                this.showStatus(true);
            }
        } catch (error) {
            if (this.isOnline) {
                this.isOnline = false;
                this.showStatus(false);
            }
        }
    }
    
    getCurrentStatus() {
        return this.isOnline;
    }
    disablePageFunctions() {
        const searchButton = document.querySelector('.boton-busqueda');
        const searchInput = document.querySelector('.caja-busqueda');
        if (searchButton) searchButton.disabled = true;
        if (searchInput) {
            searchInput.disabled = true;
            searchInput.placeholder = 'Sin conexión - Búsqueda no disponible';
        }
        
        const addButtons = document.querySelectorAll('.button-add');
        addButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
        
        const carouselItems = document.querySelectorAll('.carousel-item');
        carouselItems.forEach(item => {
            item.style.pointerEvents = 'none';
            item.style.opacity = '0.7';
        });
        
        document.body.classList.add('offline-mode');
    }
    
    enablePageFunctions() {
        const searchButton = document.querySelector('.boton-busqueda');
        const searchInput = document.querySelector('.caja-busqueda');
        if (searchButton) searchButton.disabled = false;
        if (searchInput) {
            searchInput.disabled = false;
            searchInput.placeholder = '  Buscar productos...';
        }
        
        const addButtons = document.querySelectorAll('.button-add');
        addButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        });
        
        const carouselItems = document.querySelectorAll('.carousel-item');
        carouselItems.forEach(item => {
            item.style.pointerEvents = 'auto';
            item.style.opacity = '1';
        });
        
        document.body.classList.remove('offline-mode');
    }
    
}