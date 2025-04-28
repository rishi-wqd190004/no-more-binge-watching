let videoCount = 0;
let lastVideoId = '';

function getVideoIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

function checkVideoChange() {
  const currentVideoId = getVideoIdFromUrl();
  if (currentVideoId && currentVideoId !== lastVideoId) {
    lastVideoId = currentVideoId;
    videoCount++;
    console.log(`[Binge Tracker] Videos watched: ${videoCount}`);
    chrome.storage.local.set({ videoCount: videoCount });

    if (videoCount === 5) {
      showBigAlert("🎯 You've watched 5 videos! Take a break?");
    } else if (videoCount === 10) {
      showBigAlert("🚀 10 videos already! Time to touch some grass?");
    }
  }
}

// Function to show nice notification
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

// Monitor for URL changes (because YouTube is a single-page app)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkVideoChange();
  }
}).observe(document, { subtree: true, childList: true });

checkVideoChange(); // initial load
