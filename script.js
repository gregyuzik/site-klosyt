// Theme definitions — match the app exactly
const themes = [
    { asset: 'wallpaper_redvelvet.webp', name: 'Red Velvet', icon: 'AppIcon-blue.png', color: '#6E0003', hue: '359' },
    { asset: 'wallpaper_blue.webp', name: 'Blue Velvet', icon: 'AppIcon-blue.png', color: '#081A4A', hue: '220' },
    { asset: 'wallpaper_red.webp', name: 'Red Leather', icon: 'AppIcon-red.png', color: '#4D171F', hue: '348' },
    { asset: 'wallpaper_orange.webp', name: 'Orange Leopard', icon: 'AppIcon-orange.png', color: '#A3540F', hue: '28' },
    { asset: 'wallpaper_yellow.webp', name: 'Yellow Plaid', icon: 'AppIcon-yellow.png', color: '#856624', hue: '42' },
    { asset: 'wallpaper_green.webp', name: 'Green Canvas', icon: 'AppIcon-green.png', color: '#5C543D', hue: '44' },
    { asset: 'wallpaper_purple.webp', name: 'Purple Cashmere', icon: 'AppIcon-purple.png', color: '#663354', hue: '276' },
    { asset: 'wallpaper_pink.webp', name: 'Pink Mohair', icon: 'AppIcon-pink.png', color: '#D42E73', hue: '338' },
    { asset: 'wallpaper_white.webp', name: 'White Knit', icon: 'AppIcon-white.png', color: '#DED9D1', hue: '37',
      meshColors: ['rgba(180,180,200,.6)', 'rgba(160,170,190,.5)', 'rgba(170,180,200,.4)'] },
    { asset: 'wallpaper_gray.webp', name: 'Gray Houndstooth', icon: 'AppIcon-gray.png', color: '#787878', hue: '0',
      meshColors: ['rgba(100,100,120,.6)', 'rgba(80,80,100,.5)', 'rgba(90,90,110,.4)'] }
];

function safeStorage(method, key, value) {
    try {
        if (method === 'get') return localStorage.getItem(key);
        if (method === 'set') localStorage.setItem(key, value);
    } catch (e) { return null; }
}

function getTheme(asset) {
    return themes.find(function(t) { return t.asset === asset; }) || themes[0];
}

function getCurrentWallpaper() {
    return safeStorage('get', 'klosyt_wallpaper') || 'wallpaper_redvelvet.webp';
}

function updateIcons(iconFile) {
    const path = '/assets/' + iconFile;
    document.querySelectorAll('.dynamic-app-icon').forEach(function(img) { img.src = path; });
    const fav = document.querySelector('link[rel="icon"]');
    if (fav) fav.href = path;
    const touch = document.querySelector('link[rel="apple-touch-icon"]');
    if (touch) touch.href = path;
}

function createColorDot(color, size) {
    const dot = document.createElement('span');
    dot.style.cssText = 'display:inline-block;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color;
    return dot;
}

function updateThemePill(pill, theme) {
    pill.textContent = '';
    pill.appendChild(createColorDot(theme.color, 22));
    const nameSpan = document.createElement('span');
    nameSpan.className = 'theme-name-text';
    nameSpan.textContent = theme.name;
    pill.appendChild(nameSpan);
}

function updateWallpaper(asset) {
    document.documentElement.style.setProperty('--wallpaper-image', "url('/assets/" + asset + "')");
    var theme = getTheme(asset);
    if (theme) document.documentElement.style.backgroundColor = theme.color;
}

function updateThemeColor(color) {
    var meta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
    if (meta) meta.setAttribute('content', color);
}

function updateMeshColors(theme) {
    const orbs = document.querySelectorAll('.mesh-orb');
    if (orbs.length < 3) return;

    if (theme.meshColors) {
        orbs[0].style.background = 'radial-gradient(circle, ' + theme.meshColors[0] + ' 0%, transparent 70%)';
        orbs[1].style.background = 'radial-gradient(circle, ' + theme.meshColors[1] + ' 0%, transparent 70%)';
        orbs[2].style.background = 'radial-gradient(circle, ' + theme.meshColors[2] + ' 0%, transparent 70%)';
        return;
    }

    const h = parseInt(theme.hue, 10);
    orbs[0].style.background = 'radial-gradient(circle, hsl(' + h + ',55%,35%) 0%, transparent 70%)';
    orbs[1].style.background = 'radial-gradient(circle, hsl(' + ((h + 40) % 360) + ',50%,30%) 0%, transparent 70%)';
    orbs[2].style.background = 'radial-gradient(circle, hsl(' + ((h - 30 + 360) % 360) + ',45%,32%) 0%, transparent 70%)';
}

function setTheme(asset) {
    const theme = getTheme(asset);
    safeStorage('set', 'klosyt_wallpaper', asset);
    safeStorage('set', 'klosyt_wallpaper_manual', 'true');
    const short = asset.replace('wallpaper_', '').replace('.webp', '');
    safeStorage('set', 'klosyt_theme', short);

    updateWallpaper(theme.asset);
    updateIcons(theme.icon);
    updateMeshColors(theme);
    updateThemeColor(theme.color);

    const pill = document.getElementById('theme-pill');
    if (pill) updateThemePill(pill, theme);
}

function buildThemeDropdown() {
    const switcher = document.getElementById('theme-switcher');
    const btn = document.getElementById('theme-btn');
    const dropdown = document.getElementById('theme-dropdown');
    if (!switcher || !btn || !dropdown) return;

    const current = getCurrentWallpaper();
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');

    themes.forEach(function(t) {
        const opt = document.createElement('button');
        opt.className = 'theme-option';
        if (t.asset === current) opt.classList.add('active');
        opt.appendChild(createColorDot(t.color, 10));
        opt.style.gap = '6px';
        const label = document.createTextNode(t.name);
        opt.appendChild(label);
        opt.addEventListener('click', function(e) {
            e.stopPropagation();
            setTheme(t.asset);
            dropdown.querySelectorAll('.theme-option').forEach(function(o) { o.classList.remove('active'); });
            opt.classList.add('active');
            switcher.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
        dropdown.appendChild(opt);
    });

    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = switcher.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function() {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const wp = safeStorage('get', 'klosyt_wallpaper_manual') === 'true'
        ? (safeStorage('get', 'klosyt_wallpaper') || 'wallpaper_redvelvet.webp')
        : 'wallpaper_redvelvet.webp';

    const theme = getTheme(wp);
    updateWallpaper(theme.asset);
    updateIcons(theme.icon);
    updateMeshColors(theme);
    updateThemeColor(theme.color);

    const pill = document.getElementById('theme-pill');
    if (pill) updateThemePill(pill, theme);

    buildThemeDropdown();
});
