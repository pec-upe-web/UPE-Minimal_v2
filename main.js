// ── 1. 自動配對照片邏輯 ──
const allFiles = [
    "園區3D圖及空拍圖- 新市物流園區  .png",
    "園區3D圖及空拍圖- 新市物流園區1.png",
    "園區3D圖及空拍圖- 新市物流園區2.png",
    "園區3D圖及空拍圖- 新市物流園區3.png",
    "園區3D圖及空拍圖- 台中港物流園區10.jpg",
    "園區3D圖及空拍圖- 台中港物流園區11.jpg",
    "園區3D圖及空拍圖- 台中港物流園區12.jpg",
    "園區3D圖及空拍圖- 台中港物流園區13.jpg",
    "園區3D圖及空拍圖- 桃園楊梅民豐物流園區.png",
    "園區3D圖及空拍圖- 桃園楊梅民豐物流園區7.png",
    "園區3D圖及空拍圖- 桃園楊梅民豐物流園區9.jpg",
    "園區3D圖及空拍圖-桃園U-PARK智匯產業園區8.png",
    "園區3D圖及空拍圖-桃園航空城物流園區.png",
    "園區3D圖及空拍圖-桃園航空城物流園區4.png",
    "開幕影片截圖20.png",
    "開幕影片截圖26.png",
    "開幕影片截圖27.png",
    "開幕影片截圖28.png",
    "統昶提供影片截圖.png",
    "統昶提供影片截圖15.png",
    "統昶提供影片截圖16.png",
    "統昶提供影片截圖17.png",
    "統昶提供影片截圖18.png",
    "統昶提供影片截圖19.png",
    "統昶提供影片截圖20.png",
    "統昶提供影片截圖21.png",
    "統昶提供影片截圖22.png",
    "大智通影片截圖23.png",
    "大智通影片截圖24.png",
    "大智通影片截圖25.png"
];

const getImages = (keyword) => {
    const filtered = allFiles.filter(file => file.includes(keyword))
                             .map(file => `images/${file}`);
    return filtered.length > 0 ? filtered : [`images/${keyword}-placeholder.jpg`];
};

// ── 2. 資料庫設定 ──
const parkData = {
    "桃園航空城物流園區": {
        en: "Taoyuan Aerotropolis Logistics Park",
        land: "25,000", build: "68,000",
        img: getImages("航空城")
    },
    "桃園楊梅民豐物流園區": {
        en: "Taoyuan Yangmei Minfeng Logistics Park",
        land: "7,000", build: "20,000",
        img: getImages("楊梅民豐")
    },
    "桃園U-PARK智匯產業園區": {
        en: "Taoyuan Intelligence Synergy Industrial Park",
        land: "33,000", build: "68,000",
        img: getImages("U-PARK")
    },
    "台中港物流園區": {
        en: "Taichung Port Logistics Park",
        land: "28,000", build: "44,000",
        img: getImages("台中港")
    },
    "新市物流園區": {
        en: "Xinshi Logistics Park",
        land: "26,000", build: "47,000",
        img: getImages("新市")
    }
};

// ── 3. 游標與動畫邏輯 ──
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, .park-card, .logo-img, .accordion-header, .region-path[data-city]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

// ── 4. 手風琴 (Accordion) 切換 ──
document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('open');

        // Close all other items
        document.querySelectorAll('.accordion-item.open').forEach(openItem => {
            if (openItem !== item) openItem.classList.remove('open');
        });

        // Toggle current item
        item.classList.toggle('open', !isOpen);
    });
});

// ── 5. 地圖與列表雙向互動 ──
const svgEl = document.getElementById('taiwan-svg');
const hlClasses =['hl-north', 'hl-central', 'hl-south', 'hl-east'];
const parkCards = document.querySelectorAll('.park-card');
const paths = document.querySelectorAll('.region-path');

const detailSection = document.getElementById('park-detail-section');
const detailTitle = document.getElementById('detail-title');
const detailEn = document.getElementById('detail-en');
const detailLand = document.getElementById('detail-land');
const detailBuild = document.getElementById('detail-build');
const detailImg = document.getElementById('detail-img');

