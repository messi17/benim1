var isChrome = !browser;
var browser = browser || chrome;
var config = config || {
    arrayUrlRegex: ['https://itv224218.tmp.tivibu.com.tr:6630'],
    isEnable: true
};
var blackListPattern = ['/.*youtube.com.*/', '/.*googlevideo.com.*/'];

// function createPopup(){
//  var popupPath = browser.extension.getURL("popup/panel.html");
//   console.log(popupPath);
//  browser.browserAction.setPopup({
//    popup: popupPath
//  });
// }

function setButtonIcon(isEnable) {
    var prefix = isEnable ? 'enable' : 'disable';
    var settingIcon = browser.browserAction.setIcon({
        path: {
            "16": "icons/" + prefix + "-16.png",
            "32": "icons/" + prefix + "-32.png",
            "64": "icons/" + prefix + "-64.png"
        }
    });
}

function onBtnClicked() {
    console.log('on onClicked - bgs');
}

function onStorageChanged(changes, areaName) {
    config = changes.config.newValue;
    setButtonIcon(config.isEnable);
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function initialize() {
    console.log(browser);
    console.log('isChrome: ' + isChrome);
    if (isChrome) {
        browser.storage.local.get('config', (results) => {
            loadConfig(results);
        });
    } else {
        var storageSetting = browser.storage.local.get('config');
        storageSetting.then((results) => {
            loadConfig(results);
        }, onError);
    }
}

function loadConfig(results) {
    if (results.config) {
        config = results.config;
    }
    setButtonIcon(config.isEnable);
}

function checkUrl(arrayUrlRegex, currentUrl) {
    for (var i = 0; i < arrayUrlRegex.length; i++) {
        var pattern = arrayUrlRegex[i];
        var parts = pattern.split('/'),
            regex = pattern,
            options = "";
        if (parts.length > 1) {
            regex = parts[1];
            options = parts[2];
        }
        var patt = new RegExp(regex, options);
        if (patt.test(currentUrl)) {
            return true;
        }
    };
    return false;
}

function onHeadersReceived(e) {
    let url = e.url;
    if (config.isEnable && !checkUrl(blackListPattern, url) && checkUrl(config.arrayUrlRegex, url)) {
        console.log(`Add CORS: ${url}`);
        let crossDomainHeaders = [{
                name: "access-control-allow-origin",
                value: "*"
            },
            {
                name: "access-control-allow-methods",
                value: "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS"
            },
            {
                name: "access-control-allow-headers",
                value: "*"
            },
            {
                name: "access-control-expose-headers",
                value: "*"
            }
        ];
        addOrReplaceHeader(e.responseHeaders, crossDomainHeaders);
    }
    return {
        responseHeaders: e.responseHeaders
    };
};

function addOrReplaceHeader(responseHeaders, newHeaders) {
    newHeaders.forEach(function(header) {
        let headerPosition = responseHeaders.findIndex(x => x.name.toLowerCase() === header.name.toLowerCase());
        if (headerPosition > -1) {
            responseHeaders[headerPosition] = header;
        } else {
            responseHeaders.push(header);
        }
    }, this);
};

browser.browserAction.onClicked.addListener(onBtnClicked);
browser.storage.onChanged.addListener(onStorageChanged)
var extraInfoSpec = ["blocking", "responseHeaders"]
if (isChrome) {
    extraInfoSpec = ["blocking", "responseHeaders", "extraHeaders"]
}
browser.webRequest.onHeadersReceived.addListener(
    onHeadersReceived, {
        urls: ['<all_urls>']
    },
    extraInfoSpec
);

initialize();
Source code and support at 
