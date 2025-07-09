// Flash Messages Component for IVMS Website
// Displays success/error messages from form submissions

(function() {
    'use strict';

    // Create flash message container
    function createFlashContainer() {
        if (document.getElementById('flash-messages')) return;
        
        const flashContainer = document.createElement('div');
        flashContainer.id = 'flash-messages';
        flashContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            min-width: 300px;
        `;
        document.body.appendChild(flashContainer);
    }

    // Display flash message
    function showFlashMessage(message, type = 'info') {
        createFlashContainer();
        
        const flashContainer = document.getElementById('flash-messages');
        const messageDiv = document.createElement('div');
        
        const bgColor = type === 'success' ? '#10b981' : 
                       type === 'error' ? '#ef4444' : '#3b82f6';
        
        const icon = type === 'success' ? '✓' : 
                    type === 'error' ? '✕' : 'ℹ';

        messageDiv.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            cursor: pointer;
        `;

        messageDiv.innerHTML = `
            <span style="font-size: 18px; font-weight: bold;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <span style="opacity: 0.7; font-size: 18px; margin-left: 8px;">×</span>
        `;

        flashContainer.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 10);

        // Auto-hide after 5 seconds
        const autoHideTimer = setTimeout(() => {
            hideMessage(messageDiv);
        }, 5000);

        // Click to dismiss
        messageDiv.addEventListener('click', () => {
            clearTimeout(autoHideTimer);
            hideMessage(messageDiv);
        });

        function hideMessage(element) {
            element.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }

    // Check for URL parameters containing flash messages
    function checkForFlashMessages() {
        const urlParams = new URLSearchParams(window.location.search);
        const flashMessage = urlParams.get('flash_message');
        const flashType = urlParams.get('flash_type') || 'info';

        if (flashMessage) {
            showFlashMessage(decodeURIComponent(flashMessage), flashType);
            
            // Clean URL by removing flash parameters
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('flash_message');
            newUrl.searchParams.delete('flash_type');
            window.history.replaceState({}, '', newUrl);
        }
    }

    // Enhanced form submission with loading states
    function enhanceFormSubmissions() {
        document.querySelectorAll('form[action^="/submit-"]').forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.7';
                    
                    // Add loading spinner
                    const spinner = document.createElement('span');
                    spinner.innerHTML = ' ⟳';
                    spinner.style.animation = 'spin 1s linear infinite';
                    submitBtn.appendChild(spinner);
                    
                    // Add spinner animation CSS if not already present
                    if (!document.getElementById('spinner-style')) {
                        const style = document.createElement('style');
                        style.id = 'spinner-style';
                        style.textContent = `
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    // Reset button state after 10 seconds as fallback
                    setTimeout(() => {
                        if (submitBtn.disabled) {
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                            submitBtn.style.opacity = '1';
                        }
                    }, 10000);
                }
            });
        });
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            checkForFlashMessages();
            enhanceFormSubmissions();
        });
    } else {
        checkForFlashMessages();
        enhanceFormSubmissions();
    }

    // Export functions for manual use
    window.IVMSFlash = {
        show: showFlashMessage,
        success: (msg) => showFlashMessage(msg, 'success'),
        error: (msg) => showFlashMessage(msg, 'error'),
        info: (msg) => showFlashMessage(msg, 'info')
    };

})();