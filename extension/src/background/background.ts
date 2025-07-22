import type { ChromeMessage } from '@/types';

// Store the state of recording and element selector
let isRecording = false;
let isElementSelectorActive = false;
let activeTabId: number | undefined = undefined;

// Function to send state to a specific tab
function sendStateToTab(tabId: number) {
  const message: ChromeMessage = {
    type: 'STATE_UPDATE',
    payload: { isRecording, isElementSelectorActive },
  };
  chrome.tabs.sendMessage(tabId, message, () => {
    if (chrome.runtime.lastError) {
      // This can happen if the content script is not yet injected
      // console.log(`Could not send state to tab ${tabId}: ${chrome.runtime.lastError.message}`);
    }
  });
}

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_RECORDING':
      isRecording = message.payload.isRecording;
      if (activeTabId) sendStateToTab(activeTabId);
      break;

    case 'TOGGLE_ELEMENT_SELECTOR':
      isElementSelectorActive = message.payload.isActive;
      if (activeTabId) sendStateToTab(activeTabId);
      break;

    case 'GET_STATE':
      sendResponse({ isRecording, isElementSelectorActive });
      break;

    case 'ADD_STEP':
      // Forward the step to the active tab's UI panel
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, message);
      }
      break;
    
    case 'TOGGLE_OVERLAY':
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'TOGGLE_OVERLAY' });
      }
      break;
  }
  return true; // Indicates asynchronous response
});

// Update the active tab when the user switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
  // When a new tab becomes active, send it the current recording state
  if (activeTabId) {
    sendStateToTab(activeTabId);
  }
});

// Handle page navigations
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete' && tab.url && isRecording) {
      const navigateStep: ChromeMessage = {
          type: 'ADD_STEP',
          payload: {
              commandKey: 'navigate',
              url: tab.url,
          }
      };
      chrome.tabs.sendMessage(tabId, navigateStep);
  }
});

// When the extension icon is clicked, inject a script to toggle the overlay
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // This function is executed in the content script's context
        // We send a message to our own content script to toggle the UI
        chrome.runtime.sendMessage({ type: 'TOGGLE_OVERLAY' });
      }
    }).catch(err => console.error("Failed to execute script: ", err));
  }
});
