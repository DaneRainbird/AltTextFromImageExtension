// Set up a context menu item on all images
browser.menus.create({
    id: "copy-alt-to-clipboard",
    title: "Copy alt-text to clipboard",
    contexts: ["image"]
})

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