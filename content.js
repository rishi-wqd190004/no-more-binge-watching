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

    chrome.runtime.sendMessage({ type: "updateCount", count: videoCount });

    if (videoCount === 5) {
      showBigAlert("🎯 You've watched 5 videos! Take a break?");
    } else if (videoCount === 7) {
      showBigAlert("🚀 7 videos already! Go do your study!");
    }
  }
}

function showBigAlert(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      } else {
        alert(message); // fallback
      }
    });
  } else {
    alert(message); // fallback
  }
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

console.log("YouTube Binge tracker loaded")