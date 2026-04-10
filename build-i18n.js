#!/usr/bin/env node
/**
 * build-i18n.js — Generate static HTML pages for each supported locale.
 *
 * Reads the English HTML templates and locale JSON files, then produces
 * localized copies at /[locale]/index.html, /[locale]/support.html, etc.
 * This gives search engines crawlable, indexable content in every language.
 *
 * Usage: node build-i18n.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);

const LOCALES = [
    'zh-Hans', 'zh-Hant', 'da', 'nl', 'fr', 'de',
    'it', 'ja', 'ko', 'nb', 'pt-BR', 'es', 'sv', 'tr', 'vi'
];

const PAGES = ['index.html', 'support.html', 'privacy.html'];

const PAGE_META = {
    'index.html': {
        titleKey: 'hero.mainTitle',
        descKey: 'hero.mainSubtitle',
        canonicalPath: ''
    },
    'support.html': {
        titleKey: 'support.headerTitle',
        descKey: 'support.headerDesc',
        canonicalPath: 'support.html'
    },
    'privacy.html': {
        titleKey: 'privacy.title',
        descKey: 'privacy.promiseText',
        canonicalPath: 'privacy.html'
    }
};

function loadJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getNestedValue(obj, keyPath) {
    return keyPath.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

function stripHTML(str) {
    return str
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&mdash;/g, '\u2014')
        .replace(/&middot;/g, '\u00B7')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Replace the content of elements that have a data-i18n attribute
 * with the translated value from the locale JSON.
 */
function applyTranslations(html, translations, fallback) {
    const regex = /(<(\w+)\s[^>]*?data-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g;

    html = html.replace(regex, (match, openTag, tagName, key, _oldContent, closeTag) => {
        const translated = getNestedValue(translations, key) || getNestedValue(fallback, key);
        if (translated !== null) {
            return openTag + translated + closeTag;
        }
        return match;
    });

    // Translate data-i18n-alt attributes
    html = html.replace(/data-i18n-alt="([^"]+)"/g, (match, key) => {
        const translated = getNestedValue(translations, key) || getNestedValue(fallback, key);
        if (translated !== null) {
            const escAttr = s => s.replace(/"/g, '&quot;');
            return match.replace(
                /data-i18n-alt="[^"]+"/,
                `data-i18n-alt="${key}"`
            );
        }
        return match;
    });

    // Update alt attributes where data-i18n-alt is present
    html = html.replace(/alt="[^"]*"(\s+data-i18n-alt="([^"]+)")/g, (match, suffix, key) => {
        const translated = getNestedValue(translations, key) || getNestedValue(fallback, key);
        if (translated !== null) {
            const escAttr = s => s.replace(/"/g, '&quot;');
            return `alt="${escAttr(translated)}"${suffix}`;
        }
        return match;
    });

    return html;
}

/**
 * Convert relative asset/script paths to absolute so they resolve
 * correctly from subdirectory pages (e.g. /fr/index.html).
 */
function fixPaths(html) {
    return html
        .replace(/href="assets\//g, 'href="/assets/')
        .replace(/src="assets\//g, 'src="/assets/')
        .replace(/href="styles\.css/g, 'href="/styles.css')
        .replace(/src="i18n\.js/g, 'src="/i18n.js')
        .replace(/src="icons\.js/g, 'src="/icons.js');
}

/**
 * Update <html lang>, <title>, meta description, canonical URL,
 * and Open Graph tags for the target locale.
 */
function updateMeta(html, locale, page, translations, fallback) {
    const meta = PAGE_META[page];

    // Extract translated title text (strip HTML tags like <br>)
    let titleText = getNestedValue(translations, meta.titleKey)
        || getNestedValue(fallback, meta.titleKey) || '';
    titleText = stripHTML(titleText);

    // Extract translated description
    let descText = getNestedValue(translations, meta.descKey)
        || getNestedValue(fallback, meta.descKey) || '';
    descText = stripHTML(descText);
    if (descText.length > 160) {
        descText = descText.substring(0, 157) + '...';
    }

    // Escape for HTML attributes
    const escAttr = s => s.replace(/"/g, '&quot;');

    // Build page title
    const pageTitle = page === 'index.html'
        ? `Klosyt \u2014 ${titleText}`
        : `${titleText} \u2014 Klosyt`;

    // Build canonical URL
    const canonicalBase = `https://klosyt.com/${locale}/`;
    const canonicalUrl = meta.canonicalPath
        ? canonicalBase + meta.canonicalPath
        : canonicalBase;

    html = html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`);
    html = html.replace(
        /<meta name="description" content="[^"]*"/,
        `<meta name="description" content="${escAttr(descText)}"`
    );
    html = html.replace(
        /<link rel="canonical" href="[^"]*"/,
        `<link rel="canonical" href="${canonicalUrl}"`
    );
    html = html.replace(
        /<meta property="og:url" content="[^"]*"/,
        `<meta property="og:url" content="${canonicalUrl}"`
    );
    html = html.replace(
        /<meta property="og:title" content="[^"]*"/,
        `<meta property="og:title" content="${escAttr(pageTitle)}"`
    );
    html = html.replace(
        /<meta property="og:description" content="[^"]*"/,
        `<meta property="og:description" content="${escAttr(descText)}"`
    );
    html = html.replace(
        /<meta name="twitter:title" content="[^"]*"/,
        `<meta name="twitter:title" content="${escAttr(pageTitle)}"`
    );
    html = html.replace(
        /<meta name="twitter:description" content="[^"]*"/,
        `<meta name="twitter:description" content="${escAttr(descText)}"`
    );

    return html;
}

function build() {
    console.log('Building localized pages...\n');

    const fallback = loadJSON(path.join(ROOT, 'locales', 'en.json'));
    let totalPages = 0;

    for (const locale of LOCALES) {
        const translations = loadJSON(path.join(ROOT, 'locales', `${locale}.json`));
        const outDir = path.join(ROOT, locale);

        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        for (const page of PAGES) {
            let html = fs.readFileSync(path.join(ROOT, page), 'utf8');

            html = applyTranslations(html, translations, fallback);
            html = fixPaths(html);
            html = updateMeta(html, locale, page, translations, fallback);

            fs.writeFileSync(path.join(outDir, page), html, 'utf8');
            totalPages++;
        }

        console.log(`  \u2713 ${locale}/ (${PAGES.length} pages)`);
    }

    console.log(`\nDone! Generated ${totalPages} pages across ${LOCALES.length} locales.`);
}

build();
