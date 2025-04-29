let videoCount = 0;
let lastVideoId = '';

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
      // Retry after a short delay until body exists
      setTimeout(addCounterToPage, 100);
    }
}
addCounterToPage();

function updateCounterDisplay() {
  counterDiv.innerText = `Videos watched: ${videoCount}`;
}

function getVideoIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

function checkVideoChange() {
  const currentVideoId = getVideoIdFromUrl();
  if (currentVideoId && currentVideoId !== lastVideoId) {
    lastVideoId = currentVideoId;
    videoCount++;
    updateCounterDisplay();
    console.log(`[Binge Tracker] Videos watched: ${videoCount}`);

    // Save updated video count to chrome.storage.local
    chrome.storage.local.set({ videoCount: videoCount });

    if (videoCount === 2) {
      showBigAlert("🎯 You've watched 2 videos! Take a break?");
    } else if (videoCount === 5) {
      showBigAlert("🚀 5 videos already! Go do your study!");
    }
  }
}

function showBigAlert(message) {
    // Remove existing modal if any
    const existing = document.getElementById("binge-tracker-modal");
    if (existing) existing.remove();
  
    // Create modal overlay
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
  
    // Modal content box
    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "24px 32px";
    box.style.borderRadius = "10px";
    box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    box.style.maxWidth = "400px";
    box.style.textAlign = "center";
    box.style.fontFamily = "sans-serif";
  
    // Message text
    const text = document.createElement("p");
    text.textContent = message;
    text.style.marginBottom = "20px";
    text.style.fontSize = "18px";
    text.style.lineHeight = "1.4";
  
    // Buttons container
    const buttons = document.createElement("div");
    buttons.style.display = "flex";
    buttons.style.justifyContent = "center";
    buttons.style.gap = "12px";
  
    // Keep Watching Button
    const keepBtn = document.createElement("button");
    keepBtn.textContent = "Keep Watching";
    keepBtn.style.padding = "8px 16px";
    keepBtn.style.border = "none";
    keepBtn.style.borderRadius = "6px";
    keepBtn.style.background = "#28a745";
    keepBtn.style.color = "#fff";
    keepBtn.style.cursor = "pointer";
    keepBtn.onclick = () => modal.remove();
  
    // Close Tab Button
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
  
    // Append everything
    buttons.appendChild(keepBtn);
    buttons.appendChild(closeBtn);
    box.appendChild(text);
    box.appendChild(buttons);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

// Listen to URL changes because YouTube is a SPA (single-page app)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkVideoChange();
  }
}).observe(document, { subtree: true, childList: true });

checkVideoChange(); // Check initial video
console.log("YouTube Binge tracker loaded");
