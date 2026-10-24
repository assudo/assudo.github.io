// सभी मुख्य एलिमेंट्स को सेलेक्ट करना
const appListContainer = document.getElementById('appListContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const appCountNumber = document.getElementById('appCountNumber');
const pwaInstallBanner = document.getElementById('pwaInstallBanner');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');

// मॉडर्न पॉप-अप (Modal) एलिमेंट्स
const modernModal = document.getElementById('modernModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalIcon = document.getElementById('modalIcon');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

let allAppsData = [];
let deferredPrompt = null;

// ==========================================
// 1. मॉडर्न अलर्ट पॉप-अप फंक्शन (पुराने alert की जगह)
// ==========================================
function showModernAlert(title, message, iconClass = 'fa-solid fa-circle-info') {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.className = iconClass;
  modernModal.classList.add('active');
}

modalConfirmBtn.addEventListener('click', () => {
  modernModal.classList.remove('active');
});

modernModal.addEventListener('click', (e) => {
  if (e.target === modernModal) {
    modernModal.classList.remove('active');
  }
});

// ==========================================
// 2. PWA INSTALL & AUTO-HIDE BANNER LOGIC
// ==========================================
function checkIfPwaInstalled() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isSavedInstalled = localStorage.getItem('angadStoreInstalled') === 'true';

  if (isStandalone || isSavedInstalled) {
    // अगर ऐप इंस्टॉल है तो पूरा बैनर बॉक्स छुपा दो
    pwaInstallBanner.classList.add('hidden');
  } else {
    // अगर इंस्टॉल नहीं है तो दिखाओ
    pwaInstallBanner.classList.remove('hidden');
  }
}

// ब्राउज़र का इंस्टॉल प्रॉम्प्ट पकड़ना
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  localStorage.removeItem('angadStoreInstalled');
  pwaInstallBanner.classList.remove('hidden');
});

// Install बटन पर क्लिक करने पर
pwaInstallBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('angadStoreInstalled', 'true');
      pwaInstallBanner.classList.add('hidden');
      showModernAlert(
        'इंस्टॉल सफल रहा!',
        'Angad Labs Store आपके फोन की होम स्क्रीन पर जुड़ गया है।',
        'fa-solid fa-circle-check'
      );
    }
    deferredPrompt = null;
  } else {
    // अगर यूजर ऐसे ब्राउज़र में है जहाँ ऑटो-प्रॉम्प्ट अभी तैयार नहीं हुआ
    showModernAlert(
      'ऐप इंस्टॉल कैसे करें?',
      'अपने ब्राउज़र के ऊपर तीन डॉट (⋮) मेन्यू पर क्लिक करें और "Add to Home Screen" या "Install App" चुनें।',
      'fa-solid fa-mobile-screen-button'
    );
  }
});

// जैसे ही ऐप इंस्टॉल हो जाए, बैनर तुरंत छुपा दें
window.addEventListener('appinstalled', () => {
  localStorage.setItem('angadStoreInstalled', 'true');
  pwaInstallBanner.classList.add('hidden');
});

// ==========================================
// 3. ऐप डेटा लोड करना (app.json या app.js7 दोनों से)
// ==========================================
async function loadAppsData() {
  try {
    let response = await fetch('app.json');
    if (!response.ok) {
      // अगर आपने फाइल का नाम app.js7 रखा है तो उसे लोड करेगा
      response = await fetch('app.js7');
    }
    if (!response.ok) {
      throw new Error('Data file not found');
    }
    allAppsData = await response.json();
    renderApps(allAppsData);
  } catch (error) {
    appListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h4>डेटा लोड नहीं हो सका</h4>
        <p>कृपया सुनिश्चित करें कि app.json फाइल उसी फोल्डर में मौजूद है।</p>
      </div>
    `;
  }
}

// ==========================================
// 4. ऐप कार्ड्स को स्क्रीन पर बनाना
// ==========================================
function renderApps(appsArray) {
  // राइट साइड में ऐप काउंट अपडेट करना
  appCountNumber.textContent = appsArray.length;

  // अगर सर्च में कोई ऐप न मिले
  if (appsArray.length === 0) {
    appListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h4>कोई ऐप नहीं मिला</h4>
        <p>इस अक्षर या नाम से कोई ऐप उपलब्ध नहीं है।</p>
      </div>
    `;
    return;
  }

  appListContainer.innerHTML = appsArray.map(app => `
    <article class="app-card">
      <img 
        src="${app.icon}" 
        alt="${app.name}" 
        class="app-icon"
        onerror="this.src='https://cdn.jsdelivr.net/gh/Angadlabs/Angadlabs.github.io@main/assets/AngadLabsLogo.jpeg'"
      >
      <div class="app-details">
        <div class="app-title-row">
          <h3 class="app-name">${app.name}</h3>
          <span class="app-version">${app.version}</span>
        </div>
        <p class="app-desc">${app.shortDesc}</p>
      </div>
      <button class="open-app-btn" onclick="openAppUrl('${app.url}', '${app.name}')">
        <span>Open</span>
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </button>
    </article>
  `).join('');
}

