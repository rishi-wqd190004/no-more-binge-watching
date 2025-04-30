function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  }
  
  function updateCount() {
    chrome.storage.local.get(['videoCount', 'elapsedTime'], (data) => {
      const count = data.videoCount || 0;
      const elapsed = data.elapsedTime || 0;
      document.getElementById('count').textContent = `Videos watched: ${count}`;
      document.getElementById('time').textContent = `Time spent: ${formatTime(elapsed)}`;
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // Reset button handler
    document.getElementById('reset').addEventListener('click', () => {
      const today = new Date().toDateString();
      chrome.storage.local.set({
        videoCount: 0,
        elapsedTime: 0,
        lastResetDate: today
      }, () => {
        updateCount();
      });
    });
  
    // Initial count display
    updateCount();
  });
  