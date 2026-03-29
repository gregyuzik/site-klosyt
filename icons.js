/**
 * Klosyt Website — SF Symbol Icon Replacement
 * Replaces emoji in card-ico and pl-ico elements with inline SVGs + gradients
 * matching the app's SF Symbol color scheme.
 */
(function () {
    'use strict';

    // Icon definitions: SVG path + gradient colors matching the app
    var icons = {
        '✨': { d: 'M12 1l2 6.5L20.5 10l-6.5 2L12 18.5 10 12 3.5 10 10 7.5zm7 5l.8 2.5 2.5.8-2.5.8L19 13l-.8-2.5-2.5-.8 2.5-.8zm-12 8l.8 2.5 2.5.8-2.5.8L5 20.5l-.8-2.5-2.5-.8 2.5-.8z', g: ['#c073ff', '#af52de'] },
        '👔': { d: 'M12 2a2 2 0 012 2c0 .7-.37 1.32-.93 1.66L13 5.73V8l6.5 4.5c.31.21.5.56.5.94 0 .62-.5 1.12-1.12 1.12H5.12C4.5 14.56 4 14.06 4 13.44c0-.38.19-.73.5-.94L11 8V5.73A2 2 0 0112 2z', g: ['#5ac8fa', '#007aff'] },
        '📅': { d: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z', g: ['#ff3b30', '#ff9500'] },
        '🔐': { d: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15 8H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z', g: ['#34c759', '#30b0c7'] },
        '☁️': { d: 'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A6 6 0 006 20h13a5 5 0 00.35-9.96z', g: ['#5ac8fa', '#007aff'] },
        '🔍': { d: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z', g: ['#ff2d55', '#ff3b30'] },
        '📸': { d: 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z', g: ['#8e8e93', '#636366'] },
        '📥': { d: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z', g: ['#007aff', '#5ac8fa'] },
        '👗': { d: 'M16 3l4 4-3 2v11H7V9L4 7l4-4c0 0 1.5 2 4 2s4-2 4-2z', g: ['#ff3b60', '#ff2d55'] },
        '📱': { d: 'M16 1H8c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-4 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4-4H8V5h8v12z', g: ['#007aff', '#5856d6'] },
        '🏷️': { d: 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.58l7-7c.37-.36.59-.86.59-1.42 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z', g: ['#ff9f0a', '#ffcc00'] },
        '🔗': { d: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z', g: ['#8e8e93', '#636366'] },
        '🎨': { d: 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.53.53 0 01-.13-.33c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z', g: ['#ff9500', '#ffcc00'] },
        '📦': { d: 'M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.78.2-1.14 0l-7.9-4.44A1 1 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.78-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z', g: ['#a2845e', '#c89b3c'] },
        '💡': { d: 'M9 21h6v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z', g: ['#ffcc00', '#ff9500'] },
        '📤': { d: 'M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z', g: ['#5b9bd5', '#5ac8fa'] },
        '🧠': { d: 'M12 2a9 9 0 00-9 9c0 3.1 1.6 5.8 4 7.4V21a1 1 0 001 1h8a1 1 0 001-1v-2.6c2.4-1.6 4-4.3 4-7.4a9 9 0 00-9-9zm-2 15H9v-3h1v3zm2 0h-1v-5h1v5zm2 0h-1v-3h1v3z', g: ['#af52de', '#5856d6'] },
        '🌤️': { d: 'M12.74 5.47C15.1 6.5 16.35 9.03 15.97 11.47c.9.5 1.53 1.46 1.53 2.57 0 1.63-1.32 2.96-2.96 2.96H7.05C5.18 17 3.67 15.49 3.67 13.62c0-1.44.9-2.67 2.17-3.16A6.02 6.02 0 0112.74 5.47zM17.5 5a2 2 0 110-4 2 2 0 010 4z', g: ['#ffcc00', '#5ac8fa'] },
        '🔓': { d: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z', g: ['#66bfff', '#007aff'] },
        '🏗️': { d: 'M13.7 2.3l-1.4 1.4L15.6 7H11v2h2l-4 9.5L7 17H2v2h5.3l2-4.7 1.4 1.4c.4.4 1 .4 1.4 0l5.6-5.6c.4-.4.4-1 0-1.4L13.7 2.3z', g: ['#8e8e93', '#636366'] },
        '🚀': { d: 'M12 2c-2.4 2.7-4.2 6.5-4.2 10.5 0 1.2.2 2.3.5 3.4L5 18.5V22h4l1.5-3c.5.1 1 .2 1.5.2s1-.1 1.5-.2L15 22h4v-3.5l-3.3-2.6c.3-1.1.5-2.2.5-3.4C16.2 8.5 14.4 4.7 12 2z', g: ['#4d9fff', '#af52de'] },
        '👑': { d: 'M5 16h14v2H5v-2zm0-1l3-6 4 3 4-8 4 6v5H5z', g: ['#B38000', '#D9A621'] },
        '❌': { d: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z', g: ['#ff3b30', '#ff3b30'] },
        '🌐': { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', g: ['#007aff', '#5ac8fa'] }
    };

    var idCounter = 0;

    function makeSvg(icon, size) {
        size = size || 22;
        var id = 'ig' + (++idCounter);
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="' + icon.g[0] + '"/>' +
            '<stop offset="100%" stop-color="' + icon.g[1] + '"/>' +
            '</linearGradient></defs>' +
            '<path fill="url(#' + id + ')" d="' + icon.d + '"/></svg>';
    }

    function replaceEmoji() {
        // Replace emoji in card-ico and pl-ico elements
        var targets = document.querySelectorAll('.card-ico, .pl-ico');
        targets.forEach(function (el) {
            var text = el.textContent.trim();
            if (icons[text]) {
                var size = el.classList.contains('pl-ico') ? 16 : 22;
                el.innerHTML = makeSvg(icons[text], size);
            }
        });

        // Replace crown in nav links
        document.querySelectorAll('[data-i18n="nav.klosytPlus"]').forEach(function (el) {
            var text = el.textContent || '';
            if (text.indexOf('👑') >= 0 || text.indexOf('Klosyt+') >= 0) {
                el.innerHTML = makeSvg(icons['👑'], 14) + ' Klosyt+';
            }
        });

        // Replace ❌ in privacy table
        document.querySelectorAll('[data-i18n="privacy.tableNo"]').forEach(function (el) {
            if (el.textContent.indexOf('❌') >= 0) {
                el.innerHTML = makeSvg(icons['❌'], 14) + ' No';
            }
        });
    }

    // Run after DOM ready, and re-run after i18n applies translations
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceEmoji);
    } else {
        replaceEmoji();
    }

    // Re-run after i18n translations are applied (uses MutationObserver)
    var observer = new MutationObserver(function () {
        replaceEmoji();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

    // Stop observing after 3 seconds to avoid performance hit
    setTimeout(function () { observer.disconnect(); }, 3000);

    // Expose for manual re-run
    window.klosytIcons = { replace: replaceEmoji, makeSvg: makeSvg, icons: icons };
})();
