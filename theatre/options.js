var config = {
    "themes": {
        "number": 3
    },
    "fill": function() {
        var whitelist = document.getElementById("whitelist");
        chrome.storage.local.get({
            "whitelist": [],
            "state": "light"
        }, function(e) {
            whitelist.value = e.whitelist.join(", ");
        });
    },
    "restore": function() {
        var tmp = {};
        for (var i = 1; i <= config.themes.number; i++) tmp["theater_" + i] = false;
        tmp["theater_1"] = true;
        /*  */
        chrome.storage.local.get(tmp, function(e) {
            for (var i = 1; i <= config.themes.number; i++) {
                var theater = document.getElementById("theater_" + i);
                theater.checked = e["theater_" + i];
            }
        });
        /*  */
        document.removeEventListener("DOMContentLoaded", config.restore, false);
    },
    "hostname": function(url) {
        url = url.replace("www.", '');
        var s = url.indexOf("//") + 2;
        if (s > 1) {
            var o = url.indexOf('/', s);
            if (o > 0) return url.substring(s, o);
            else {
                o = url.indexOf('?', s);
                if (o > 0) return url.substring(s, o);
                else return url.substring(s);
            }
        } else return url;
    },
    "handle": function() {
        var id = this.id,
            checked = this.checked;
        if (id.indexOf("theater_") !== -1) {
            for (var i = 1; i <= config.themes.number; i++) {
                var theater = document.getElementById("theater_" + i);
                theater.checked = false;
            }
            /*  */
            document.getElementById(id)
                .checked = checked;
        }
        /*  */
        var tmp = {};
        for (var i = 1; i <= config.themes.number; i++) {
            var theater = document.getElementById("theater_" + i);
            tmp["theater_" + i] = theater.checked;
        }
        /*  */
        chrome.storage.local.set(tmp, function() {});
    }
};
var load = function() {
    for (var i = 1; i <= config.themes.number; i++) {
        var theater = document.getElementById("theater_" + i);
        theater.addEventListener("click", config.handle);
    }
    /*  */
    var whitelist = document.getElementById("whitelist");
    whitelist.addEventListener("change", function() {
        var tmp = [];
        var value = whitelist.value || '';
        var hosts = value.split(/\s*\,\s*/);
        for (var i = 0; i < hosts.length; i++) tmp.push(config.hostname(hosts[i]));
        tmp = tmp.filter(function(element, index, array) {
            return element && array.indexOf(element) === index
        });
        chrome.storage.local.set({
            "whitelist": tmp
        }, function() {});
    });
    /*  */
    config.fill();
    window.removeEventListener("load", load, false);
};
window.addEventListener("load", load, false);
chrome.storage.onChanged.addListener(config.fill);
document.addEventListener("DOMContentLoaded", config.restore, false);
