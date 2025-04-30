let videoCount = 0;
let lastVideoId = '';
let startTime = Date.now();
let elapsedTime = 0;
let timeInterval = null;

chrome.storage.local.get(['videoCount', 'elapsedTime', 'lastResetDate'], (data) => {
    const today = new Date().toDateString();
  
    if (data.lastResetDate !== today) {
      // First visit today or new day — reset everything
      videoCount = 0;
      elapsedTime = 0;
      startTime = Date.now();
      chrome.storage.local.set({
        videoCount: 0,
        elapsedTime: 0,
        lastResetDate: today
      });
    } else {
      videoCount = data.videoCount || 0;
      elapsedTime = data.elapsedTime || 0;
      startTime = Date.now() - (elapsedTime * 1000);
    }
  
    startTimer();
    updateCounterDisplay();
  });
  

// Create a visible counter on the YouTube page
const counterDiv = document.createElement('div');
counterDiv.style.position = 'fixed';
counterDiv.style.bottom = '20px';
counterDiv.style.right = '20px';
counterDiv.style.background = 'rgba(0, 0, 0, 0.7)';
counterDiv.style.color = 'white';
counterDiv.style.padding = '10px 15px';
counterDiv.style.fontSize = '16px';
counterDiv.style.borderRadius = '10px';
counterDiv.style.zIndex = '9999';
counterDiv.style.fontFamily = 'sans-serif';
counterDiv.innerText = 'Videos watched: 0';

const resetBtn = document.createElement('button');
resetBtn.textContent = 'Reset Stats';
resetBtn.style.marginTop = '8px';
resetBtn.style.marginLeft = '10px';
resetBtn.style.padding = '6px 10px';
resetBtn.style.border = 'none';
resetBtn.style.borderRadius = '6px';
resetBtn.style.background = '#007bff';
resetBtn.style.color = 'white';
resetBtn.style.cursor = 'pointer';
resetBtn.style.fontSize = '14px';
resetBtn.onclick = resetStats;

counterDiv.appendChild(document.createElement('br'));
counterDiv.appendChild(resetBtn);


function addCounterToPage() {
  if (document.body) {
    document.body.appendChild(counterDiv);
  } else {
    setTimeout(addCounterToPage, 100);
  }
}
addCounterToPage();

// Format seconds to HH:MM:SS
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hrs, mins, secs].map(n => n.toString().padStart(2, '0')).join(':');
}

// Update counter display and persist to storage
function updateCounterDisplay() {
  counterDiv.innerText = `Videos watched: ${videoCount}\nTime spent: ${formatTime(elapsedTime)}`;

  // Also update localStorage for backup
  localStorage.setItem('videoCount', videoCount);
  localStorage.setItem('elapsedTime', elapsedTime);
  localStorage.setItem('lastVideoId', lastVideoId);

  if (chrome.runtime && chrome.runtime.id) {
    chrome.storage.local.set({
      videoCount: Number(videoCount),
      elapsedTime: Number(elapsedTime),
      lastVideoId: String(lastVideoId)
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Storage error:', chrome.runtime.lastError.message);
      }
    });
  }
}

// Start timer interval
function startTimer() {
  if (!timeInterval) {
    timeInterval = setInterval(() => {
      elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      updateCounterDisplay();
    }, 1000);
  }
}

// Extract YouTube video ID from URL
function getVideoIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Detect video change and increment count
function checkVideoChange() {
  const currentVideoId = getVideoIdFromUrl();
  if (currentVideoId && currentVideoId !== lastVideoId) {
    lastVideoId = currentVideoId;
    videoCount++;
    updateCounterDisplay();
    console.log(`[Binge Tracker] Videos watched: ${videoCount}`);

    if (!timeInterval) {
      startTime = Date.now() - (elapsedTime * 1000);
      startTimer();
    }

    // Use a Map to define alerts at specific thresholds
    const alertMessages = new Map([
      [2, "🎯 You've watched 2 videos! Take a break?"],
      [5, "🚀 5 videos already! Go do your study!"],
      [7, "😒 7 videos already! Get on with other stuffs!"],
      [9, "💁 9 videos already! Get on with your other work dude!"],
      [11, "😒 11 videos already! Thats too much, go check who built this!"]
    ]);

    if (alertMessages.has(videoCount)) {
      showBigAlert(alertMessages.get(videoCount));
    } else if (videoCount > 12) {
        showBigAlert("🛑 You've gone too far! This tab needs to close now.", true);
    }
  }
}

// Display alert with actions
function showBigAlert(message, forceCloseOnly = false) {
    const existing = document.getElementById("binge-tracker-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "binge-tracker-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    modal.style.zIndex = "99999";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "24px 32px";
    box.style.borderRadius = "10px";
    box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    box.style.maxWidth = "400px";
    box.style.textAlign = "center";
    box.style.fontFamily = "sans-serif";

    const text = document.createElement("p");
    text.textContent = message;
    text.style.marginBottom = "20px";
    text.style.fontSize = "18px";
    text.style.lineHeight = "1.4";

    const buttons = document.createElement("div");
    buttons.style.display = "flex";
    buttons.style.justifyContent = "center";
    buttons.style.gap = "12px";

    if (!forceCloseOnly) {
        const keepBtn = document.createElement("button");
        keepBtn.textContent = "Keep Watching";
        keepBtn.style.padding = "8px 16px";
        keepBtn.style.border = "none";
        keepBtn.style.borderRadius = "6px";
        keepBtn.style.background = "#28a745";
        keepBtn.style.color = "#fff";
        keepBtn.style.cursor = "pointer";
        keepBtn.onclick = () => modal.remove();
        buttons.appendChild(keepBtn);
    }

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close YouTube Tab";
    closeBtn.style.padding = "8px 16px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "6px";
    closeBtn.style.background = "#dc3545";
    closeBtn.style.color = "#fff";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => {
        chrome.runtime.sendMessage({ type: "closeTabRequest" });
    };

    buttons.appendChild(closeBtn);
    box.appendChild(text);
    box.appendChild(buttons);
    modal.appendChild(box);
    document.body.appendChild(modal);
}
  
function resetStats() {
    videoCount = 0;
    elapsedTime = 0;
    startTime = Date.now();
    chrome.storage.local.set({
      videoCount: 0,
      elapsedTime: 0,
      lastVideoId: '',
      lastResetDate: new Date().toDateString()
    }, () => {
      updateCounterDisplay();
      alert("Stats reset for today.");
    });
  }
  

// Detect YouTube navigation (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkVideoChange();
  }
}).observe(document, { subtree: true, childList: true });

// Listen for updates from other tabs
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.videoCount) videoCount = changes.videoCount.newValue;
    if (changes.elapsedTime) elapsedTime = changes.elapsedTime.newValue;
    if (changes.lastVideoId) lastVideoId = changes.lastVideoId.newValue;

    updateCounterDisplay();
  }
});

// Initial video check
checkVideoChange();
console.log("YouTube Binge Tracker loaded (multi-tab)");
