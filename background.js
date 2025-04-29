chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "updateCount") {
      chrome.storage.local.set({ videoCount: message.count });
    }
  
    if (message.type === "closeTabRequest" && sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  });
  