#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOCALES = [
    'zh-Hans', 'zh-Hant', 'da', 'nl', 'fr', 'de',
    'it', 'ja', 'ko', 'nb', 'pt-BR', 'es', 'sv', 'tr', 'vi'
];
const PAGES = ['index.html', 'support.html', 'privacy.html'];
const ALL_HTML = ['index.html', 'support.html', 'privacy.html', '404.html']
    .concat(LOCALES.flatMap(locale => PAGES.map(page => `${locale}/${page}`)));
const FORBIDDEN_HOME_LINKS = [
    /href="index\.html"/,
    /href="index\.html#pricing"/,
    /href="\/index\.html"/,
    /href="\/index\.html#pricing"/
];
const ENGLISH_A11Y_MARKERS = [
    '>Skip to content<',
    '>Features<',
    '>Klosyt+ Pricing<',
    'aria-label="Get Klosyt"'
];

const errors = [];

function fail(message) {
    errors.push(message);
}

function readFile(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function resolveLocalTarget(fromPath, rawTarget) {
    if (!rawTarget || rawTarget === '/' || rawTarget.startsWith('http') || rawTarget.startsWith('mailto:') || rawTarget.startsWith('tel:') || rawTarget.startsWith('data:')) {
        return null;
    }

    const cleanTarget = rawTarget.split('?')[0].split('#')[0];
    if (!cleanTarget) {
        return null;
    }

    if (cleanTarget.startsWith('/')) {
        return path.join(ROOT, cleanTarget.slice(1));
    }

    return path.resolve(path.dirname(path.join(ROOT, fromPath)), cleanTarget);
}

function extractJsonLd(html, relPath) {
    const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
    if (!match) {
        fail(`${relPath}: missing JSON-LD block`);
        return null;
    }

    try {
        return JSON.parse(match[1]);
    } catch (error) {
        fail(`${relPath}: invalid JSON-LD (${error.message})`);
        return null;
    }
}

for (const relPath of ALL_HTML) {
    const html = readFile(relPath);

    FORBIDDEN_HOME_LINKS.forEach(pattern => {
        if (pattern.test(html)) {
            fail(`${relPath}: explicit index.html home link should be canonicalized`);
        }
    });

    const assetMatches = html.matchAll(/(?:href|src)="([^"#?]+)(?:\?[^"]*)?"/g);
    for (const [, target] of assetMatches) {
        const resolved = resolveLocalTarget(relPath, target);
        if (resolved && !fs.existsSync(resolved)) {
            fail(`${relPath}: missing local target ${target}`);
        }
    }

    const locale = relPath.includes('/') ? relPath.split('/')[0] : 'en';
    if (locale !== 'en') {
        ENGLISH_A11Y_MARKERS.forEach(marker => {
            if (html.includes(marker)) {
                fail(`${relPath}: English accessibility marker still present (${marker})`);
            }
        });

        const schema = extractJsonLd(html, relPath);
        if (schema && schema.inLanguage !== locale) {
            fail(`${relPath}: JSON-LD inLanguage should be ${locale}, found ${schema.inLanguage}`);
        }
    }
}

const sitemap = readFile('sitemap.xml');
for (const page of PAGES) {
    const rootUrl = page === 'index.html' ? 'https://klosyt.com/' : `https://klosyt.com/${page}`;
    if (!sitemap.includes(rootUrl)) {
        fail(`sitemap.xml: missing canonical URL ${rootUrl}`);
    }

    LOCALES.forEach(locale => {
        const localizedUrl = page === 'index.html'
            ? `https://klosyt.com/${locale}/`
            : `https://klosyt.com/${locale}/${page}`;
        if (!sitemap.includes(localizedUrl)) {
            fail(`sitemap.xml: missing localized URL ${localizedUrl}`);
        }
    });
}

if (errors.length) {
    console.error('Site validation failed:\n');
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`Validated ${ALL_HTML.length} HTML files and sitemap.xml.`);
