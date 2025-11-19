// ============================================
// TheSteelDesigner.eu - TypeScript Implementation
// Modern, type-safe interactive functionality
// ============================================

interface PortfolioImage {
  src: string;
  caption: string;
}

interface LightboxState {
  currentIndex: number;
  images: PortfolioImage[];
}

class SteelDesignerApp {
  private lightboxState: LightboxState = {
    currentIndex: 0,
    images: []
  };

  private portfolioItems: NodeListOf<HTMLElement> | null = null;
  private lightbox: HTMLElement | null = null;
  private lightboxImage: HTMLImageElement | null = null;
  private lightboxCaption: HTMLElement | null = null;
  private menuToggle: HTMLElement | null = null;
  private navMenu: HTMLElement | null = null;
  private header: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      this.initializeApp();
    }
  }

  private initializeApp(): void {
    this.initYear();
    this.initPortfolio();
    this.initLightbox();
    this.initSmoothScroll();
    this.initScrollAnimations();
    this.initHeaderScroll();
    this.initMobileMenu();
    this.initFloatingButtons();
  }

  // ============================================
  // Year in Footer
  // ============================================
  private initYear(): void {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }

  // ============================================
  // Portfolio Infinite Scroll
  // ============================================
  private initPortfolio(): void {
    this.portfolioItems = document.querySelectorAll<HTMLElement>('.portfolio-item');
    if (!this.portfolioItems || this.portfolioItems.length === 0) return;

    const batchSize: number = 6;
    let visibleCount: number = 9;
    let isLoading: boolean = false;

    const updateVisibility = (): void => {
      this.portfolioItems!.forEach((item: HTMLElement, index: number) => {
        if (index < visibleCount) {
          item.classList.add('active');
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '0';
            item.style.animation = 'fadeIn 0.5s ease-out forwards';
          }, index * 50);
        } else {
          item.classList.remove('active');
          item.style.display = 'none';
        }
      });
    };

    const loadMore = (): void => {
      if (isLoading || visibleCount >= this.portfolioItems!.length) return;
      
      isLoading = true;
      
      setTimeout(() => {
        visibleCount = Math.min(visibleCount + batchSize, this.portfolioItems!.length);
        updateVisibility();
        isLoading = false;
      }, 200);
    };

    const onScroll = (): void => {
      if (visibleCount >= this.portfolioItems!.length) return;
      
      const scrollPosition: number = window.innerHeight + window.scrollY;
      const threshold: number = document.body.offsetHeight - 300;
      
      if (scrollPosition >= threshold) {
        loadMore();
      }
    };

    updateVisibility();
    
    let scrollTimeout: number | null = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout !== null) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(onScroll);
    });
  }

  // ============================================
  // Lightbox Functionality with Full-Screen Support
  // ============================================
  private initLightbox(): void {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImage = document.getElementById('lightboxImage') as HTMLImageElement;
    this.lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector<HTMLElement>('.lightbox-close');
    const portfolioItems = document.querySelectorAll<HTMLElement>('.portfolio-item');

    if (!this.lightbox || !this.lightboxImage) return;

    // Build images array
    this.lightboxState.images = Array.from(portfolioItems)
      .map((item: HTMLElement) => {
        const img = item.querySelector<HTMLImageElement>('img');
        const caption = item.querySelector<HTMLElement>('.portfolio-caption');
        return {
          src: img?.src || '',
          caption: caption?.textContent || ''
        };
      })
      .filter((img: PortfolioImage) => img.src);

    const openLightbox = (index: number): void => {
      if (index < 0 || index >= this.lightboxState.images.length) return;
      
      this.lightboxState.currentIndex = index;
      const image = this.lightboxState.images[index];
      
      if (this.lightboxImage) {
        this.lightboxImage.src = image.src;
        this.lightboxImage.alt = image.caption || 'Steel project image';
      }
      
      if (this.lightboxCaption) {
        this.lightboxCaption.textContent = image.caption || '';
      }
      
      if (this.lightbox) {
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    };

    const closeLightbox = (): void => {
      if (this.lightbox) {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
      
      setTimeout(() => {
        if (this.lightbox && !this.lightbox.classList.contains('active')) {
          if (this.lightboxImage) this.lightboxImage.src = '';
          if (this.lightboxCaption) this.lightboxCaption.textContent = '';
        }
      }, 300);
    };

    const navigateLightbox = (direction: number): void => {
      const newIndex = this.lightboxState.currentIndex + direction;
      if (newIndex >= 0 && newIndex < this.lightboxState.images.length) {
        openLightbox(newIndex);
      }
    };

    // Open lightbox on image click
    portfolioItems.forEach((item: HTMLElement, index: number) => {
      const img = item.querySelector<HTMLImageElement>('img');
      if (img) {
        img.addEventListener('click', (e: Event) => {
          e.preventDefault();
          const itemIndex = this.lightboxState.images.findIndex(
            (imgData: PortfolioImage) => imgData.src === img.src || imgData.src === img.currentSrc
          );
          if (itemIndex !== -1) {
            openLightbox(itemIndex);
          }
        });
      }
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    // Close on backdrop click
    if (this.lightbox) {
      this.lightbox.addEventListener('click', (e: MouseEvent) => {
        if (e.target === this.lightbox) {
          closeLightbox();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.lightbox || !this.lightbox.classList.contains('active')) return;

      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox(-1);
          break;
        case 'ArrowRight':
          navigateLightbox(1);
          break;
      }
    });

    // Prevent image drag in lightbox
    if (this.lightboxImage) {
      this.lightboxImage.addEventListener('dragstart', (e: DragEvent) => {
        e.preventDefault();
      });
    }
  }

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  private initSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', (e: MouseEvent) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '#!') return;
        
        const target = document.querySelector<HTMLElement>(href!);
        if (target) {
          e.preventDefault();
          const headerOffset: number = 120;
          const elementPosition: number = target.getBoundingClientRect().top;
          const offsetPosition: number = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================
  // Scroll Animations
  // ============================================
  private initScrollAnimations(): void {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('section, .card, .workflow-step').forEach((el: Element) => {
      observer.observe(el);
    });
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  private initHeaderScroll(): void {
    this.header = document.querySelector<HTMLElement>('header');
    if (!this.header) return;

    const scrollThreshold: number = 50;

    const handleScroll = (): void => {
      const currentScroll: number = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > scrollThreshold) {
        this.header!.classList.add('scrolled');
      } else {
        this.header!.classList.remove('scrolled');
      }
    };

    let scrollTimeout: number | null = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout !== null) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(handleScroll);
    });

    handleScroll();
  }

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  private initMobileMenu(): void {
    this.menuToggle = document.querySelector<HTMLElement>('.menu-toggle');
    this.navMenu = document.querySelector<HTMLElement>('.nav-menu');
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-menu a');
    
    if (!this.menuToggle || !this.navMenu) return;

    const toggleMenu = (): void => {
      const isExpanded = this.menuToggle!.getAttribute('aria-expanded') === 'true';
      
      this.menuToggle!.setAttribute('aria-expanded', (!isExpanded).toString());
      this.navMenu!.classList.toggle('active');
      document.body.style.overflow = this.navMenu!.classList.contains('active') ? 'hidden' : '';
    };

    const closeMenu = (): void => {
      this.menuToggle!.setAttribute('aria-expanded', 'false');
      this.navMenu!.classList.remove('active');
      document.body.style.overflow = '';
    };

    this.menuToggle.addEventListener('click', toggleMenu);

    navLinks.forEach((link: HTMLAnchorElement) => {
      link.addEventListener('click', () => {
        setTimeout(closeMenu, 100);
      });
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (this.navMenu!.classList.contains('active') && 
          !this.navMenu!.contains(e.target as Node) && 
          !this.menuToggle!.contains(e.target as Node)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.navMenu!.classList.contains('active')) {
        closeMenu();
      }
    });

    let resizeTimeout: number | null = null;
    window.addEventListener('resize', () => {
      if (resizeTimeout !== null) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (window.innerWidth > 968 && this.navMenu!.classList.contains('active')) {
          closeMenu();
        }
      }, 250);
    });
  }

  // ============================================
  // Enhanced Floating Buttons
  // ============================================
  private initFloatingButtons(): void {
    const floatingButtons = document.querySelectorAll<HTMLElement>('.fab');
    
    floatingButtons.forEach((button: HTMLElement) => {
      // Add pulse animation on hover
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
      });

      // Add click ripple effect
      button.addEventListener('click', (e: MouseEvent) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
}

// Initialize the application
new SteelDesignerApp();

