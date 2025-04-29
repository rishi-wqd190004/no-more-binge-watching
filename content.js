let videoCount = 0;
let lastVideoId = '';
let startTime = Date.now();
let elapsedTime = 0;
let timeInterval = null;

// Restore saved count and elapsed time from storage
chrome.storage.local.get(['videoCount', 'elapsedTime'], (data) => {
  videoCount = data.videoCount || 0;
  elapsedTime = data.elapsedTime || 0;

  // Restore timer if needed
  startTime = Date.now() - (elapsedTime * 1000);
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
  chrome.storage.local.set({
    videoCount: Number(videoCount),
    elapsedTime: Number(elapsedTime),
    lastVideoId: String(lastVideoId)
  });
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

    // Start timer if it hasn’t already
    if (!timeInterval) {
      startTime = Date.now() - (elapsedTime * 1000);
      startTimer();
    }

    // Alert thresholds
    if (videoCount === 2) {
      showBigAlert("🎯 You've watched 2 videos! Take a break?");
    } else if (videoCount === 5) {
      showBigAlert("🚀 5 videos already! Go do your study!");
    }
  }
}

// Display alert with actions
function showBigAlert(message) {
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

  const keepBtn = document.createElement("button");
  keepBtn.textContent = "Keep Watching";
  keepBtn.style.padding = "8px 16px";
  keepBtn.style.border = "none";
  keepBtn.style.borderRadius = "6px";
  keepBtn.style.background = "#28a745";
  keepBtn.style.color = "#fff";
  keepBtn.style.cursor = "pointer";
  keepBtn.onclick = () => modal.remove();

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

  buttons.appendChild(keepBtn);
  buttons.appendChild(closeBtn);
  box.appendChild(text);
  box.appendChild(buttons);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

// Watch for SPA navigation changes on YouTube
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkVideoChange();
  }
}).observe(document, { subtree: true, childList: true });

// Initial load
checkVideoChange();
console.log("YouTube Binge Tracker loaded");
