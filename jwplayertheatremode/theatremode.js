window.addEventListener("load", function () {
    var scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL('embed.js');
    scriptElement.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(scriptElement);
});
