// Image Lazy Loading and Optimization
document.addEventListener('DOMContentLoaded', function() {
    // Check for Intersection Observer support
    if ('IntersectionObserver' in window) {
        initLazyLoading();
    } else {
        // Fallback for older browsers
        loadAllImages();
    }

    // Initialize WebP support detection
    detectWebPSupport();
    
    // Optimize hero video loading
    optimizeVideoLoading();
});

// Lazy loading with Intersection Observer
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src], img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    images.forEach(img => {
        // Add loading skeleton
        addLoadingSkeleton(img);
        
        // If image doesn't have data-src, convert it for lazy loading
        if (!img.dataset.src && img.src) {
            img.dataset.src = img.src;
            img.src = '';
        }
        
        imageObserver.observe(img);
    });
}

// Load individual image
function loadImage(img) {
    return new Promise((resolve, reject) => {
        const imageUrl = img.dataset.src || img.src;
        if (!imageUrl) {
            reject('No image URL found');
            return;
        }

        // Create a new image element to preload
        const newImg = new Image();
        
        newImg.onload = () => {
            // Remove skeleton
            removeLoadingSkeleton(img);
            
            // Set the source
            img.src = imageUrl;
            img.classList.add('loaded');
            
            // Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            // Trigger reflow and start fade-in
            img.offsetHeight;
            img.style.opacity = '1';
            
            resolve();
        };
        
        newImg.onerror = () => {
            removeLoadingSkeleton(img);
            img.src = getPlaceholderImage(img);
            img.classList.add('error');
            reject('Failed to load image');
        };
        
        newImg.src = imageUrl;
    });
}

// Add loading skeleton
function addLoadingSkeleton(img) {
    if (img.parentElement.querySelector('.image-skeleton')) return;
    
    const skeleton = document.createElement('div');
    skeleton.className = 'image-skeleton';
    skeleton.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: inherit;
    `;
    
    // Make parent relative if not already
    const parent = img.parentElement;
    if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }
    
    parent.appendChild(skeleton);
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#loading-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-styles';
        style.textContent = `
            @keyframes loading {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Remove loading skeleton
function removeLoadingSkeleton(img) {
    const skeleton = img.parentElement.querySelector('.image-skeleton');
    if (skeleton) {
        skeleton.style.opacity = '0';
        skeleton.style.transition = 'opacity 0.3s ease';
        setTimeout(() => skeleton.remove(), 300);
    }
}

// Get placeholder image
function getPlaceholderImage(img) {
    const width = img.getAttribute('width') || 400;
    const height = img.getAttribute('height') || 300;
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23999' font-family='sans-serif' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E`;
}

// Fallback for browsers without Intersection Observer
function loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
        loadImage(img);
    });
}

// WebP support detection
function detectWebPSupport() {
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = function () {
        const isWebPSupported = (webpTest.height === 2);
        document.documentElement.classList.toggle('webp-support', isWebPSupported);
        document.documentElement.classList.toggle('no-webp-support', !isWebPSupported);
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
}

// Optimize video loading
function optimizeVideoLoading() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Preload only metadata initially
        video.preload = 'metadata';
        
        // Load video when it comes into view
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.preload = 'auto';
                    videoObserver.unobserve(video);
                }
            });
        }, { threshold: 0.1 });
        
        videoObserver.observe(video);
        
        // Handle video errors gracefully
        video.addEventListener('error', () => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'video-error';
            errorDiv.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: #f0f0f0;
                    color: #666;
                    font-family: sans-serif;
                ">
                    <i class="fas fa-video-slash"></i>
                    <span style="margin-left: 0.5rem;">Video unavailable</span>
                </div>
            `;
            video.parentElement.appendChild(errorDiv);
            video.style.display = 'none';
        });
    });
}

// Performance monitoring
function monitorImagePerformance() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.initiatorType === 'img') {
                    // Log image loading performance (only in development)
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.log(`Image loaded: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });
        });
        observer.observe({ entryTypes: ['resource'] });
    }
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    monitorImagePerformance();
}

// Export functions for potential use in other scripts
window.ImageOptimization = {
    loadImage,
    initLazyLoading,
    detectWebPSupport
};