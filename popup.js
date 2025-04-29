function updateCount() {
    chrome.storage.local.get(['videoCount'], (data) => {
      const count = data.videoCount || 0;
      document.getElementById('count').textContent = `Videos watched: ${count}`;
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reset').addEventListener('click', () => {
      chrome.storage.local.set({ videoCount: 0 }, () => {
        updateCount();
      });
    });
  
    updateCount();
  });
  