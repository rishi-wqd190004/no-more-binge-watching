chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "updateCount") {
      chrome.storage.local.set({ videoCount: message.count });
    }
  
    if (message.type === "closeTabRequest") {
      if (sender.tab?.id) {
        chrome.tabs.remove(sender.tab.id);
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) chrome.tabs.remove(tabs[0].id);
        });
      }
    }
  });
  