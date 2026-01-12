document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
    new ConnectionMonitor();
    initializeAnimations();
    initializeSmoothScrolling();
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

class EnhancedCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.autoplayInterval = null;
        this.isPlaying = true;
        this.isPaused = false;
        this.progressDuration = 5000;
        this.transitionDuration = 500;
        this.indicatorTransitionDuration = 300;
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
                    const fillDuration = this.progressDuration - this.indicatorTransitionDuration;
                    progressBar.style.animation = `progressFill ${fillDuration}ms linear ${this.indicatorTransitionDuration}ms forwards`;
                } else {
                    progressBar.style.transform = 'scaleX(0)';
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
                progressBar.style.transform = 'scaleX(0)';
            }
        });
    }
    
    restartAutoplay() {
        this.stopAutoplay();
        this.isPlaying = true;
        this.isPaused = false;
        this.startAutoplay();
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
                this.restartAutoplay();
            }
        }
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
        // Deshabilitar transiciones temporalmente
        document.body.classList.add('no-transition');
        
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
        
        // Reactivar transiciones después de un momento
        setTimeout(() => {
            document.body.classList.remove('no-transition');
        }, 50);
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

document.addEventListener('DOMContentLoaded', function() {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!usuarioActivo && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return;
    }
    
    if (usuarioActivo && currentPage === 'login.html') {
        window.location.href = 'index.html';
        return;
    }
    
    if (usuarioActivo) {
        actualizarUsuarioHeader(usuarioActivo);
    }
    
    actualizarTotalCarrito();
    
    if (currentPage === 'login.html') {
        inicializarLogin();
        inicializarLoginMejorado(); 
    } else if (currentPage === 'carrito.html') {
        cargarCarrito();
    } else if (currentPage === 'cuenta.html') {
        cargarDatosCuenta();
    } else {
        inicializarProductos();
    }
});
const usuariosValidos = [
    { usuario: "admin", password: "123456" },
    { usuario: "user", password: "password" },
    { usuario: "demo", password: "demo" }
];

function inicializarLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validarLogin();
        });
    }
    
    // Agregar esta línea
    inicializarGoogleLogin();
}

function inicializarLoginMejorado() {
    const themeToggle = document.getElementById('themeToggle');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    // Theme Toggle
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Password Toggle
    if (togglePassword && passwordInput && eyeIcon) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            if (type === 'text') {
                eyeIcon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
            } else {
                eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
            }
        });
    }
}

function validarLogin() {
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    const usuarioValido = usuariosValidos.find(u => 
        u.usuario === usuario && u.password === password
    );
    
    if (usuarioValido) {
        localStorage.setItem('usuarioActivo', usuario);
        window.location.href = 'index.html';
    } else {
        errorMessage.textContent = 'Usuario o contraseña incorrectos';
        errorMessage.style.display = 'block';
    }
}

function actualizarUsuarioHeader(usuario) {
    const usuarioInfo = document.getElementById('usuario-info');
    if (usuarioInfo) {
        usuarioInfo.innerHTML = `<a href="cuenta.html" style="color: inherit; text-decoration: none;">Hola, ${usuario}</a> <span onclick="cerrarSesion()" style="cursor: pointer; color: #ffab00;">(Cerrar Sesión)</span>`;
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActivo');
    window.location.reload();
}

function obtenerCarrito() {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(nombre, precio) {
    let carrito = obtenerCarrito();
    
    const productoExistente = carrito.find(item => item.nombre === nombre);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            nombre: nombre,
            precio: parseFloat(precio),
            cantidad: 1
        });
    }
    
    guardarCarrito(carrito);
    actualizarTotalCarrito();
}

function actualizarTotalCarrito() {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    const badgeDesktop = document.getElementById('carrito-badge');
    if (badgeDesktop) {
        badgeDesktop.textContent = totalProductos;
    }
    
    const totalDesktop = document.getElementById('carrito-total');
    if (totalDesktop) {
        totalDesktop.textContent = `Carrito (S/ ${total.toFixed(2)})`;
    }
    
    const totalMobile = document.getElementById('carrito-total-mobile');
    if (totalMobile) {
        totalMobile.textContent = `Carrito (S/ ${total.toFixed(2)})`;
    }
    
    const badges = document.querySelectorAll('a[href="carrito.html"] .absolute.bg-red-500');
    badges.forEach(badge => {
        if (!badge.id) {
            badge.textContent = totalProductos;
        }
    });
    
    const carritoLinks = document.querySelectorAll('a[href="carrito.html"]');
    carritoLinks.forEach(link => {
        const spans = link.querySelectorAll('span');
        spans.forEach(span => {
            if (span.textContent.includes('Carrito') && !span.id) {
                span.textContent = `Carrito (S/ ${total.toFixed(2)})`;
            }
        });
    });
}

