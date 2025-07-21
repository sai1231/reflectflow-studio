
console.log("ReflectFlow background script loaded.");

// This script runs in the background.
// It can listen for messages from content scripts or the popup,
// manage state, and interact with chrome APIs.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background:", message);
    
    // Example: Forward message to popup or handle logic here
    // if (message.type === "RECORD_CLICK") {
    //   // Add logic to save the step
    // }

    // It's good practice to return true if you intend to send a response asynchronously
    return true; 
});