let currentDetailName = "";
let currentImgIndex = 0;

// ── Swipe Dots ──
const swipeDotsEl = document.getElementById('swipe-dots');

function renderDots(total) {
    if (!swipeDotsEl) return;
    swipeDotsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('span');
        dot.className = 'swipe-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => showImageByIndex(i));
        swipeDotsEl.appendChild(dot);
    }
}

function updateDots(index) {
    if (!swipeDotsEl) return;
    swipeDotsEl.querySelectorAll('.swipe-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// ── 自動輪播 ──
let autoPlayTimer = null;
const AUTO_PLAY_INTERVAL = 5500; // ms

function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
        if (!currentDetailName) return;
        const cleanName = currentDetailName.replace(/\s+/g, '');
        const data = parkData[cleanName];
        if (data && data.img.length > 1) {
            showImageByIndex(currentImgIndex + 1);
        }
    }, AUTO_PLAY_INTERVAL);
}

function stopAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
}

function showImageByIndex(index) {
    if (!currentDetailName) return;
    const cleanName = currentDetailName.replace(/\s+/g, '');
    const data = parkData[cleanName];
    if (!data || !Array.isArray(data.img) || data.img.length === 0) return;

    const images = data.img;
    currentImgIndex = ((index % images.length) + images.length) % images.length;
    const src = images[currentImgIndex];

    detailImg.classList.remove('img-crossfade');
    void detailImg.offsetWidth;
    detailImg.src = src;
    detailImg.classList.add('img-crossfade');
    updateDots(currentImgIndex);
}

function updateDetailView(card) {
    if (!card) return;
    const rawName = card.querySelector('.park-name h4').innerText.trim();
    if (currentDetailName === rawName) return;
    currentDetailName = rawName;
    currentImgIndex = 0;

    const cleanName = rawName.replace(/\s+/g, '');
    const data = parkData[cleanName];

    if(data) {
        detailTitle.innerText = rawName;
        detailEn.innerText = data.en;
        detailLand.innerText = data.land;
        detailBuild.innerText = data.build;
        renderDots(data.img.length);
        showImageByIndex(0);
        startAutoPlay();
        detailSection.classList.add('active-detail');
        detailSection.classList.remove('fade-in');
        void detailSection.offsetWidth;
        detailSection.classList.add('fade-in');
    }
}

function changeImage(direction) {
    const step = typeof direction === 'number' ? direction : 1;
    showImageByIndex(currentImgIndex + step);
}

function setHighlight(region, city) {
    hlClasses.forEach(c => svgEl.classList.remove(c));
    if (region && region !== 'island') {
        svgEl.classList.add('hl-' + region);
    }
    paths.forEach(p => p.classList.remove('active-city'));
    svgEl.classList.remove('has-active-city');
    if (city) {
        const targetPath = document.querySelector(`.region-path[data-city="${city}"]`);
        if (targetPath) {
            targetPath.classList.add('active-city');
            svgEl.classList.add('has-active-city');
        }
    }
}

parkCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        parkCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        setHighlight(card.getAttribute('data-region'), card.getAttribute('data-city'));
        updateDetailView(card);
    });
    card.addEventListener('click', (e) => {
        e.preventDefault();
    });
});

paths.forEach(path => {
    path.addEventListener('mouseenter', () => {
        const city = path.getAttribute('data-city');
        if (city) {
            const region = path.getAttribute('data-region');
            let targetCard = document.querySelector(`.park-card[data-city="${city}"]`);
            if (targetCard) {
                parkCards.forEach(c => c.classList.remove('active'));
                targetCard.classList.add('active');
                updateDetailView(targetCard);
            }
            setHighlight(region, city);
        }
    });
});

