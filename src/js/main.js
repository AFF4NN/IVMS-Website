// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');

    if (mobileMenuButton && mobileMenu) {
        // Toggle mobile menu
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.classList.toggle('active');
            
            // Update aria-expanded for accessibility
            const isExpanded = !mobileMenu.classList.contains('hidden');
            mobileMenuButton.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile menu when clicking on a link
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.classList.remove('active');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            });
        });

                 // Close mobile menu when clicking outside
         document.addEventListener('click', (e) => {
             if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                 mobileMenu.classList.add('hidden');
                 mobileMenuButton.classList.remove('active');
                 mobileMenuButton.setAttribute('aria-expanded', 'false');
             }
         });

        // Handle escape key for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.classList.remove('active');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenuButton.focus();
            }
        });
    }
});

// Header injection and navigation logic
function loadHeader() {
  fetch('src/components/header.html')
    .then(response => response.text())
    .then(data => {
      const headerElement = document.getElementById('site-header');
      if (headerElement) {
        headerElement.innerHTML = data;
        initHeaderNav();
      }
    })
    .catch(err => {
      // Handle error gracefully without console.error in production
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error("Failed to load header.html", err);
      }
    });
}

function initHeaderNav() {
  // Mobile menu open/close
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
    });
  }
  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }
  // Dropdown logic for mobile
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const menu = this.parentElement.querySelector('.dropdown-menu');
      if (menu) menu.classList.toggle('show');
    });
  });
  // Close mobile menu when clicking a link
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('site-header')) {
    loadHeader();
  }
});