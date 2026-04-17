#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://klosyt.com';
const LOCALES = [
    'zh-Hans', 'zh-Hant', 'da', 'nl', 'fr', 'de',
    'it', 'ja', 'ko', 'nb', 'pt-BR', 'ru', 'es', 'sv', 'tr', 'vi'
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

function expectedCanonical(relPath) {
    if (relPath === '404.html') return null;

    if (!relPath.includes('/')) {
        return relPath === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${relPath}`;
    }

    const [locale, page] = relPath.split('/');
    return page === 'index.html'
        ? `${SITE_URL}/${locale}/`
        : `${SITE_URL}/${locale}/${page}`;
}

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

// Guard against nested same-tag content inside a data-i18n element. The
// build-i18n regex assumes the opening and closing tag of a data-i18n node
// surround content without a nested *same* tag. A nested same-tag would make
// that regex match too greedily or too shortly. Detect at validation time so
// a future template change can't silently break i18n output.
const DATA_I18N_BLOCK = /<(\w+)\s[^>]*?data-i18n="[^"]+"[^>]*>([\s\S]*?)<\/\1>/g;

function hasNestedSameTag(html) {
    for (const match of html.matchAll(DATA_I18N_BLOCK)) {
        const [fullMatch, tag, inner] = match;
        const nested = new RegExp(`<${tag}(\\s|>)`, 'i');
        if (nested.test(inner)) {
            return { tag, snippet: fullMatch.slice(0, 120) };
        }
    }
    return null;
}

for (const relPath of ALL_HTML) {
    const html = readFile(relPath);

    FORBIDDEN_HOME_LINKS.forEach(pattern => {
        if (pattern.test(html)) {
            fail(`${relPath}: explicit index.html home link should be canonicalized`);
        }
    });

    const nested = hasNestedSameTag(html);
    if (nested) {
        fail(`${relPath}: data-i18n <${nested.tag}> contains a nested <${nested.tag}> — build regex cannot handle this (${nested.snippet}…)`);
    }

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

    const expected = expectedCanonical(relPath);
    if (expected !== null) {
        const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
        if (!canonicalMatch) {
            fail(`${relPath}: missing <link rel="canonical">`);
        } else if (canonicalMatch[1] !== expected) {
            fail(`${relPath}: canonical should be ${expected}, found ${canonicalMatch[1]}`);
        }
    }

    const langMatch = html.match(/<html lang="([^"]+)"/);
    if (!langMatch) {
        fail(`${relPath}: missing <html lang="...">`);
    } else if (locale !== 'en' && langMatch[1] !== locale) {
        fail(`${relPath}: <html lang> should be ${locale}, found ${langMatch[1]}`);
    } else if (locale === 'en' && langMatch[1] !== 'en') {
        fail(`${relPath}: <html lang> should be en, found ${langMatch[1]}`);
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