setHighlight('south', 'tainan');
window.addEventListener('DOMContentLoaded', () => {
    const defaultCard = document.querySelector('.park-card.active');
    if(defaultCard) updateDetailView(defaultCard);

    document.querySelectorAll('.img-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = parseInt(btn.dataset.direction, 10) || 1;
            changeImage(dir);
            // 手動操作後重新計時，避免馬上自動跳圖
            startAutoPlay();
        });
    });

    // ── Touch Swipe for detail image ──
    const imageCol = document.querySelector('.detail-image-col');
    if (imageCol) {
        let startX = 0;
        let startY = 0;

        imageCol.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        imageCol.addEventListener('touchend', (e) => {
            const deltaX = e.changedTouches[0].clientX - startX;
            const deltaY = e.changedTouches[0].clientY - startY;
            // 水平滑動距離 > 40px 且大於垂直滑動才觸發
            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                changeImage(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });
    }
});

// ── 最新消息 Modal ──
const newsModal    = document.getElementById('news-modal');
const modalOverlay = newsModal.querySelector('.news-modal-overlay');
const modalClose   = newsModal.querySelector('.news-modal-close');
const modalTag     = document.getElementById('modal-tag');
const modalDate    = document.getElementById('modal-date');
const modalTitle   = document.getElementById('modal-title');
const modalBody    = document.getElementById('modal-body');

function openNewsModal(item) {
    modalTag.textContent   = item.dataset.tag   || '';
    modalDate.textContent  = item.dataset.date  || '';
    modalTitle.textContent = item.dataset.title || '';
    modalBody.innerHTML    = `<p>${item.dataset.content || ''}</p>`;
    newsModal.classList.add('open');
    newsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    cursor.style.display = 'none';
}
function closeNewsModal() {
    newsModal.classList.remove('open');
    newsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    cursor.style.display = '';
}

document.querySelectorAll('.news-item').forEach(item => {
    item.addEventListener('click', () => openNewsModal(item));
});
modalOverlay.addEventListener('click', closeNewsModal);
modalClose.addEventListener('click', closeNewsModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNewsModal(); });

// ── 漢堡選單 (Hamburger Menu) ──
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');
const navEl     = document.querySelector('nav');

function closeNavMenu() {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    if (navEl) navEl.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        if (navEl) navEl.classList.toggle('menu-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // 點選選單連結後關閉選單
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNavMenu);
    });
}

// ── 切換園區 ──
function navigatePark(direction) {
    const cards = Array.from(document.querySelectorAll('.park-card'));
    const activeIndex = cards.findIndex(c => c.classList.contains('active'));
    const nextIndex = ((activeIndex + direction) + cards.length) % cards.length;
    const nextCard = cards[nextIndex];

    cards.forEach(c => c.classList.remove('active'));
    nextCard.classList.add('active');
    setHighlight(nextCard.getAttribute('data-region'), nextCard.getAttribute('data-city'));
    updateDetailView(nextCard);

    // 手機：捲動 location-list 容器（不用 scrollIntoView 避免頁面跳動）
    const list = document.querySelector('.location-list');
    if (list) {
        const cardLeft = nextCard.offsetLeft - list.offsetLeft;
        list.scrollTo({ left: cardLeft - (list.clientWidth - nextCard.offsetWidth) / 2, behavior: 'smooth' });
    }
}

// ── Park Nav 按鈕 ──
document.getElementById('park-prev')?.addEventListener('click', () => navigatePark(-1));
document.getElementById('park-next')?.addEventListener('click', () => navigatePark(1));

// ── 文字面板 Touch Swipe（切換園區，僅綁定文字區避免與圖片滑動衝突） ──
const detailTextCol = document.querySelector('.detail-text-col');
if (detailTextCol) {
    let pStartX = 0;
    let pStartY = 0;

    detailTextCol.addEventListener('touchstart', (e) => {
        pStartX = e.touches[0].clientX;
        pStartY = e.touches[0].clientY;
    }, { passive: true });

    detailTextCol.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].clientX - pStartX;
        const deltaY = e.changedTouches[0].clientY - pStartY;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            navigatePark(deltaX < 0 ? 1 : -1);
        }
    }, { passive: true });
}

// 通用錨點平滑捲動
document.querySelectorAll('a[href^="#"]:not(.park-card)').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        const t = document.querySelector(targetId);
        if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
    });
});
