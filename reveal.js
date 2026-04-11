(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        // Scroll-reveal for .fade-up elements. If IntersectionObserver is
        // unavailable (very old browsers) or JS fails silently, the
        // @media(scripting:none) rule in styles.css already shows content.
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            document.querySelectorAll('.fade-up').forEach(function (el) { io.observe(el); });
        } else {
            document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('in'); });
        }

        // Highlight the current locale in the language picker, if present.
        // Path looks like "/", "/fr/", "/fr/support.html", "/zh-Hans/", etc.
        var langRow = document.querySelector('.lang-row');
        if (langRow) {
            var locales = ['zh-Hans', 'zh-Hant', 'da', 'nl', 'fr', 'de', 'it', 'ja', 'ko', 'nb', 'pt-BR', 'es', 'sv', 'tr', 'vi'];
            var seg = (window.location.pathname.split('/')[1] || '').toLowerCase();
            var match = locales.find(function (l) { return l.toLowerCase() === seg; });
            var current = match || 'en';
            var link = langRow.querySelector('a[data-locale="' + current + '"]');
            if (link) link.classList.add('active');
        }
    });
})();
