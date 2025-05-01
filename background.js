chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateCount") {
      chrome.storage.local.set({ videoCount: message.count });
    }
  
    if (message.type === "closeTabRequest") {
      if (message.type === "closeTabRequest" && sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) chrome.tabs.remove(tabs[0].id);
        });
      }
    }
  });
  
  // Open popup.html in a new tab when the extension icon is clicked
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
  });
  