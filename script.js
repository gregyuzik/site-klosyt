// Theme definitions — match the app exactly
var themes = [
    { asset: 'wallpaper_redvelvet.webp', name: 'Red Velvet', icon: 'AppIcon-blue.png', color: '#6E0003', hue: '359' },
    { asset: 'wallpaper_blue.webp', name: 'Blue Velvet', icon: 'AppIcon-blue.png', color: '#081A4A', hue: '220' },
    { asset: 'wallpaper_red.webp', name: 'Red Leather', icon: 'AppIcon-red.png', color: '#4D171F', hue: '348' },
    { asset: 'wallpaper_orange.webp', name: 'Orange Leopard', icon: 'AppIcon-orange.png', color: '#A3540F', hue: '28' },
    { asset: 'wallpaper_yellow.webp', name: 'Yellow Plaid', icon: 'AppIcon-yellow.png', color: '#856624', hue: '42' },
    { asset: 'wallpaper_green.webp', name: 'Green Canvas', icon: 'AppIcon-green.png', color: '#5C543D', hue: '44' },
    { asset: 'wallpaper_purple.webp', name: 'Purple Cashmere', icon: 'AppIcon-purple.png', color: '#663354', hue: '276' },
    { asset: 'wallpaper_pink.webp', name: 'Pink Mohair', icon: 'AppIcon-pink.png', color: '#D42E73', hue: '338' },
    { asset: 'wallpaper_white.webp', name: 'White Knit', icon: 'AppIcon-white.png', color: '#DED9D1', hue: '37' },
    { asset: 'wallpaper_gray.webp', name: 'Gray Houndstooth', icon: 'AppIcon-gray.png', color: '#787878', hue: '0' }
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
    var path = '/assets/' + iconFile;
    document.querySelectorAll('.dynamic-app-icon').forEach(function(img) { img.src = path; });
    var fav = document.querySelector('link[rel="icon"]');
    if (fav) fav.href = path;
    var touch = document.querySelector('link[rel="apple-touch-icon"]');
    if (touch) touch.href = path;
}

function updateMeshColors(theme) {
    var orbs = document.querySelectorAll('.mesh-orb');
    if (orbs.length < 3) return;
    var h = parseInt(theme.hue, 10);

    // Special cases for achromatic themes
    if (theme.asset === 'wallpaper_white.webp') {
        orbs[0].style.background = 'radial-gradient(circle, rgba(180,180,200,.6) 0%, transparent 70%)';
        orbs[1].style.background = 'radial-gradient(circle, rgba(160,170,190,.5) 0%, transparent 70%)';
        orbs[2].style.background = 'radial-gradient(circle, rgba(170,180,200,.4) 0%, transparent 70%)';
        return;
    }
    if (theme.asset === 'wallpaper_gray.webp') {
        orbs[0].style.background = 'radial-gradient(circle, rgba(100,100,120,.6) 0%, transparent 70%)';
        orbs[1].style.background = 'radial-gradient(circle, rgba(80,80,100,.5) 0%, transparent 70%)';
        orbs[2].style.background = 'radial-gradient(circle, rgba(90,90,110,.4) 0%, transparent 70%)';
        return;
    }

    orbs[0].style.background = 'radial-gradient(circle, hsl(' + h + ',55%,35%) 0%, transparent 70%)';
    orbs[1].style.background = 'radial-gradient(circle, hsl(' + ((h + 40) % 360) + ',50%,30%) 0%, transparent 70%)';
    orbs[2].style.background = 'radial-gradient(circle, hsl(' + ((h - 30 + 360) % 360) + ',45%,32%) 0%, transparent 70%)';
}

function setTheme(asset) {
    var theme = getTheme(asset);
    safeStorage('set', 'klosyt_wallpaper', asset);
    safeStorage('set', 'klosyt_wallpaper_manual', 'true');
    var short = asset.replace('wallpaper_', '').replace('.webp', '');
    safeStorage('set', 'klosyt_theme', short);

    updateIcons(theme.icon);
    updateMeshColors(theme);

    var pill = document.getElementById('theme-pill');
    if (pill) pill.innerHTML = '<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:' + theme.color + '"></span><span class="theme-name-text">' + theme.name + '</span>';
}

function buildThemeDropdown() {
    var switcher = document.getElementById('theme-switcher');
    var btn = document.getElementById('theme-btn');
    var dropdown = document.getElementById('theme-dropdown');
    if (!switcher || !btn || !dropdown) return;

    var current = getCurrentWallpaper();
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');

    themes.forEach(function(t) {
        var opt = document.createElement('button');
        opt.className = 'theme-option';
        if (t.asset === current) opt.classList.add('active');
        opt.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + t.color + ';vertical-align:middle;margin-right:6px"></span>' + t.name;
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
        var isOpen = switcher.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function() {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var wp = safeStorage('get', 'klosyt_wallpaper_manual') === 'true'
        ? (safeStorage('get', 'klosyt_wallpaper') || 'wallpaper_redvelvet.webp')
        : 'wallpaper_redvelvet.webp';

    var theme = getTheme(wp);
    updateIcons(theme.icon);
    updateMeshColors(theme);

    var pill = document.getElementById('theme-pill');
    if (pill) pill.innerHTML = '<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:' + theme.color + '"></span><span class="theme-name-text">' + theme.name + '</span>';

    buildThemeDropdown();
});
