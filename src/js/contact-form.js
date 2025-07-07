// Enhanced Contact Form Validation and Accessibility
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');
    const submitButton = form.querySelector('button[type="submit"]');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Phone validation regex (international format)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;

    // Validation rules
    const validationRules = {
        first_name: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'First name must be at least 2 characters and contain only letters'
        },
        last_name: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Last name must be at least 2 characters and contain only letters'
        },
        company: {
            required: true,
            minLength: 2,
            message: 'Company name must be at least 2 characters'
        },
        email: {
            required: true,
            pattern: emailRegex,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: phoneRegex,
            message: 'Please enter a valid phone number'
        },
        job_title: {
            required: true,
            minLength: 2,
            message: 'Job title must be at least 2 characters'
        },
        message: {
            required: true,
            minLength: 10,
            message: 'Message must be at least 10 characters'
        }
    };

    // Validate individual field
    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = validationRules[fieldName];
        const errorElement = document.getElementById(`${fieldName}_error`);

        if (!rules || !errorElement) return true;

        let isValid = true;
        let errorMessage = '';

        // Required field check
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${getFieldLabel(fieldName)} is required`;
        }
        // Minimum length check
        else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }
        // Pattern check
        else if (rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Update UI
        if (isValid) {
            field.classList.remove('border-red-500');
            field.classList.add('border-green-500');
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
            field.setAttribute('aria-invalid', 'false');
        } else {
            field.classList.remove('border-green-500');
            field.classList.add('border-red-500');
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
            field.setAttribute('aria-invalid', 'true');
        }

        return isValid;
    }

    // Get human-readable field label
    function getFieldLabel(fieldName) {
        const labels = {
            first_name: 'First name',
            last_name: 'Last name',
            company: 'Company',
            email: 'Email',
            phone: 'Phone',
            job_title: 'Job title',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-500')) {
                validateField(input);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                alert('Thank you! Your message has been sent successfully. We will get back to you within 24 hours.');
                form.reset();
                inputs.forEach(input => {
                    input.classList.remove('border-green-500', 'border-red-500');
                    input.setAttribute('aria-invalid', 'false');
                });
                submitButton.disabled = false;
                submitButton.innerHTML = 'Submit enquiry';
            }, 2000);
        } else {
            // Focus on first invalid field
            const firstInvalidField = form.querySelector('[aria-invalid="true"]');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    });

    // Keyboard navigation enhancement
    form.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const formElements = Array.from(inputs).concat([submitButton]);
            const currentIndex = formElements.indexOf(e.target);
            const nextElement = formElements[currentIndex + 1];
            if (nextElement) {
                nextElement.focus();
            }
        }
    });
});

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('message');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.max(120, this.scrollHeight) + 'px';
        });
    }
});