// Inject the content script into the current tab whenever a new tab is opened, refreshed, or navigated to
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        browser.tabs.executeScript(tabId, {
            file: "content-script.js"
        })
    }
})

// Listen for messages from the content script
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "createContextMenu") {
        // Set up a context menu item on the image
        browser.menus.create({
            id: "copy-alt-to-clipboard",
            title: "Copy alt-text to clipboard",
            contexts: ["image"]
        })
        // Refresh the context menu to ensure the item is displayed
        browser.menus.refresh();
    }
})

// Listen for the context menu item being closed
browser.menus.onHidden.addListener(() => {
    // Remove the context menu item
    browser.menus.remove("copy-alt-to-clipboard")
})

// Listen for the context menu item being clicked
browser.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "copy-alt-to-clipboard") {

        // Insert content-script.js for foreground actions
        await browser.tabs.executeScript(tab.id, {
            file: "content-script.js"
        })

        // Set up the port for connections between background and foreground 
        let port = browser.tabs.connect(tab.id, {
            name: "portFromBackground"
        })

        // Simple Disconnect Handler to alert the user to the port being closed  
        port.onDisconnect.addListener(() => {
            console.error("The port to the page was closed.")
        })

        // Post a message to the content script with the menu item's element target ID
        port.postMessage({
            action: "getElem",
            targetElementId: info.targetElementId
        })
    }
})