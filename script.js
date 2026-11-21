let seabtn = document.querySelector("#searchbtn");
let seabox = document.querySelector("#searchbox");
let pabox = document.querySelector("#pagename");
let fleg1 = 0;
function search1() {
  if (fleg1===0) {
    seabox.style.display = "flex";
    pabox.style.display = "none";
    seabtn.innerHTML = "×";
    seabtn.style.fontSize = "25px";
    fleg1 = 1;
  } else {
    seabox.value = "";
    seabox.style.display = "none";
    pabox.style.display = "flex";
    seabtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;
    seabtn.style.fontSize = "18px";
    fleg1 = 0;
  };
};

seabtn.addEventListener("click",function () {
    filterActiveCards();
});

/*let appbox = document.querySelector("#appcardcontener");
let toolbox = document.querySelector("#toolcardcontener");
function tab(v) {
  let vf = Number(v);
  if (vf===0) {
    toolbox.style.display = "flex";
    appbox.style.display = "none";
  } else {
    toolbox.style.display = "none";
    appbox.style.display = "flex";
  };
};tab();*/


let menubtn = document.querySelector("#menubtn");
let menubox = document.querySelector(".asgo-main-box");
let ff = 0;
function menu() {
  if (ff===0) {
    menubox.style.display = "flex";
    menubtn.innerHTML=`<i class="fa-solid fa-xmark"></i>`
    ff = 1;
  } else {
    menubtn.innerHTML=`<i class="fa-solid fa-bars"></i>`
    menubox.style.display = "none";
    ff = 0;
  };
};









