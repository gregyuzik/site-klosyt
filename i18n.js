/**
 * Klosyt Website — Internationalization Engine
 * Lightweight JSON-based i18n with browser language detection.
 */
(function () {
    'use strict';

    const SUPPORTED_LOCALES = [
        'en', 'zh-Hans', 'zh-Hant', 'da', 'nl', 'fr', 'de',
        'it', 'ja', 'ko', 'nb', 'pt-BR', 'es', 'sv', 'tr', 'vi'
    ];

    const LOCALE_LABELS = {
        'en': 'English',
        'zh-Hans': '简体中文',
        'zh-Hant': '繁體中文',
        'da': 'Dansk',
        'nl': 'Nederlands',
        'fr': 'Français',
        'de': 'Deutsch',
        'it': 'Italiano',
        'ja': '日本語',
        'ko': '한국어',
        'nb': 'Norsk',
        'pt-BR': 'Português (BR)',
        'es': 'Español',
        'sv': 'Svenska',
        'tr': 'Türkçe',
        'vi': 'Tiếng Việt'
    };

    const STORAGE_KEY = 'klosyt_lang';
    let currentTranslations = {};
    let fallbackTranslations = {};

    /* ───── Language detection ───── */

    function detectLanguage() {
        // 1. User's explicit choice
        const saved = safeStorage('get', STORAGE_KEY);
        if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;

        // 2. Browser language
        const browserLangs = navigator.languages || [navigator.language || 'en'];
        for (const lang of browserLangs) {
            // Exact match first
            if (SUPPORTED_LOCALES.includes(lang)) return lang;
            // Map common variants
            if (lang.startsWith('zh')) {
                if (lang.includes('TW') || lang.includes('HK') || lang.includes('Hant')) return 'zh-Hant';
                return 'zh-Hans';
            }
            if (lang.startsWith('pt')) return 'pt-BR';
            if (lang.startsWith('nb') || lang.startsWith('no')) return 'nb';
            // Base language match
            const base = lang.split('-')[0];
            if (SUPPORTED_LOCALES.includes(base)) return base;
        }
        return 'en';
    }

    /* ───── Translation loading ───── */

    async function loadTranslations(locale) {
        try {
            const resp = await fetch(`/locales/${locale}.json`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (e) {
            console.warn(`[i18n] Failed to load ${locale}, falling back to en`, e);
            if (locale !== 'en') {
                const resp = await fetch('/locales/en.json');
                return await resp.json();
            }
            return {};
        }
    }

    /* ───── DOM translation ───── */

    function getNestedValue(obj, path) {
        return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
    }

    function applyTranslations() {
        // Announce content change to screen readers
        const mainContent = document.querySelector('main') || document.querySelector('#main');
        if (mainContent && !mainContent.hasAttribute('aria-live')) {
            mainContent.setAttribute('aria-live', 'polite');
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNestedValue(currentTranslations, key)
                || getNestedValue(fallbackTranslations, key);
            if (value !== null) {
                el.innerHTML = value;
            }
        });

        // Translate alt attributes
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            const value = getNestedValue(currentTranslations, key)
                || getNestedValue(fallbackTranslations, key);
            if (value !== null) {
                el.alt = value;
            }
        });

        // Also translate placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = getNestedValue(currentTranslations, key)
                || getNestedValue(fallbackTranslations, key);
            if (value !== null) {
                el.placeholder = value;
            }
        });

        // Update <html lang="...">
        const langCode = safeStorage('get', STORAGE_KEY) || 'en';
        document.documentElement.lang = langCode;

        // Update language switcher label
        const langLabel = document.getElementById('lang-label');
        if (langLabel) {
            langLabel.textContent = LOCALE_LABELS[langCode] || langCode;
        }

        // Mark the active item in the dropdown
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === langCode);
        });

        // Show/hide AI translation notice for non-English languages
        document.querySelectorAll('[data-i18n-visible="non-en"]').forEach(el => {
            el.style.display = langCode === 'en' ? 'none' : 'flex';
        });
    }

    /* ───── Public API ───── */

    async function setLanguage(locale) {
        if (!SUPPORTED_LOCALES.includes(locale)) locale = 'en';
        safeStorage('set', STORAGE_KEY, locale);

        currentTranslations = await loadTranslations(locale);
        applyTranslations();
    }

    /* ───── Language switcher dropdown ───── */

    function buildLanguageSwitcher() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'lang-switcher';

        const btn = document.createElement('button');
        btn.className = 'lang-btn';
        const changeLangLabel = getNestedValue(currentTranslations, 'meta.changeLanguage')
            || getNestedValue(fallbackTranslations, 'meta.changeLanguage')
            || 'Change language';
        btn.title = changeLangLabel;
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-label', changeLangLabel);
        btn.innerHTML = '<span class="lang-icon"><svg width="16" height="16" viewBox="0 0 256 256" fill="none" aria-hidden="true"><defs><linearGradient id="iglobe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#007aff"/><stop offset="100%" stop-color="#5ac8fa"/></linearGradient></defs><circle cx="128" cy="128" r="96" fill="none" stroke="url(#iglobe)" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M168,128c0,64-40,96-40,96s-40-32-40-96,40-96,40-96S168,64,168,128Z" fill="none" stroke="url(#iglobe)" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="37.46" y1="96" x2="218.54" y2="96" fill="none" stroke="url(#iglobe)" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="37.46" y1="160" x2="218.54" y2="160" fill="none" stroke="url(#iglobe)" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg></span><span id="lang-label" class="lang-label-text"></span>';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(isOpen));
        });

        const dropdown = document.createElement('div');
        dropdown.className = 'lang-dropdown';
        dropdown.setAttribute('role', 'menu');

        for (const locale of SUPPORTED_LOCALES) {
            const item = document.createElement('button');
            item.className = 'lang-option';
            item.setAttribute('role', 'menuitem');
            item.dataset.lang = locale;
            item.textContent = LOCALE_LABELS[locale];
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                setLanguage(locale);
                wrapper.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            });
            dropdown.appendChild(item);
        }

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);
        navLinks.appendChild(wrapper);

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            wrapper.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    }

    /* ───── Init ───── */

    async function init() {
        // Always load English as fallback
        fallbackTranslations = await loadTranslations('en');

        const lang = detectLanguage();
        safeStorage('set', STORAGE_KEY, lang);

        if (lang !== 'en') {
            currentTranslations = await loadTranslations(lang);
        } else {
            currentTranslations = fallbackTranslations;
        }

        buildLanguageSwitcher();
        applyTranslations();
    }

    // Expose globally
    window.klosytI18n = { setLanguage, detectLanguage };

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
