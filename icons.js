/**
 * Klosyt Website — Phosphor Icon Replacement
 * Replaces emoji in card-ico and pl-ico elements with inline Phosphor SVGs
 * rendered with gradient strokes matching the app's SF Symbol color scheme.
 *
 * Icons: Phosphor 2.1.1 Regular weight (256×256 viewBox, stroke-based)
 * See: https://phosphoricons.com
 */
(function () {
    'use strict';

    // Phosphor SVG inner content (after bounding rect) + gradient colors
    const icons = {
        '✨': {
            svg: '<path d="M84.27,171.73l-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3a7.92,7.92,0,0,1,0,14.86l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="176" y1="16" x2="176" y2="64" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="224" y1="72" x2="224" y2="104" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="40" x2="200" y2="40" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="208" y1="88" x2="240" y2="88" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#c073ff', '#af52de']
        },
        '👔': {
            svg: '<path d="M192,120h28.34a8.44,8.44,0,0,0,7.5-4.42l19.27-36.81a7.81,7.81,0,0,0-3.33-10.52L192,40" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M64,120H35.66a8.44,8.44,0,0,1-7.5-4.42L8.89,78.77a7.81,7.81,0,0,1,3.33-10.52L64,40" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M160,40a32,32,0,0,1-64,0H64V208a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V40Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#5ac8fa', '#007aff']
        },
        '📅': {
            svg: '<rect x="40" y="40" width="176" height="176" rx="8" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="176" y1="24" x2="176" y2="56" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="80" y1="24" x2="80" y2="56" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="40" y1="88" x2="216" y2="88" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="88 128 104 120 104 184" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M138.14,128a16,16,0,1,1,26.64,17.63L136,184h32" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ff3b30', '#ff9500']
        },
        '🔐': {
            svg: '<rect x="40" y="88" width="176" height="128" rx="8" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="128" cy="152" r="12"/><path d="M88,88V56a40,40,0,0,1,80,0V88" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#34c759', '#30b0c7']
        },
        '☁️': {
            svg: '<path d="M80,128a80,80,0,1,1,80,80H72A56,56,0,1,1,85.92,97.74" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#5ac8fa', '#007aff']
        },
        '🔍': {
            svg: '<path d="M34.1,61.38A8,8,0,0,1,40,48H216a8,8,0,0,1,5.92,13.38L152,136v58.65a8,8,0,0,1-3.56,6.66l-32,21.33A8,8,0,0,1,104,216V136Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ff2d55', '#ff3b30']
        },
        '📸': {
            svg: '<path d="M208,208H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H80L96,40h64l16,24h32a16,16,0,0,1,16,16V192A16,16,0,0,1,208,208Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="128" cy="132" r="36" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#8e8e93', '#636366']
        },
        '📥': {
            svg: '<path d="M184,128h40a8,8,0,0,1,8,8v64a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V136a8,8,0,0,1,8-8H72" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="24" x2="128" y2="128" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="80 80 128 128 176 80" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="188" cy="168" r="12"/>',
            g: ['#007aff', '#5ac8fa']
        },
        '👗': {
            svg: '<line x1="160" y1="35.22" x2="160" y2="8" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="96" y1="8" x2="96" y2="35.22" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M200,224a8,8,0,0,0,7.35-11.15L160,112l22.86-35.88a8,8,0,0,0,0-8.24L160,35.22,153,44a32,32,0,0,1-50,0l-7-8.77L73.14,67.88a8,8,0,0,0,0,8.24L96,112,48.66,212.85A8,8,0,0,0,56,224Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="96" y1="112" x2="160" y2="112" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ff3b60', '#ff2d55']
        },
        '📱': {
            svg: '<rect x="64" y="24" width="128" height="208" rx="16" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="64" y1="56" x2="192" y2="56" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="64" y1="200" x2="192" y2="200" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#007aff', '#5856d6']
        },
        '🏷️': {
            svg: '<path d="M42.34,138.34A8,8,0,0,1,40,132.69V40h92.69a8,8,0,0,1,5.65,2.34l99.32,99.32a8,8,0,0,1,0,11.31L153,237.66a8,8,0,0,1-11.31,0Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="84" cy="84" r="12"/>',
            g: ['#ff9f0a', '#ffcc00']
        },
        '🔗': {
            svg: '<path d="M141.38,64.68l11-11a46.62,46.62,0,0,1,65.94,0h0a46.62,46.62,0,0,1,0,65.94L193.94,144,183.6,154.34a46.63,46.63,0,0,1-66-.05h0A46.48,46.48,0,0,1,104,120.06" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M114.62,191.32l-11,11a46.63,46.63,0,0,1-66-.05h0a46.63,46.63,0,0,1,.06-65.89L72.4,101.66a46.62,46.62,0,0,1,65.94,0h0A46.45,46.45,0,0,1,152,135.94" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#8e8e93', '#636366']
        },
        '🎨': {
            svg: '<path d="M128,192a24,24,0,0,1,24-24h46.21a24,24,0,0,0,23.4-18.65A96.48,96.48,0,0,0,224,127.17c-.45-52.82-44.16-95.7-97-95.17a96,96,0,0,0-95,96c0,41.81,26.73,73.44,64,86.61A24,24,0,0,0,128,192Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="128" cy="76" r="12"/><circle cx="84" cy="100" r="12"/><circle cx="84" cy="156" r="12"/><circle cx="172" cy="100" r="12"/>',
            g: ['#ff9500', '#ffcc00']
        },
        '📦': {
            svg: '<polyline points="32.7 76.92 128 129.08 223.3 76.92" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M131.84,25l88,48.18a8,8,0,0,1,4.16,7v95.64a8,8,0,0,1-4.16,7l-88,48.18a8,8,0,0,1-7.68,0l-88-48.18a8,8,0,0,1-4.16-7V80.18a8,8,0,0,1,4.16-7l88-48.18A8,8,0,0,1,131.84,25Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="129.09" x2="128" y2="232" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#a2845e', '#c89b3c']
        },
        '💡': {
            svg: '<line x1="88" y1="232" x2="168" y2="232" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M78.7,167A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24a80,80,0,0,1,51.34,142.9A24.3,24.3,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6A24.11,24.11,0,0,0,78.7,167Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M136,56c20,3.37,36.61,20,40,40" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ffcc00', '#ff9500']
        },
        '📤': {
            svg: '<path d="M176,128h48a8,8,0,0,1,8,8v64a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V136a8,8,0,0,1,8-8H80" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="128" x2="128" y2="24" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="80 72 128 24 176 72" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="188" cy="168" r="12"/>',
            g: ['#5b9bd5', '#5ac8fa']
        },
        '🧠': {
            svg: '<path d="M88,136a40,40,0,1,1-40,40v-6.73" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M168,136a40,40,0,1,0,40,40v-6.73" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M72,172H64A48,48,0,0,1,48,78.73V72a40,40,0,0,1,80,0V176" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M184,172h8a48,48,0,0,0,16-93.27V72a40,40,0,0,0-80,0" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M200,112h-4a28,28,0,0,1-28-28V80" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M56,112h4A28,28,0,0,0,88,84V80" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#af52de', '#5856d6']
        },
        '🌤️': {
            svg: '<line x1="87.66" y1="56.73" x2="83.5" y2="33.09" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="56.69" y1="76.46" x2="37.03" y2="62.69" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="48.73" y1="112.31" x2="25.09" y2="116.48" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="123.52" y1="64.69" x2="137.28" y2="45.03" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M96,144a68.06,68.06,0,1,1,68,72H84a44,44,0,1,1,14.2-85.66" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M59.65,135.35a48,48,0,1,1,80.19-50.94" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ffcc00', '#5ac8fa']
        },
        '🚀': {
            svg: '<path d="M191.11,112.89c24-24,25.5-52.55,24.75-65.28a8,8,0,0,0-7.47-7.47c-12.73-.75-41.26.73-65.28,24.75L80,128l48,48Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M136,72H74.35a8,8,0,0,0-5.65,2.34L34.35,108.69a8,8,0,0,0,4.53,13.57L80,128" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M184,120v61.65a8,8,0,0,1-2.34,5.65l-34.35,34.35a8,8,0,0,1-13.57-4.53L128,176" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M94.56,187.82C90.69,196.31,77.65,216,40,216c0-37.65,19.69-50.69,28.18-54.56" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ff9500', '#ffcc00']
        },
        '👑': {
            svg: '<circle cx="128" cy="52" r="20" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="220" cy="80" r="20" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="36" cy="80" r="20" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="120.02 70.35 88 144 48.61 95.52" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="207.39 95.52 168 144 135.98 70.35" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M39.29,99.73l15.6,93.59A8,8,0,0,0,62.78,200H193.22a8,8,0,0,0,7.89-6.68l15.6-93.59" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#FFD700', '#FFB300']
        },
        '❌': {
            svg: '<line x1="160" y1="96" x2="96" y2="160" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="96" y1="96" x2="160" y2="160" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="128" cy="128" r="96" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#ff3b30', '#ff3b30']
        },
        '🌐': {
            svg: '<circle cx="128" cy="128" r="96" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M168,128c0,64-40,96-40,96s-40-32-40-96,40-96,40-96S168,64,168,128Z" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="37.46" y1="96" x2="218.54" y2="96" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="37.46" y1="160" x2="218.54" y2="160" fill="none" stroke="cC" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>',
            g: ['#007aff', '#5ac8fa']
        }
    };

    let idCounter = 0;
    const MAX_MUTATIONS = 10;

    function makeSvg(icon, size) {
        size = size || 22;
        const id = 'ig' + (++idCounter);
        const ref = 'url(#' + id + ')';
        const content = icon.svg.replace(/cC/g, ref);
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 256 256" fill="' + ref + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">' +
            '<stop offset="0%" stop-color="' + icon.g[0] + '"/>' +
            '<stop offset="100%" stop-color="' + icon.g[1] + '"/>' +
            '</linearGradient></defs>' +
            '<rect width="256" height="256" fill="none"/>' +
            content + '</svg>';
    }

    function replaceEmoji() {
        // Replace emoji in card-ico and pl-ico elements (skip if already has SVG)
        const targets = document.querySelectorAll('.card-ico, .pl-ico');
        targets.forEach(function (el) {
            if (el.querySelector('svg')) return;
            const text = el.textContent.trim();
            if (icons[text]) {
                const size = el.classList.contains('pl-ico') ? 16 : 22;
                el.innerHTML = makeSvg(icons[text], size);
            }
        });

        // Replace crown in nav links (skip if already has SVG)
        document.querySelectorAll('[data-i18n="nav.klosytPlus"]').forEach(function (el) {
            if (el.querySelector('svg')) return;
            el.innerHTML = makeSvg(icons['👑'], 14) + ' Klosyt+';
        });

        // Replace ❌ in privacy table (skip if already has SVG)
        document.querySelectorAll('[data-i18n="privacy.tableNo"]').forEach(function (el) {
            if (el.querySelector('svg')) return;
            el.innerHTML = makeSvg(icons['❌'], 14) + ' No';
        });
    }

    let running = false;
    function safeReplace() {
        if (running) return;
        running = true;
        replaceEmoji();
        running = false;
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeReplace);
    } else {
        safeReplace();
    }

    // Re-run after i18n applies translations (short delay to batch mutations)
    let pending = null;
    let mutationCount = 0;
    const observer = new MutationObserver(function () {
        if (pending) return;
        pending = setTimeout(function () {
            pending = null;
            safeReplace();
            if (++mutationCount >= MAX_MUTATIONS) {
                observer.disconnect();
            }
        }, 100);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Expose for manual re-run
    window.klosytIcons = { replace: replaceEmoji, makeSvg: makeSvg, icons: icons };
})();