(function () {
    const appContainer = document.getElementById('appcardcontener');
    const toolContainer = document.getElementById('toolcardcontener');

    // कार्ड का HTML टेम्पलेट बनाने का फंक्शन
    function createCardHTML(item) {
        const logoValue = item.logo || '';
        const nameText = item.name || '';
        const pointText = item.point || item.description || '';
        const btnText = item.btnText || 'open';
        const url = item.url || '';
        const fallbackText = item.fallbackText || (nameText ? nameText.trim().slice(0, 2).toUpperCase() : 'APP');

        const logoHTML = isImageSource(logoValue)
            ? `<img src="${escapeAttr(logoValue)}" alt="${escapeAttr(nameText)} logo" class="asgo-retry-img" data-max-retries="3" data-fallback="${escapeAttr(fallbackText)}">`
            : escapeHTML(logoValue);

        return `
<div class="appcardshadwo">
<div class="appcard" ${url ? `data-url="${escapeAttr(url)}"` : ''}>
  <div class="applogo">
    ${logoHTML}
  </div>
  <div class="appde">
    <span class="appname">
      ${escapeHTML(nameText)}
    </span>
    <span class="apppoint">
      ${escapeHTML(pointText)}
    </span>
  </div>
  <div class="appopenbtn" ${url ? `data-url="${escapeAttr(url)}"` : ''}>
    ${escapeHTML(btnText)}
  </div>
</div>
</div>`;
    }

    // यह चेक करने के लिए कि logo में इमेज पाथ/URL है या साधारण टेक्स्ट
    function isImageSource(val) {
        if (typeof val !== 'string') return false;
        const trimmed = val.trim();
        return /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(trimmed) ||
               /^(https?:\/\/|data:image\/|\.{0,2}\/)/i.test(trimmed);
    }

    // URL में retry क्वेरी जोड़ने का हेल्पर (ताकि फ्रेश रिक्वेस्ट जाए)
    function buildRetryUrl(src, attempt) {
        if (!src || src.startsWith('data:image/')) return src;
        const cleanSrc = src.replace(/([?&])_retry=\d+(&|$)/g, (m, p1, p2) => p2 === '&' ? p1 : '');
        const sep = cleanSrc.includes('?') ? '&' : '?';
        return `${cleanSrc}${sep}_retry=${attempt}_${Date.now()}`;
    }

    // इमेज लोड एरर पर ऑटो-रीट्राई हैंडलर
    document.addEventListener('error', function (e) {
        const img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.classList.contains('asgo-retry-img')) return;

        const maxRetries = parseInt(img.getAttribute('data-max-retries') || '3', 10);
        const currentRetry = parseInt(img.getAttribute('data-retry-count') || '0', 10);
        const originalSrc = img.getAttribute('data-original-src') || img.getAttribute('src');

        if (!img.getAttribute('data-original-src')) {
            img.setAttribute('data-original-src', originalSrc);
        }

        if (currentRetry < maxRetries) {
            const nextRetry = currentRetry + 1;
            img.setAttribute('data-retry-count', String(nextRetry));

            // हर बार थोड़ा ज़्यादा इंतज़ार (1s, 2s, 3s) ताकि नेटवर्क/सर्वर को समय मिले
            const delay = nextRetry * 1000;

            setTimeout(function () {
                // यदि इमेज पहले ही लोड हो चुकी हो तो दोबारा कोशिश न करें
                if (img.complete && img.naturalWidth > 0) return;
                img.src = buildRetryUrl(originalSrc, nextRetry);
            }, delay);
        } else {
            // सारी कोशिशें फेल होने पर fallback टेक्स्ट दिखाएं
            const fallbackText = img.getAttribute('data-fallback') || '';
            const parent = img.parentElement;
            if (parent) {
                parent.textContent = fallbackText;
            }
        }
    }, true);



    // XSS से बचाने के लिए हेल्पर फंक्शन्स
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(str) {
        return String(str).replace(/"/g, '&quot;');
    }

    // JSON फाइल लोड करके कंटेनर में रेंडर करने का फंक्शन
    async function loadCards(jsonUrl, container, label) {
        if (!container) return;

        try {
            const response = await fetch(jsonUrl, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`${label} लोड नहीं हो सकी (Status: ${response.status})`);
            }

            const data = await response.json();
            const items = Array.isArray(data) ? data : (data.items || data.apps || data.tools || []);

            container.innerHTML = items.map(createCardHTML).join('\n');
        } catch (err) {
            console.error(err);
        }
    }

    // 'open' बटन पर क्लिक करने पर लिंक खोलने का सपोर्ट (यदि JSON में url दिया हो)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.appopenbtn');
        if (!btn) return;

        const card = btn.closest('.appcard');
        const url = btn.getAttribute('data-url') || (card && card.getAttribute('data-url'));

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    });

    // दोनों JSON फाइल्स CDN से लोड करें (अगर किसी फ़ोल्डर में हों तो बीच में फ़ोल्डर का नाम लिखें, जैसे /data/app.json)
    loadCards('https://cdn.jsdelivr.net/gh/assudo/assudo.github.io/pp.json', appContainer, 'pp.json');
    loadCards('https://cdn.jsdelivr.net/gh/assudo/assudo.github.io/ool.json', toolContainer, 'ool.json');
})();



let appbtn = document.querySelector("#appbtn");
let toolbtn = document.querySelector("#toolbtn");
let appbox = document.querySelector("#appcardcontener");
let toolbox = document.querySelector("#toolcardcontener");
let searchbox = document.querySelector("#searchbox");
let currentTabVal = 1;

/*function filterActiveCards() {
  let isToolTab = Number(currentTabVal) === 0;
  let activeBox = isToolTab ? toolbox : appbox;
  if (!activeBox) return;

  let query = (searchbox ? searchbox.value : "").trim().toLowerCase();
  let cards = activeBox.querySelectorAll(".appcardshadwo");

  cards.forEach(function (card) {
    let name = (card.querySelector(".appname")?.textContent || "").toLowerCase();
    let point = (card.querySelector(".apppoint")?.textContent || "").toLowerCase();
    card.style.display = (!query || name.includes(query) || point.includes(query)) ? "" : "none";
  });
}*/
function updateEmptyState(activeBox, visibleCount, query, isToolTab) {
  if (!activeBox) return;

  let emptyBox = activeBox.querySelector(".asgo-empty-state");

  if (visibleCount === 0) {
    if (!emptyBox) {
      emptyBox = document.createElement("div");
      emptyBox.className = "asgo-empty-state";
      activeBox.appendChild(emptyBox);
    }

    const itemType = isToolTab ? "Tool" : "App";
    const safeQuery = query
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    emptyBox.innerHTML = `
      <div class="asgo-empty-icon">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <div class="asgo-empty-title">कोई ${itemType} नहीं मिला!</div>
      <div class="asgo-empty-sub">
        ${
          query
            ? `"<strong>${safeQuery}</strong>" से मेल खाता कोई ${itemType} यहाँ नहीं है। कुछ और लिखकर देखें।`
            : `फ़िलहाल इस सेक्शन में दिखाने के लिए कोई ${itemType} मौजूद नहीं है।`
        }
      </div>
    `;
  } else if (emptyBox) {
    emptyBox.remove();
  }
}

