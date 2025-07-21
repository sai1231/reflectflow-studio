
import type { ChromeMessage } from '@/types';

console.log("ReflectFlow background script loaded.");

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
    // If the message is to toggle recording or element selection, forward it to the active tab's content script
    if (message.type === 'TOGGLE_RECORDING' || message.type === 'TOGGLE_ELEMENT_SELECTOR') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Could not establish connection. The content script may not be injected yet.');
                        // Optionally, you could retry or handle this error.
                    } else {
                        // Handle response from content script if needed
                        console.log('Response from content script:', response);
                    }
                });
            }
        });
    }

    // If the message is to add a step, forward it to the popup UI
    if (message.type === 'ADD_STEP') {
        chrome.runtime.sendMessage(message);
    }

    return true; // Indicates that the response is sent asynchronously
});

// Listen for tab updates (e.g., navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // When a tab completes loading a new page
  if (changeInfo.status === 'complete' && tab.url && tab.active) {
    // Forward a "navigate" step to the popup
    // This is a simplified approach. A more robust solution might check if recording is active.
    const message: ChromeMessage = {
      type: 'ADD_STEP',
      payload: {
        commandKey: 'navigate',
        url: tab.url,
      }
    };
    chrome.runtime.sendMessage(message);
  }
});
