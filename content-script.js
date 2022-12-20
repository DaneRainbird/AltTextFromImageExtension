(() => {

    // Ensure that the script is only run once per tab
    if (window.hasRunContentScriptOnce === true) return;
    window.hasRunContentScriptOnce = true;
    
    // Add a listener for any incoming connections 
    browser.runtime.onConnect.addListener(port => {
        if (port.name !== "portFromBackground") return;

        // Listen for the getElem action
        port.onMessage.addListener(msg => {
            if (msg.action === "getElem") {
                let elem = browser.menus.getTargetElement(msg.targetElementId)
                
                // Copy to clipboard, with fallback for non-HTTPS sites (which don't support the Navigator API)
                if (navigator.clibpard) {
                    navigator.clipboard.writeText(elem.alt);
                } else {
                    let textArea = document.createElement("textarea");
                    textArea.value = elem.alt;

                    // Place out of bounds, and prevent scrolling
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.position = "fixed";

                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    // Try to copy to the clipboard via execCommand
                    try {
                        document.execCommand("copy");
                    } catch (err) {
                        console.error("Unable to copy due to the following error: " + err)
                    }

                    // Remove the textArea
                    document.body.removeChild(textArea)
                }
                
            }
        })
    });
})()