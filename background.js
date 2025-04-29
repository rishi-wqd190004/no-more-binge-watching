chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateCount") {
      chrome.storage.local.set({ videoCount: message.count });
    }
  });
  