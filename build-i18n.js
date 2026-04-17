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
const SITE_URL = 'https://klosyt.com';
const LASTMOD = '2026-04-13';

const LOCALES = [
    'zh-Hans', 'zh-Hant', 'da', 'nl', 'fr', 'de',
    'it', 'ja', 'ko', 'nb', 'pt-BR', 'ru', 'es', 'sv', 'tr', 'vi'
];

// BCP-47 → Open Graph locale (language_TERRITORY). Used for og:locale and
// og:locale:alternate so Facebook/LinkedIn/Slack disambiguate multilingual cards.
const OG_LOCALE = {
    'en': 'en_US',
    'zh-Hans': 'zh_CN',
    'zh-Hant': 'zh_TW',
    'da': 'da_DK',
    'nl': 'nl_NL',
    'fr': 'fr_FR',
    'de': 'de_DE',
    'it': 'it_IT',
    'ja': 'ja_JP',
    'ko': 'ko_KR',
    'nb': 'nb_NO',
    'pt-BR': 'pt_BR',
    'ru': 'ru_RU',
    'es': 'es_ES',
    'sv': 'sv_SE',
    'tr': 'tr_TR',
    'vi': 'vi_VN'
};

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

const SUPPORT_FAQ_KEYS = [
    ['support.photosTitle', 'support.photosDesc'],
    ['support.importTitle', 'support.importDesc'],
    ['support.outfitsTitle', 'support.outfitsDesc'],
    ['support.aiTitle', 'support.aiDesc'],
    ['support.backupTitle', 'support.backupDesc'],
    ['support.multiPlatformTitle', 'support.multiPlatformDesc'],
    ['support.ts1Summary', 'support.ts1Answer'],
    ['support.ts3Summary', 'support.ts3Answer'],
    ['support.ts8Summary', 'support.ts8Answer']
];

function loadJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getNestedValue(obj, keyPath) {
    return keyPath.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

function getTranslation(translations, fallback, keyPath) {
    return getNestedValue(translations, keyPath) || getNestedValue(fallback, keyPath) || '';
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

function escapeAttribute(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

const META_DESCRIPTION_LIMIT = 160;

// Truncate at the last whitespace before the limit so meta descriptions never
// end mid-word. Falls through to a hard cut only when there is no whitespace
// at all in the prefix (effectively never for natural language).
function truncateForMeta(str) {
    if (str.length <= META_DESCRIPTION_LIMIT) {
        return str;
    }
    const head = str.slice(0, META_DESCRIPTION_LIMIT - 1);
    const lastBreak = head.search(/\s\S*$/);
    const cut = lastBreak > 0 ? head.slice(0, lastBreak) : head;
    return cut.replace(/[\s\u3000,，、;；:：—–-]+$/u, '') + '…';
}

function buildCanonicalUrl(locale, page) {
    const canonicalPath = PAGE_META[page].canonicalPath;
    const base = locale === 'en' ? `${SITE_URL}/` : `${SITE_URL}/${locale}/`;

    return canonicalPath ? base + canonicalPath : base;
}

function indentJson(obj) {
    return JSON.stringify(obj, null, 4)
        .split('\n')
        .map(line => `    ${line}`)
        .join('\n');
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

    // Translate attributes paired with a data-i18n-* key. Matches both orders
    // (`alt="…" data-i18n-alt="…"` and `data-i18n-alt="…" alt="…"`) so author
    // order in HTML is not load-bearing.
    const translateAttribute = (sourceAttr, targetAttr) => {
        const targetAfter = new RegExp(`${targetAttr}="[^"]*"(\\s+${sourceAttr}="([^"]+)")`, 'g');
        html = html.replace(targetAfter, (_match, suffix, key) => {
            const translated = getTranslation(translations, fallback, key);
            return translated
                ? `${targetAttr}="${escapeAttribute(translated)}"${suffix}`
                : _match;
        });

        const targetBefore = new RegExp(`(${sourceAttr}="([^"]+)"\\s+)${targetAttr}="[^"]*"`, 'g');
        html = html.replace(targetBefore, (_match, prefix, key) => {
            const translated = getTranslation(translations, fallback, key);
            return translated
                ? `${prefix}${targetAttr}="${escapeAttribute(translated)}"`
                : _match;
        });
    };

    translateAttribute('data-i18n-alt', 'alt');
    translateAttribute('data-i18n-aria-label', 'aria-label');

    return html;
}

// Top-level assets served from the repo root. Any bare (href|src) reference
// to one of these gets rewritten to an absolute path so subdirectory pages
// (e.g. /fr/index.html) resolve them correctly. Add new top-level assets here.
const ROOT_ASSET_PREFIXES = ['assets/', 'styles.css', 'analytics.js', 'reveal.js', 'icons.js'];

/**
 * Convert relative asset/script paths to absolute so they resolve
 * correctly from subdirectory pages (e.g. /fr/index.html).
 */
function fixPaths(html) {
    const alt = ROOT_ASSET_PREFIXES
        .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    const pattern = new RegExp(`\\b(href|src)="(${alt})`, 'g');
    return html.replace(pattern, '$1="/$2');
}

function buildStructuredData(page, locale, translations, fallback) {
    const canonicalUrl = buildCanonicalUrl(locale, page);

    if (page === 'index.html') {
        const title = stripHTML(getTranslation(translations, fallback, 'hero.mainTitle'));
        const description = stripHTML(getTranslation(translations, fallback, 'hero.mainSubtitle'));
        const premiumFeatures = [
            getTranslation(translations, fallback, 'pricing.aiStyleAssistant'),
            getTranslation(translations, fallback, 'pricing.outfits'),
            getTranslation(translations, fallback, 'pricing.calendarTracking')
        ].map(stripHTML).join(', ');

        return {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Klosyt',
            applicationCategory: 'LifestyleApplication',
            applicationSubCategory: 'Fashion',
            operatingSystem: 'iOS 26, macOS 26, tvOS 26, visionOS 26',
            offers: [
                {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    description: stripHTML(getTranslation(translations, fallback, 'cta.bottomDesc'))
                },
                {
                    '@type': 'Offer',
                    price: '0.99',
                    priceCurrency: 'USD',
                    priceSpecification: {
                        '@type': 'UnitPriceSpecification',
                        billingDuration: 'P1M'
                    },
                    description: premiumFeatures
                }
            ],
            description,
            url: canonicalUrl,
            downloadUrl: 'https://apps.apple.com/app/klosyt/id6758277603',
            image: `${SITE_URL}/assets/AppIcon.png`,
            softwareVersion: '2.0',
            datePublished: '2025-03-13',
            author: {
                '@type': 'Person',
                name: 'Gregory Yuzik'
            },
            inLanguage: locale
        };
    }

    if (page === 'support.html') {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            url: canonicalUrl,
            inLanguage: locale,
            mainEntity: SUPPORT_FAQ_KEYS.map(([titleKey, answerKey]) => ({
                '@type': 'Question',
                name: stripHTML(getTranslation(translations, fallback, titleKey)),
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: stripHTML(getTranslation(translations, fallback, answerKey))
                }
            }))
        };
    }

    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${stripHTML(getTranslation(translations, fallback, 'privacy.title'))} — Klosyt`,
        url: canonicalUrl,
        description: stripHTML(
            `${getTranslation(translations, fallback, 'privacy.promiseText')} ${getTranslation(translations, fallback, 'privacy.promiseDetail')}`
        ),
        inLanguage: locale,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Klosyt',
            url: `${SITE_URL}/`
        }
    };
}

function updateStructuredData(html, page, locale, translations, fallback) {
    const json = indentJson(buildStructuredData(page, locale, translations, fallback));

    return html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${json}\n    </script>`
    );
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
    descText = truncateForMeta(descText);

    // Build page title
    const pageTitle = page === 'index.html'
        ? `Klosyt \u2014 ${titleText}`
        : `${titleText} \u2014 Klosyt`;

    const canonicalUrl = buildCanonicalUrl(locale, page);

    html = html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`);
    html = html.replace(
        /<meta name="description" content="[^"]*"/,
        `<meta name="description" content="${escapeAttribute(descText)}"`
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
        `<meta property="og:title" content="${escapeAttribute(pageTitle)}"`
    );
    html = html.replace(
        /<meta property="og:description" content="[^"]*"/,
        `<meta property="og:description" content="${escapeAttribute(descText)}"`
    );
    html = html.replace(
        /<meta name="twitter:title" content="[^"]*"/,
        `<meta name="twitter:title" content="${escapeAttribute(pageTitle)}"`
    );
    html = html.replace(
        /<meta name="twitter:description" content="[^"]*"/,
        `<meta name="twitter:description" content="${escapeAttribute(descText)}"`
    );

    // Rewrite og:locale for the target language and emit og:locale:alternate
    // entries for every other supported locale (English + 15 translations).
    const ogPrimary = OG_LOCALE[locale];
    if (ogPrimary) {
        const alternates = ['en']
            .concat(LOCALES)
            .filter(l => l !== locale)
            .map(l => `    <meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`)
            .join('\n');
        html = html.replace(
            /([ \t]*)<meta property="og:locale" content="[^"]*">[\s\S]*?(?=\s*<meta name="twitter:card")/,
            (_match, indent) =>
                `${indent}<meta property="og:locale" content="${ogPrimary}">\n${alternates}\n`
        );
    }

    return html;
}

// Per Google's hreflang sitemap spec, every URL in a hreflang group must
// self-reference all alternates including itself. We emit a single block per
// language version with the same alternates list.
function emitUrlBlock(lines, pageUrl, pagePath, priority) {
    const canonicalEnglishUrl = pagePath ? `${SITE_URL}/${pagePath}` : `${SITE_URL}/`;

    lines.push('  <url>');
    lines.push(`    <loc>${pageUrl}</loc>`);
    lines.push(`    <lastmod>${LASTMOD}</lastmod>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${canonicalEnglishUrl}"/>`);
    LOCALES.forEach(locale => {
        const localizedUrl = buildCanonicalUrl(locale, pagePath || 'index.html');
        lines.push(`    <xhtml:link rel="alternate" hreflang="${locale}" href="${localizedUrl}"/>`);
    });
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalEnglishUrl}"/>`);
    lines.push('  </url>');
}

