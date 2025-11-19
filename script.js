// ============================================
// TheSteelDesigner.eu - Interactive JavaScript
// ============================================

(function() {
  'use strict';

  // ============================================
  // Initialize
  // ============================================
  
  document.addEventListener('DOMContentLoaded', function() {
    initYear();
    initPortfolio();
    initLightbox();
    initSmoothScroll();
    initScrollAnimations();
    initHeaderScroll();
    initMobileMenu();
  });

  // ============================================
  // Year in Footer
  // ============================================
  
  function initYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // ============================================
  // Portfolio Infinite Scroll
  // ============================================
  
  function initPortfolio() {
    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    if (portfolioItems.length === 0) return;

    const batchSize = 6;
    let visibleCount = 9;
    let isLoading = false;

    function updateVisibility() {
      portfolioItems.forEach((item, index) => {
        if (index < visibleCount) {
          item.classList.add('active');
          item.style.display = 'block';
          // Add fade-in animation
          setTimeout(() => {
            item.style.opacity = '0';
            item.style.animation = 'fadeIn 0.5s ease-out forwards';
          }, index * 50);
        } else {
          item.classList.remove('active');
          item.style.display = 'none';
        }
      });
    }

    function loadMore() {
      if (isLoading || visibleCount >= portfolioItems.length) return;
      
      isLoading = true;
      
      // Simulate slight delay for smooth loading
      setTimeout(() => {
        visibleCount = Math.min(visibleCount + batchSize, portfolioItems.length);
        updateVisibility();
        isLoading = false;
      }, 200);
    }

    function onScroll() {
      if (visibleCount >= portfolioItems.length) return;
      
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 300;
      
      if (scrollPosition >= threshold) {
        loadMore();
      }
    }

    // Initial load
    updateVisibility();
    
    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(onScroll);
    });
  }

  // ============================================
  // Lightbox Functionality
  // ============================================
  
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (!lightbox || !lightboxImage) return;

    let currentIndex = 0;
    const images = Array.from(portfolioItems).map(item => ({
      src: item.querySelector('img')?.src || '',
      caption: item.querySelector('.portfolio-caption')?.textContent || ''
    })).filter(img => img.src);

    function openLightbox(index) {
      if (index < 0 || index >= images.length) return;
      
      currentIndex = index;
      const image = images[index];
      
      lightboxImage.src = image.src;
      lightboxImage.alt = image.caption || 'Steel project image';
      lightboxCaption.textContent = image.caption || '';
      
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      
      // Clear image after animation
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
          lightboxImage.src = '';
          lightboxCaption.textContent = '';
        }
      }, 300);
    }

    function navigateLightbox(direction) {
      const newIndex = currentIndex + direction;
      if (newIndex >= 0 && newIndex < images.length) {
        openLightbox(newIndex);
      }
    }

    // Open lightbox on image click
    portfolioItems.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        img.addEventListener('click', function(e) {
          e.preventDefault();
          const itemIndex = images.findIndex(imgData => 
            imgData.src === this.src || imgData.src === this.currentSrc
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
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;

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
    if (lightboxImage) {
      lightboxImage.addEventListener('dragstart', function(e) {
        e.preventDefault();
      });
    }
  }

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 120;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

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
  
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe sections and cards
    document.querySelectorAll('section, .card, .workflow-step').forEach(el => {
      observer.observe(el);
    });
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  
  function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    function handleScroll() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }

    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(handleScroll);
    });

    // Initial check
    handleScroll();
  }

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    if (!menuToggle || !navMenu) return;

    function toggleMenu() {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Toggle menu on button click
    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking on a link
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Small delay to allow smooth scroll to work
        setTimeout(closeMenu, 100);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (navMenu.classList.contains('active') && 
          !navMenu.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close menu on window resize if it's open and we're above mobile breakpoint
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        if (window.innerWidth > 968 && navMenu.classList.contains('active')) {
          closeMenu();
        }
      }, 250);
    });
  }

  // ============================================
  // Form Enhancement (Optional)
  // ============================================
  
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Basic validation
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#ef4444';
        } else {
          field.style.borderColor = '';
        }
      });

      if (!isValid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
      }
    });

    // Remove error styling on input
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', function() {
        this.style.borderColor = '';
      });
    });
  }

})();