function filterActiveCards() {
  let isToolTab = Number(currentTabVal) === 0;
  let activeBox = isToolTab ? toolbox : appbox;
  if (!activeBox) return;

  let query = (searchbox ? searchbox.value : "").trim().toLowerCase();
  let cards = activeBox.querySelectorAll(".appcardshadwo");
  let visibleCount = 0;

  cards.forEach(function (card) {
    let name = (card.querySelector(".appname")?.textContent || "").toLowerCase();
    let point = (card.querySelector(".apppoint")?.textContent || "").toLowerCase();
    let matches = !query || name.includes(query) || point.includes(query);

    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });

  updateEmptyState(activeBox, visibleCount, query, isToolTab);
}


function tab(v) {
  currentTabVal = (v === undefined) ? 1 : v;
  let vf = Number(currentTabVal);
  if (vf === 0) {
    if (toolbox) toolbox.style.display = "flex";
    if (appbox) appbox.style.display = "none";
    // Tool active (Blue), App inactive (Black)
    if (toolbtn) toolbtn.style.boxShadow = "0px 0px 12px #007bff";
    if (appbtn) appbtn.style.boxShadow = "0px 0px 10px #000000";
  } else {
    if (toolbox) toolbox.style.display = "none";
    if (appbox) appbox.style.display = "flex";
    // App active (Blue), Tool inactive (Black)
    if (appbtn) appbtn.style.boxShadow = "0px 0px 12px #007bff";
    if (toolbtn) toolbtn.style.boxShadow = "0px 0px 10px #000000";
  }
  filterActiveCards();
}

if (searchbox) {
  searchbox.addEventListener("input", filterActiveCards);
  searchbox.addEventListener("search", filterActiveCards);
}