function buildSitemap() {
    const canonicalPages = [
        { path: '', priority: '1.0', label: 'Homepage', localizedPriority: '0.9' },
        { path: 'support.html', priority: '0.8', label: 'Support', localizedPriority: '0.7' },
        { path: 'privacy.html', priority: '0.6', label: 'Privacy', localizedPriority: '0.5' }
    ];
    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ''
    ];

    canonicalPages.forEach(({ path: pagePath, priority, label, localizedPriority }, index) => {
        const englishUrl = pagePath ? `${SITE_URL}/${pagePath}` : `${SITE_URL}/`;

        lines.push(`  <!-- ${label} -->`);
        emitUrlBlock(lines, englishUrl, pagePath, priority);

        LOCALES.forEach(locale => {
            const localizedUrl = buildCanonicalUrl(locale, pagePath || 'index.html');
            emitUrlBlock(lines, localizedUrl, pagePath, localizedPriority);
        });

        if (index < canonicalPages.length - 1) {
            lines.push('');
        }
    });

    lines.push('');
    lines.push('</urlset>');

    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `${lines.join('\n')}\n`, 'utf8');
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
            html = updateStructuredData(html, page, locale, translations, fallback);

            fs.writeFileSync(path.join(outDir, page), html, 'utf8');
            totalPages++;
        }

        console.log(`  \u2713 ${locale}/ (${PAGES.length} pages)`);
    }

    buildSitemap();

    console.log(`\nDone! Generated ${totalPages} pages across ${LOCALES.length} locales and refreshed sitemap.xml.`);
}

build();
