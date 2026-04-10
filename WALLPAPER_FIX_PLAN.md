# Wallpaper Layout Fix Plan

## Problem Summary

The wallpaper is currently painted on the `html` element and updated by JavaScript after page load.

That setup is fragile for a full-screen wallpaper because:

- `html` backgrounds with `background-attachment: fixed` are inconsistent across browsers, especially on Safari/iOS.
- The wallpaper sizing is tied to the root element instead of a dedicated viewport-sized layer.
- The recent changelog shows repeated churn between `body`, `html`, and custom wallpaper layers, which strongly suggests the current `html` approach regressed the initial layout behavior.

## Likely Root Cause

Current implementation:

- `styles.css` applies wallpaper sizing/positioning to `html`
- `script.js` sets `document.documentElement.style.backgroundImage`

This means the wallpaper is not rendered through a dedicated fixed layer. On initial load and resize, the browser can lay it out incorrectly before the viewport settles.

## Recommended Fix

Move wallpaper rendering off `html` and onto a dedicated fixed paint layer.

Best low-risk option:

1. Keep `html` responsible only for fallback background color.
2. Add a fixed wallpaper layer using `body::before`.
3. Drive the wallpaper image through a CSS custom property like `--wallpaper-image`.
4. Update `script.js` to set that CSS variable instead of setting `html.style.backgroundImage`.

## Exact Changes

### 1. Update `styles.css`

Add a default wallpaper variable in `:root`:

```css
--wallpaper-image: url('/assets/wallpaper_redvelvet.webp');
```

Remove wallpaper image layout rules from `html`:

```css
background-size: cover;
background-position: center;
background-repeat: no-repeat;
background-attachment: fixed;
```

Keep only the fallback color on `html`.

Add these rules to `body`:

```css
position: relative;
isolation: isolate;
```

Add a fixed pseudo-element:

```css
body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-color: #050508;
    background-image: var(--wallpaper-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -2;
    pointer-events: none;
}
```

This makes the wallpaper consistently viewport-sized and independent from page content height.

### 2. Update `script.js`

Change:

```js
document.documentElement.style.backgroundImage = "url('/assets/" + asset + "')";
```

To:

```js
document.documentElement.style.setProperty('--wallpaper-image', "url('/assets/" + asset + "')");
```

This keeps theme switching behavior the same while moving rendering to CSS.

## Optional Improvement

If you want to eliminate wallpaper flash for users who manually selected a different theme, add a tiny inline `<script>` in the `<head>` before the stylesheet loads:

- read `localStorage.getItem('klosyt_wallpaper')`
- set `document.documentElement.style.setProperty('--wallpaper-image', ...)`

That is optional. The main layout bug should be fixed by the dedicated fixed layer alone.

## Files To Edit

- `site-klosyt/styles.css`
- `site-klosyt/script.js`

## Validation Checklist

After the fix:

1. Load the home page with no saved theme and verify the wallpaper covers the viewport immediately.
2. Switch themes and refresh the page.
3. Verify wallpaper still fills correctly on:
   - home page
   - support page
   - privacy page
   - one localized page such as `da/index.html`
4. Verify mobile Safari behavior specifically if possible.
5. Bump the cache version on CSS/JS includes if deployment caching is aggressive.

## Why This Fix

This is the smallest change that:

- removes the fragile `html` wallpaper rendering path
- preserves existing theme-switching logic
- avoids tying wallpaper sizing to document height
- matches the earlier direction in the changelog toward a dedicated wallpaper layer