function inicializarProductos() {
    const productosTailwind = document.querySelectorAll('.grid > div.p-4');
    
    productosTailwind.forEach(producto => {
        const botonAgregar = producto.querySelector('button[aria-label="Añadir"]');
        
        if (botonAgregar && botonAgregar.textContent.trim() === '+' && !botonAgregar.dataset.initialized) {
            botonAgregar.dataset.initialized = 'true';
            
            botonAgregar.addEventListener('click', function(e) {
                e.preventDefault();
                
                const nombre = producto.querySelector('p')?.textContent?.trim();
                const precioElement = producto.querySelector('span.font-bold');
                const precioTexto = precioElement?.textContent?.replace('S/', '').replace(',', '').trim();
                const precio = parseFloat(precioTexto);
                
                if (nombre && !isNaN(precio)) {
                    agregarAlCarrito(nombre, precio);
                    
                    const originalBg = botonAgregar.className;
                    const originalContent = botonAgregar.innerHTML;
                    botonAgregar.className = botonAgregar.className.replace('bg-yellow-500', 'bg-green-500');
                    botonAgregar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>';
                    
                    setTimeout(() => {
                        botonAgregar.className = originalBg;
                        botonAgregar.innerHTML = originalContent;
                    }, 1000);
                }
            });
        }
    });
    
    const productosTradicional = document.querySelectorAll('.producto');
    
    productosTradicional.forEach(producto => {
        const botonAgregar = producto.querySelector('.button-add, button[aria-label="Añadir"]');
        
        if (botonAgregar && botonAgregar.textContent.trim() === '+' && !botonAgregar.dataset.initialized) {
            botonAgregar.dataset.initialized = 'true';
            
            botonAgregar.addEventListener('click', function(e) {
                e.preventDefault();
                
                const nombre = producto.querySelector('.producto-descripcion, p')?.textContent?.trim();
                const precioElement = producto.querySelector('.precio, span.precio');
                const precioTexto = precioElement?.textContent?.replace('S/', '').replace(',', '').trim();
                const precio = parseFloat(precioTexto);
                
                if (nombre && !isNaN(precio)) {
                    agregarAlCarrito(nombre, precio);
                    
                    const originalBg = botonAgregar.style.background;
                    const originalContent = botonAgregar.innerHTML;
                    botonAgregar.style.background = '#4CAF50';
                    botonAgregar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: auto;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>';
                    
                    setTimeout(() => {
                        botonAgregar.style.background = originalBg;
                        botonAgregar.innerHTML = originalContent;
                    }, 1000);
                }
            });
        }
    });
}

function cargarDatosCuenta() {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (!usuarioActivo) return;
    
    document.getElementById('nombre-usuario').textContent = usuarioActivo;
    document.getElementById('usuario-nombre').textContent = usuarioActivo;
    document.getElementById('inicial-usuario').textContent = usuarioActivo.charAt(0).toUpperCase();
    
    const ahora = new Date().toLocaleString('es-ES');
    document.getElementById('ultimo-acceso').textContent = ahora;
    
    actualizarEstadisticasCarrito();
    
    const temaActual = document.documentElement.getAttribute('data-theme');
    const temaTexto = document.getElementById('tema-texto');
    if (temaTexto) {
        temaTexto.textContent = temaActual === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    }
}

function actualizarEstadisticasCarrito() {
    const carrito = obtenerCarrito();
    const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const totalPrecio = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const productosElement = document.getElementById('productos-carrito');
    const totalElement = document.getElementById('total-carrito');
    
    if (productosElement) productosElement.textContent = totalProductos;
    if (totalElement) totalElement.textContent = `S/ ${totalPrecio.toFixed(2)}`;
}

function verCarrito() {
    window.location.href = 'carrito.html';
}

