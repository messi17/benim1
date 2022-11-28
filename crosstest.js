var isChrome = !browser;
var browser = browser || chrome;
var config = config || {
    arrayUrlRegex: ['https://itv224218.tmp.tivibu.com.tr:6630/001/2/ch00000090990000001222/manifest.mpd?AuthInfo=NPBUF6VIa7agSl%2BmYNOcFlY2shZ0gsc5S8C3r%2F13LpckmzlxTiyfKvYuYt2BC1Y2UC4B9ynhEDAK%2FlFvro3Wbw%3D%3D&version=v1.0&BreakPoint=0&virtualDomain=001.live_hls.zte.com&programid=ch00000000000000001356&contentid=ch00000000000000001356&videoid=ch00000090990000001273&recommendtype=0&userid=guestpc&boid=001&stbid=Chrome101&terminalflag=4&profilecode=&usersessionid=hxXAV7fyrjyiGccpmeh6320134794606&ctype=4&NeedJITP=1&JITPMediaType=DASH&JITPDRMType=2WYywfPOTiETZ6gzmgSLCw%3D%3D&RateHigh=7000000&RateLow=900000&IASHttpSessionId=RR1611020220622220543286549&ispcode=75'],
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
        console.log(`Add CORS: ${https://itv224218.tmp.tivibu.com.tr:6630/001/2/ch00000090990000001222/manifest.mpd?AuthInfo=NPBUF6VIa7agSl%2BmYNOcFlY2shZ0gsc5S8C3r%2F13LpckmzlxTiyfKvYuYt2BC1Y2UC4B9ynhEDAK%2FlFvro3Wbw%3D%3D&version=v1.0&BreakPoint=0&virtualDomain=001.live_hls.zte.com&programid=ch00000000000000001356&contentid=ch00000000000000001356&videoid=ch00000090990000001273&recommendtype=0&userid=guestpc&boid=001&stbid=Chrome101&terminalflag=4&profilecode=&usersessionid=hxXAV7fyrjyiGccpmeh6320134794606&ctype=4&NeedJITP=1&JITPMediaType=DASH&JITPDRMType=2WYywfPOTiETZ6gzmgSLCw%3D%3D&RateHigh=7000000&RateLow=900000&IASHttpSessionId=RR1611020220622220543286549&ispcode=75}`);
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