// ==========================================
// 5. ऐप लिंक खोलना (New Tab में ताकि दूसरा PWA भी इंस्टॉल हो सके)
// ==========================================
function openAppUrl(url, appName) {
  if (!url || url.trim() === '' || url === '#') {
    showModernAlert(
      appName,
      'इस ऐप का लिंक जल्द ही अपडेट किया जाएगा!',
      'fa-solid fa-clock'
    );
    return;
  }

  // यहाँ '_blank' नए टैब में खोलता है (जो दूसरे PWA को इंस्टॉल करने के लिए सबसे बेस्ट है)।
  // अगर कभी सेम टैब में खोलना हो तो '_blank' की जगह '_self' लिख सकते हैं।
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ==========================================
// 6. पावरफुल लाइव सर्च बार (App Name के अक्षरों से फिल्टर)
// ==========================================
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();

  // क्लियर (X) बटन दिखाना या छुपाना
  if (query.length > 0) {
    clearSearchBtn.classList.add('show');
  } else {
    clearSearchBtn.classList.remove('show');
  }

  // अगर ऐप के नाम (name) में वह लेटर मौजूद है तो दिखे, वरना हाइड हो जाए
  const filteredApps = allAppsData.filter(app =>
    app.name.toLowerCase().includes(query)
  );

  renderApps(filteredApps);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.remove('show');
  renderApps(allAppsData);
  searchInput.focus();
});

// ==========================================
// 7. सर्विस वर्कर रजिस्टर और पेज स्टार्टअप
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

checkIfPwaInstalled();
loadAppsData();










// ==========================================
// 8. SHARE STORE BUTTON LOGIC (Web Share API)
// ==========================================
const shareStoreBtn = document.getElementById('shareStoreBtn');

shareStoreBtn.addEventListener('click', async () => {
  // आपके स्टोर का लाइव लिंक (जिस पर क्लिक करके अगला यूजर डायरेक्ट ओपन करेगा)
  const storeUrl = window.location.href;
  const shareTitle = 'Angad Labs Store';
  const shareDescription = '🚀 Angad Labs Store पर हमारे सभी शानदार एजुकेशनल और टूल्स ऐप्स (जैसे Exam Sathi) एक ही जगह पाएं!\n\nअभी ओपन करने के लिए नीचे दिए गए लिंक पर क्लिक करें:\n';

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareDescription,
        url: storeUrl
      });
    } catch (err) {
      // अगर यूजर खुद शेयर बॉक्स बंद कर दे तो कोई एरर न दिखाएं
    }
  } else {
    // अगर किसी पुराने ब्राउज़र में शेयर शीट न हो तो लिंक कॉपी कर लेगा
    navigator.clipboard.writeText(`${shareDescription}${storeUrl}`);
    showModernAlert(
      'लिंक कॉपी हो गया!',
      'स्टोर का लिंक और डिस्क्रिप्शन कॉपी हो गया है, अब आप इसे कहीं भी पेस्ट करके भेज सकते हैं।',
      'fa-solid fa-copy'
    );
  }
});



















// ==========================================
// 9. ANTI-DESKTOP MODE LOCK (हमेशा मोबाइल मोड में रखने का कोड)
// ==========================================
function forceMobileSimpleMode() {
  const screenWidth = window.screen.width;
  const viewportWidth = window.innerWidth;

  // 1. अगर यूजर फोन पर है और ब्राउज़र में "Desktop Site" ऑन कर रखा है
  if (screenWidth <= 500 && viewportWidth > screenWidth) {
    const scaleFactor = viewportWidth / screenWidth;
    document.body.style.zoom = scaleFactor;
    document.body.style.maxWidth = '100%';
  } else {
    document.body.style.zoom = 1;
    document.body.style.maxWidth = '450px';
  }

  // 2. PWA इंस्टॉल होने पर स्क्रीन को हमेशा सीधा (Portrait) लॉक रखना
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(() => {});
  }
}

// पेज खुलते ही और स्क्रीन बदलने पर तुरंत मोबाइल मोड लागू करें
window.addEventListener('load', forceMobileSimpleMode);
window.addEventListener('resize', forceMobileSimpleMode);

// दो उंगलियों से ज़ूम-इन / ज़ूम-आउट (Pinch Zoom) को पूरी तरह बंद करना
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });
