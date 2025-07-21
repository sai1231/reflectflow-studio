
console.log("ReflectFlow content script loaded.");

// This is where you will add logic to listen to DOM events on the web page.
// For example, listening for clicks and sending them to the background script.

document.body.addEventListener('click', (event) => {
    console.log('Clicked on page:', event.target);

    // In a real scenario, you would generate a selector for event.target
    // and send a message to the popup or background script.
    // chrome.runtime.sendMessage({ type: "RECORD_CLICK", selector: "your_selector_here" });
});
