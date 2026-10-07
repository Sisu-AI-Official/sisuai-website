/**
 * Sisu AI — homepage interactions
 * Nav state, mobile menu, smooth anchors, solution tabs, scroll reveal, demo form.
 * (The workshop page keeps using js/app.js.)
 */

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const navLinks = document.getElementById('nav-links');
    const navToggle = document.getElementById('nav-toggle');
    const toggleIcon = navToggle.querySelector('i');

    // 1. Nav background once the page scrolls
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 2. Mobile menu
    function setMenu(open) {
        navLinks.classList.toggle('is-open', open);
        nav.classList.toggle('menu-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        toggleIcon.classList.toggle('ph-list', !open);
        toggleIcon.classList.toggle('ph-x', open);
    }

    navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });

    // 3. Smooth scrolling for in-page anchors, offset by the fixed nav
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href');
            if (id === '#') {
                e.preventDefault();
                return;
            }
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : nav.offsetHeight);
            window.scrollTo({ top: id === '#top' ? 0 : top, behavior: 'smooth' });
            setMenu(false);
        });
    });

    // 4. Solutions tabs (WAI-ARIA tabs pattern)
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

    function selectTab(tab) {
        tabs.forEach((t) => {
            const selected = t === tab;
            t.setAttribute('aria-selected', String(selected));
            t.tabIndex = selected ? 0 : -1;
            document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
        });
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', (e) => {
            let next = null;
            if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
            if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
            if (e.key === 'Home') next = tabs[0];
            if (e.key === 'End') next = tabs[tabs.length - 1];
            if (next) {
                e.preventDefault();
                next.focus();
                selectTab(next);
            }
        });
    });

    // 5. Reveal: hero animates in on load; everything else on scroll, with a small stagger
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
        el.style.transitionDelay = `${i * 90}ms`;
        requestAnimationFrame(() => el.classList.add('is-visible'));
    });

    const revealEls = document.querySelectorAll('.reveal:not(.hero .reveal)');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
                el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 80}ms`;
                el.classList.add('is-visible');
                observer.unobserve(el);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // 6. Footer year
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // 7. Demo request form -> Netlify function send-contact
    const form = document.getElementById('contact-form');
    if (!form) return;

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

        let message = '';
        if (input.required && !input.value.trim()) {
            message = 'This field is required.';
        } else if (input.type === 'email' && input.value.trim()
            && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
            message = 'Please enter a valid email address.';
        }

        input.classList.toggle('is-invalid', Boolean(message));
        input.setAttribute('aria-invalid', String(Boolean(message)));
        errorEl.textContent = message;
        return !message;
    }

    form.querySelectorAll('input[required], textarea[required]').forEach((input) => {
        input.addEventListener('input', () => validateField(input));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();

        const required = Array.from(form.querySelectorAll('input[required], textarea[required]'));
        const results = required.map(validateField);
        if (!results.every(Boolean)) {
            required[results.indexOf(false)].focus();
            return;
        }

        const val = (name) => form.elements.namedItem(name).value.trim();
        const data = {
            name: val('name'),
            email: val('email'),
            company: val('company'),
            website: val('website'),
            interest: val('interest'),
            budget: val('budget'),
            message: val('message'),
        };

        setLoading(true);
        try {
            const res = await fetch('/.netlify/functions/send-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json().catch(() => ({}));

            if (res.ok && result.success) {
                showStatus('success', "Thanks! Your request is in. Our team will reply within 1–2 business days.");
                form.reset();
            } else {
                showStatus('error', result.error || 'Something went wrong. Please try again or email info@sisuai.net.');
            }
        } catch {
            showStatus('error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    });
});