tab(1);











    (function() {
        const mainBox = document.getElementById('asgoMainBox');
        const themeToggle = document.getElementById('asgoThemeToggle');
        const themeIcon = document.getElementById('asgoThemeIcon');
        const themeText = document.getElementById('asgoThemeText');
        const soundToggle = document.getElementById('asgoSoundToggle');
        const soundIcon = document.getElementById('asgoSoundIcon');

        // 1. Theme Apply करने का फंक्शन
        function applyTheme(isDark) {
            themeToggle.checked = isDark;
            if (isDark) {
                mainBox.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                themeText.textContent = 'लाइट मोड (Light Mode)';
            } else {
                mainBox.classList.remove('dark-mode');
                document.body.classList.remove('dark-mode');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                themeText.textContent = 'डार्क मोड (Dark Mode)';
            }
        }

        // 2. Sound Icon Update करने का फंक्शन
        function applySound(isSoundOn) {
            soundToggle.checked = isSoundOn;
            if (isSoundOn) {
                soundIcon.classList.remove('fa-volume-xmark');
                soundIcon.classList.add('fa-volume-high');
            } else {
                soundIcon.classList.remove('fa-volume-high');
                soundIcon.classList.add('fa-volume-xmark');
            }
        }

        // 3. ऐप खुलते ही सेव की गई सेटिंग लोड करें (डिफ़ॉल्ट: Dark Mode ON & Sound ON)
        const savedTheme = localStorage.getItem('asgo_theme');
        const isDarkDefault = savedTheme === null ? true : savedTheme === 'dark';
        applyTheme(isDarkDefault);

        const savedSound = localStorage.getItem('asgo_sound');
        const isSoundDefault = savedSound === null ? true : savedSound === 'on';
        applySound(isSoundDefault);

        // 4. Web Audio API (Global Click Sound)
        let audioCtx = null;

        function playGlobalClickSound() {
            if (!soundToggle || !soundToggle.checked) return;

            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.04);
        }

        // पूरे पेज पर कहीं भी क्लिक करने पर साउंड
        document.addEventListener('pointerdown', playGlobalClickSound);

        // 5. Theme Toggle बदलने पर सेव करें
        themeToggle.addEventListener('change', function() {
            const isDark = this.checked;
            applyTheme(isDark);
            localStorage.setItem('asgo_theme', isDark ? 'dark' : 'light');
        });

        // 6. Sound Toggle बदलने पर सेव करें
        soundToggle.addEventListener('change', function() {
            const isSoundOn = this.checked;
            applySound(isSoundOn);
            localStorage.setItem('asgo_sound', isSoundOn ? 'on' : 'off');
        });
    })();

        // 7. Direct YouTube App Opener (Android & iOS Deep Link)
        const ytBtn = document.getElementById('asgoYoutubeBtn');
        if (ytBtn) {
            ytBtn.addEventListener('click', function(e) {
                const channelUrl = this.getAttribute('data-channel'); // e.g., www.youtube.com/@YourChannelHandle
                const webUrl = 'https://' + channelUrl;
                const userAgent = navigator.userAgent || navigator.vendor || window.opera;

                // Android डिवाइस के लिए सीधे YouTube App खोलें
                if (/android/i.test(userAgent)) {
                    e.preventDefault();
                    window.location.href = `intent://${channelUrl}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent(webUrl)};end;`;
                } 
                // iPhone / iPad (iOS) के लिए सीधे YouTube App खोलें
                else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                    e.preventDefault();
                    window.location.href = `vnd.youtube://${channelUrl}`;
                    setTimeout(function() {
                        window.location.href = webUrl;
                    }, 1500);
                }
                // Laptop/PC पर सामान्य रूप से नए टैब में खुलेगा
            });
        }





const shareBtn = document.getElementById("asgoShareBtn");
const shareMsg = document.getElementById("asgoShareMsg");

function showShareNotice(text) {
  if (!shareMsg) return;
  shareMsg.textContent = text;
  clearTimeout(shareMsg._timer);
  shareMsg._timer = setTimeout(() => {
    shareMsg.textContent = "";
  }, 2500);
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: "asgo.online — Apps & Tools Hub",
      text: "asgo.online — डेवलपर अंगद द्वारा बनाया गया Apps और Tools प्लेटफ़ॉर्म।",
      url: window.location.href || "https://asgo.online/"
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showShareNotice("शेयर हो गया!");
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        showShareNotice("लिंक कॉपी हो गया!");
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = shareData.url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        showShareNotice("लिंक कॉपी हो गया!");
      }
    } catch (err) {
      if (err && err.name !== "AbortError") {
        showShareNotice("शेयर या कॉपी नहीं हो सका");
      }
    }
  });
}




/*PWS web App install patti start */
(function () {
  const installBar = document.getElementById("asgoInstallBar");
  const installBtn = document.getElementById("asgoInstallBtn");
  let deferredPrompt = null;

  // चेक करें कि ऐप पहले से इंस्टॉल होकर standalone मोड में तो नहीं खुला है
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    if (installBar) installBar.style.display = "none";
    return;
  }

  // Service Worker रजिस्टर करें
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((err) => {
        console.error("SW register error:", err);
      });
    });
  }

  // जब ब्राउज़र बताए कि ऐप इंस्टॉल हो सकता है, तब पतली पट्टी दिखाएँ
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBar && !isStandalone) {
      installBar.style.display = "flex";
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice.outcome === "accepted" && installBar) {
        installBar.style.display = "none";
      }
    });
  }

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installBar) {
      installBar.style.display = "none";
    }
  });
})();

/*PWS web App install patti end */