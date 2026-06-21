/**
 * Sisu AI 
 * Main JS file for interactions and animations
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Navbar
    const navbar = document.querySelector('.navbar');
    const heroSection = document.getElementById('hero');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on init

    // 2. Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80; // navbar height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }

            // Close mobile menu if open
            closeMobileMenu();
        });
    });

    // 3. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const toggleIcon = menuToggle.querySelector('i');

    function closeMobileMenu() {
        navLinks.classList.remove('open');
        toggleIcon.classList.remove('ph-x');
        toggleIcon.classList.add('ph-list');
    }

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        toggleIcon.classList.toggle('ph-list', !isOpen);
        toggleIcon.classList.toggle('ph-x', isOpen);
    });

    // 4. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const submitBtn = document.getElementById('form-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const statusEl = document.getElementById('form-status');

        function setLoading(isLoading) {
            submitBtn.disabled = isLoading;
            btnText.hidden = isLoading;
            btnLoading.hidden = !isLoading;
        }

        function showStatus(type, message) {
            statusEl.className = `form-status ${type}`;
            statusEl.textContent = message;
        }

        function clearStatus() {
            statusEl.className = 'form-status';
            statusEl.textContent = '';
        }

        function validateField(input) {
            const errorEl = document.getElementById(`error-${input.name}`);
            if (!errorEl) return true;

            if (input.required && !input.value.trim()) {
                input.classList.add('is-invalid');
                errorEl.textContent = `${input.labels[0]?.textContent.replace(' *', '')} is required.`;
                return false;
            }

            if (input.type === 'email' && input.value.trim()) {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
                if (!isValid) {
                    input.classList.add('is-invalid');
                    errorEl.textContent = 'Please enter a valid email address.';
                    return false;
                }
            }

            input.classList.remove('is-invalid');
            errorEl.textContent = '';
            return true;
        }

        // Clear validation on input
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => validateField(input));
        });

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearStatus();

            // Validate all required fields
            const requiredInputs = contactForm.querySelectorAll('input[required], textarea[required]');
            const isValid = Array.from(requiredInputs).map(validateField).every(Boolean);
            if (!isValid) return;

            const data = {
                name: contactForm.name.value.trim(),
                email: contactForm.email.value.trim(),
                company: contactForm.company.value.trim(),
                website: contactForm.website.value.trim(),
                message: contactForm.message.value.trim(),
                budget: contactForm.budget.value,
            };

            setLoading(true);

            try {
                const res = await fetch('/.netlify/functions/send-contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    showStatus('success', "✓ Message sent! We'll get back to you within 1-2 business days.");
                    contactForm.reset();
                } else {
                    showStatus('error', result.error || 'Something went wrong. Please try again.');
                }
            } catch {
                showStatus('error', 'Network error. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        });
    }

    // 5. Intersection Observer for Fade-in Animations
    const fadeElements = document.querySelectorAll('.fade-in-up');

    const fadeOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, fadeOptions);

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

});