function limpiarDatos() {
    const confirmacion = confirm('¿Estás seguro de que quieres limpiar todos los datos? Esto vaciará tu carrito.');
    if (confirmacion) {
        localStorage.removeItem('carrito');
        actualizarEstadisticasCarrito();
        actualizarTotalCarrito();
        alert('Datos limpiados correctamente.');
    }
}

function exportarDatos() {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const carrito = obtenerCarrito();
    const fecha = new Date().toLocaleString('es-ES');
    
    const datos = {
        usuario: usuarioActivo,
        fechaExportacion: fecha,
        carrito: carrito,
        totalProductos: carrito.reduce((sum, item) => sum + item.cantidad, 0),
        totalPrecio: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    const datosJson = JSON.stringify(datos, null, 2);
    const blob = new Blob([datosJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos_cuenta_${usuarioActivo}_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function cambiarTema() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const temaTexto = document.getElementById('tema-texto');
    if (temaTexto) {
        temaTexto.textContent = newTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    }
}

function cargarCarrito() {
    const carrito = obtenerCarrito();
    const carritoItems = document.getElementById('carrito-items');
    const totalFinal = document.getElementById('total-final');
    
    if (!carritoItems) return;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">No tienes productos en el carrito.</p>';
        totalFinal.textContent = 'Total: S/ 0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p>Precio: S/ ${item.precio.toFixed(2)}</p>
                </div>
                <div class="item-cantidad">
                    <button onclick="cambiarCantidad(${index}, -1)" style="display: flex; align-items: center; justify-content: center;">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${index}, 1)" style="display: flex; align-items: center; justify-content: center;">+</button>
                </div>
                <div class="item-subtotal">
                    <p>S/ ${subtotal.toFixed(2)}</p>
                </div>
                <button onclick="eliminarItem(${index})" class="btn-eliminar" style="display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;
    });
    
    carritoItems.innerHTML = html;
    totalFinal.textContent = `Total: S/ ${total.toFixed(2)}`;
}

function cambiarCantidad(index, cambio) {
    let carrito = obtenerCarrito();
    carrito[index].cantidad += cambio;
    
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    
    guardarCarrito(carrito);
    cargarCarrito();
    actualizarTotalCarrito();
}

function eliminarItem(index) {
    let carrito = obtenerCarrito();
    carrito.splice(index, 1);
    guardarCarrito(carrito);
    cargarCarrito();
    actualizarTotalCarrito();
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem('carrito');
        cargarCarrito();
        actualizarTotalCarrito();
    }
}

const hamburgerBtn = document.getElementById('hamburgerBtn');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const hamburgerIcon = document.getElementById('hamburgerIcon');

function openMenu() {
    hamburgerMenu.classList.remove('-translate-x-full');
    hamburgerMenu.classList.add('translate-x-0');
    menuOverlay.classList.remove('opacity-0', 'invisible');
    menuOverlay.classList.add('opacity-100', 'visible');
    hamburgerIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    `;
    document.body.classList.add('overflow-hidden');
}

function closeMenu() {
    hamburgerMenu.classList.add('-translate-x-full');
    hamburgerMenu.classList.remove('translate-x-0');
    menuOverlay.classList.add('opacity-0', 'invisible');
    menuOverlay.classList.remove('opacity-100', 'visible');
    hamburgerIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    `;
    document.body.classList.remove('overflow-hidden');
}

hamburgerBtn.addEventListener('click', () => {
    if (hamburgerMenu.classList.contains('-translate-x-full')) {
        openMenu();
    } else {
        closeMenu();
    }
});

closeMenuBtn.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMenu();
    }
});

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('main .flex-1, section .bg-white, .bg-gray-100, .grid > div');
    animatedElements.forEach(el => observer.observe(el));
    
    addAnimationStyles();
}

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        main .flex-1, section .bg-white, .bg-gray-100, .grid > div {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
        }

        main .flex-1.animate-in, section .bg-white.animate-in, .bg-gray-100.animate-in, .grid > div.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function inicializarGoogleLogin() {
    const googleLogin = document.getElementById('googleLogin');
    if (googleLogin) {
        googleLogin.addEventListener('click', () => {
            alert('🔐 Iniciando sesión con Google...\n\nEn una aplicación real, esto redirigiría a:\nhttps://accounts.google.com/oauth\n\nPor ahora, usa las credenciales de prueba.');
        });
    }
}