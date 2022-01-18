var followMeStartAt;
var BitmovinPlayer = function () {
    // var urlLicenseWidevineErstream = "https://castleblack.digiturk.com.tr/api/widevine/license?version=1.0";
    var urlLicenseWidevineErstream = "";
    var urlLicensePlayreadyErstream = "https://digiturk-drm.ercdn.com/playready/rightsmanager.asmx?op=AcquireLicense";
    var urlLicenseFairplayErstream = "https://castleblack.digiturk.com.tr/api/fairplay/license?version=#version#";
    var urlLicenseWidevineCastleblack = "https://castleblack.digiturk.com.tr/api/widevine/license?version=#version#";
    var urlLicensePlayreadyCastleblack = "https://castleblack.digiturk.com.tr/api/playready/license?version=#version#";
    var urlLicenseFairplayCastleblack = "https://castleblack.digiturk.com.tr/api/fairplay/license?version=#version#";
    var urlLicenseWidevine = "";
    var urlLicensePlayready = "";
    var urlLicenseFairplay = "";
    var certificateUrl = "https://castleblack.digiturk.com.tr/api/fairplay/certificate?version=#version#";
    var intervalFollowMe = null;
    var isPaused = false;

    var elapsed = 0;
    var stateAudio = { None: 0, FirstChange: 1, Changed: 2 };
    var stateSeek = { None: 0, FirstSeek: 1, Seeked: 2 };
    var statePlay = { None: 0, FirstPlay: 1, Played: 2 };

    var stateForAudio = stateAudio.None;
    var stateForSeek = stateSeek.None;
    var stateForPlay = statePlay.None;

    var manifestHelper = {
        getManifest: function (url, player, config, configModel, callback) {
            var xhr = new XMLHttpRequest();

            url = url.replace("action=redirect", "action=csv");
            url = url.replace("action=asx", "action=csv");

            xhr.open("GET", url, true);
            xhr.timeout = 0;
            xhr.withCredentials = false;

            xhr.onload = function (event) {

                var target = event.target;

                if (target.status >= 200 && target.status <= 299) {

                    if (callback != "undefined" && callback != null) {
                        var response = { data: target.response };
                        if (location.protocol.indexOf("https") > -1) {
                            response.data = response.data.replace(/http:/g, "https:");
                        }
                        callback(response, player, config, configModel);
                    }
                }
            };

            xhr.onerror = function (event) {

            };

            xhr.ontimeout = function (event) {

            };

            xhr.send();
        }
    };

    var self = this;

    self.licenseType = { NONE: 0, CASTLEBLACK: 1, ERSTREAM: 2 };

    self.language = { tr: "Türkçe", en: "İngilizce", org: "Orjinal" };

    self.streamType = { NONE: 0, DASH: 1, SmoothStream: 2, HLS: 3, MP4: 4 };

    self.drmType = { None: 0, Widevine: 1, Playready: 2, Fairplay: 3 };

    self.assetType = { NONE: 0, DUB: 1, ORG: 2 };

    self.configModel = {
        player: {
            key: "",
            container: "",
            width: 640,
            height: 640,
            autoplay: false,
            showvideoquality: false,
            showaudioquality: false,
            showspeed: false,
            muted: false
        },
        source: {
            streamType: self.streamType.DASH,
            file: "",
            title: "",
            description: "",
            poster: "",
            assetType: self.assetType.NONE,
            drm: {
                version: "1.0",
                licensetype: "",
                widevineLicenseServer: "",
                playreadyLicenseServer: "",
                fairplayLicenseServer: "",
                withCredentials: false,
                maxLicenseRequestRetries: 10,
                licenseRequestRetryDelay: 1000,
                contentId: "",
                token: "",
                ticket: "",
                drmType: self.drmType.Widevine
            }
        },
        tracking: {
            interval: 120,
            trackingUrl: "",
            startAt: 0
        },
        events: {
            onPlay: function (data) {

            },
            onError: function (data) {

            },
            onReady: function (data) {

            },
            onStop: function (data) {

            },
            onPaused: function (data) {

            },
            onSeek: function (data) {

            },
            onSeeked: function (data) {

            },
            onStartBuffering: function (data) {

            },
            onStopBuffering: function (data) {

            },
            onFinished: function (data) {

            },
            onTimeShifted: function (data) {

            },
            onTimeShift: function (data) {

            },
            onSourceLoaded: function (data) {

            }
        }
    }
    followMeStartAt = 0;
    self.Setup = function (configModel, isDrm) {

        if (configModel == null)
            configModel = self.configModel;
        else
            self.configModel = configModel;

        if (configModel.tracking)
            followMeStartAt = configModel.tracking.startAt;

        validationConfig(configModel);

        var isSecure = location.protocol.indexOf("https") > -1;

        var newUrl = parseUri(configModel.source.file);
        newUrl.protocol = location.protocol;

        if (isSecure) {
            if (!newUrl.search) {
                newUrl.search += "?secure=1";
            } else {
                newUrl.search += "&secure=1";
            }
        }

        configModel.source.file = newUrl.source;

        /* Proxy Url*/
        var proxyUrl = parseUri(urlLicenseWidevineErstream);
        proxyUrl.protocol = location.protocol;

        urlLicenseWidevineErstream = proxyUrl.source;

        if (isDrm == undefined)
            isDrm = configModel.source.drm != null && configModel.source.drm != undefined;

        var source = {
            dash: "",
            hls: "",
            progressive: "",
            title: configModel.source.title,
            description: configModel.source.description,
            poster: configModel.source.poster
        }

        var labeling = {
            subtitles: function (subtitle) {
                return self.language[subtitle.lang];
            },
            tracks: function (track) {
                return self.language[track.lang];
            }
        };

        prepareSourceAndLabeling(configModel, source, labeling);

        if (isDrm) {
            prepareLicenseUrl(configModel);
            if (configModel.source.drm.ticket.indexOf("ticket=") > 0)
                configModel.source.drm.ticket = configModel.source.drm.ticket.replace("ticket=", "");

            var headers = prepareHeaders(configModel);

            var drm = prepareDrm(configModel, headers);

            source.drm = drm;
        }
        var player = bitmovin.player(configModel.player.container);
        self.player = player;
        var config = {
            key: configModel.player.key,
            events: {
                onReady: function (data) {
                    prepareUi(configModel);
                    if (configModel.events.onReady != null)
                        configModel.events.onReady(data);
                },
                onPlay: function (data) {
                    if (self.player.isLive()) {
                        $(".bmpui-ui-playbacktimelabel-live").html("CANLI");
                        $(".bmpui-ui-playbacktimelabel-live-edge").html("CANLI");
                    }

                    if (configModel.tracking != null) {
                        var millisecondsToWait = configModel.tracking.interval * 1000;
                        intervalFollowMe = setInterval(function () {
                            followMe(configModel.tracking.trackingUrl, player.getDuration(), player.getCurrentTime());
                        }, millisecondsToWait);


                        if (followMeStartAt > 0) {
                            setTimeout(function () {
                                player.seek(followMeStartAt);
                                followMeStartAt = 0;
                            }, 200);
                        }
                    }

                    if (configModel.events.onPlay != null)
                        configModel.events.onPlay(data);
                },
                onError: function (data) {
                    if (configModel.events.onError != null)
                        configModel.events.onError(data);
                }
            },
            playback: {
                autoplay: configModel.player.autoplay,
                muted: configModel.player.muted
            },
            style: {
                width: configModel.player.width,
                height: configModel.player.height,
                bufferingOverlay: false
            },
            source: source
        };

        if (!player.isSetup()) {
            player.addEventHandler("onPaused", function (data) {
                clearInterval(intervalFollowMe);
                isPaused = true;
                if (configModel.events.onPaused != null)
                    configModel.events.onPaused(data);
            });

            player.addEventHandler("onSeek", function (data) {
                if (stateForSeek == stateSeek.None)
                    stateForSeek = stateSeek.FirstSeek;

                elapsed = data.seekTarget;

                if (configModel.events.onSeek != null)
                    configModel.events.onSeek(data);
            });

            player.addEventHandler("onSeeked", function (data) {
                if (configModel.events.onSeeked != null)
                    configModel.events.onSeeked(data);
            });

            player.addEventHandler("onStallStarted", function (data) {
                if (configModel.events.onStartBuffering != null)
                    configModel.events.onStartBuffering(data);
            });

            player.addEventHandler("onStallEnded", function (data) {
                if (stateForAudio == stateAudio.FirstChange && stateForSeek != stateSeek.Seeked) {
                    player.seek(elapsed);
                    stateForSeek = stateSeek.Seeked;
                    stateForAudio = stateAudio.Changed;
                }

                data.bufferLength = player.getVideoBufferLength();
                if (configModel.events.onStopBuffering != null)
                    configModel.events.onStopBuffering(data);
            });

            player.addEventHandler("onPlaybackFinished", function (data) {
                clearInterval(intervalFollowMe);
                if (configModel.events.onFinished != null)
                    configModel.events.onFinished(data);
            });

            player.addEventHandler("onTimeShifted", function (data) {
                if (configModel.events.onTimeShifted != null)
                    configModel.events.onTimeShifted(data);
            });

            player.addEventHandler("onTimeShift", function (data) {
                if (configModel.events.onTimeShift != null)
                    configModel.events.onTimeShift(data);
            });

            player.addEventHandler("onSourceLoaded", function (data) {
                if (configModel.events.onSourceLoaded != null)
                    configModel.events.onSourceLoaded(data);
            });

            player.addEventHandler("onAudioChanged", function (data) {
                elapsed = data.time;

                if (stateForAudio == stateAudio.None)
                    stateForAudio = stateAudio.FirstChange;

                if (stateForAudio == stateAudio.FirstChange || stateForSeek == stateSeek.FirstSeek) {
                    setTimeout(function () {
                        player.seek(elapsed);
                        stateForSeek = stateSeek.Seeked;
                    }, 200);
                }

                if (configModel.events.onAudioChanged != null)
                    configModel.events.onAudioChanged(data);

            });
        }


        if (configModel.source.file.indexOf("switch=castup") > -1) {
            manifestHelper.getManifest(configModel.source.file, player, config, configModel, urlCallBack);
        }
        else {

            if (configModel.source.drm != null && configModel.source.drm.drmType == self.drmType.Fairplay) {
                setupPlayerWithContentIdHeader(config, player);
            } else {
                if (player.isSetup()) {
                    player.load(config.source);
                } else {
                    player.setup(config);
                }
            }
        }
    }

    function followMe(url, duration, elapsed) {
        duration = parseInt(duration);
        elapsed = parseInt(elapsed);
        if (url != "") {
            url = url.replace("{total}", duration).replace("{current}", elapsed);
            $.get(url, function (data) {
                console.log("finished.");
            });
        }
        else
            console.log("followMe url is empty.");
    }

    function urlCallBack(response, player, config, configModel) {
        if (config.source.dash != "" && config.source.dash != undefined)
            config.source.dash = response.data.split(";")[0];
        if (config.source.hls != "" && config.source.hls != undefined)
            config.source.hls = response.data.split(";")[0];
        if (config.source.progressive != "" && config.source.progressive != undefined)
            config.source.progressive = response.data.split(";")[0];

        if (configModel.source.drm != null && configModel.source.drm.drmType == self.drmType.Fairplay) {
            setupPlayerWithContentIdHeader(config, player);
        }
        else {
            if (player.isSetup()) {
                player.load(config.source);
            } else {
                player.setup(config);
            }
        }
    }

    function setupPlayerWithContentIdHeader(config, player) {
        $.get(config.source.hls, function (response) {

            var searchedWord = "skd://";
            var skdIndexOf = response.indexOf(searchedWord) + searchedWord.length;
            var endofSkd = response.indexOf('"', skdIndexOf);
            var assetId = response.substring(skdIndexOf, endofSkd);

            var header = { name: "X-CB-ContentId", value: assetId };
            config.source.drm.fairplay.headers.push(header);

            if (player.isSetup()) {
                player.load(config.source);
            } else {
                player.setup(config);
            }
        });
    }

    function prepareUi(model) {
        var controlItems = $(".bmpui-ui-settings-panel-item");

        var videoQuality = controlItems[0];
        var speed = controlItems[1];
        var track = controlItems[2];
        var audioQuality = controlItems[3];
        var subtitle = controlItems[4];
        var logo = $(".bmpui-ui-watermark");

        if (track != null)
            $(track).find("span").html("Ses");

        if (subtitle != null)
            $(subtitle).find("span").html("Altyazı");

        if (audioQuality != null) {
            $(audioQuality).find("span").html("Ses Kalitesi");
            if (model.player.showaudioquality != true)
                $(audioQuality).addClass("bmpui-hidden");
        }

        if (speed != null) {
            $(speed).find("span").html("Hız")
            if (model.player.showspeed != true)
                $(speed).addClass("bmpui-hidden");
        }

        if (videoQuality != null) {
            $(videoQuality).find("span").html("Video Kalitesi");
            if (model.player.showvideoquality != true)
                $(videoQuality).addClass("bmpui-hidden");
        }

        var controlItemsCount = controlItems.length;
        var hiddenItemsCount = $(".bmpui-ui-settings-panel-item.bmpui-hidden").length;
        if (controlItemsCount == hiddenItemsCount)
            $(".bmpui-ui-settingstogglebutton").addClass("bmpui-hidden");
    }

    function prepareLicenseUrl(configModel) {
        switch (configModel.source.drm.licensetype) {
            case self.licenseType.CASTLEBLACK:
                {
                    urlLicenseWidevine = urlLicenseWidevineCastleblack.replace("#version#", configModel.source.drm.version);
                    urlLicensePlayready = urlLicensePlayreadyCastleblack.replace("#version#", configModel.source.drm.version);
                    urlLicenseFairplay = urlLicenseFairplayCastleblack.replace("#version#", configModel.source.drm.version);
                }
                break;
            case self.licenseType.ERSTREAM:
                {
                    urlLicenseWidevine = urlLicenseWidevineErstream;
                    urlLicensePlayready = urlLicensePlayreadyErstream;
                    urlLicenseFairplay = urlLicenseFairplayErstream.replace("#version#", configModel.source.drm.version);
                }
                break;
        }

        if (!isNullOrEmpty(configModel.source.drm.widevineLicenseServer))
            urlLicenseWidevine = configModel.source.drm.widevineLicenseServer;

        if (!isNullOrEmpty(configModel.source.drm.playreadyLicenseServer))
            urlLicensePlayready = configModel.source.drm.playreadyLicenseServer;

        if (!isNullOrEmpty(configModel.source.drm.fairplayLicenseServer))
            urlLicenseFairplay = configModel.source.drm.fairplayLicenseServer;
    }

    function prepareHeaders(configModel) {
        switch (configModel.source.drm.drmType) {
            case self.drmType.Widevine:
            case self.drmType.Playready:
                {
                    switch (configModel.source.drm.licensetype) {
                        case self.licenseType.CASTLEBLACK:
                            {
                                return [{
                                    name: "Authorization",
                                    value: "Bearer " + configModel.source.drm.token
                                }, {
                                    name: "X-CB-Ticket",
                                    value: configModel.source.drm.ticket
                                },licenseRequestRetryDelay:1e3,maxLicenseRequestRetries:5,videoRobustness:"SW_SECURE_CRYPTO",audioRobustness:"SW_SECURE_CRYPTO",prepareLicense:function(n){var f={license:n.license},t,r,u,i;try{if(t=JSON.parse(String.fromCharCode.apply(null,n.license)),t&&t.License&&t.Status==="OK"

                                ];
                            }
                            break;
                        case self.licenseType.ERSTREAM:
                            {
                                return [{
                                    name: "X-ErDRM-Message",
                                    value: configModel.source.drm.ticket
                                }];
                            }
                            break;

                        default:
                    }
                }
                break;
            case self.drmType.Fairplay:
                {
                    switch (configModel.source.drm.licensetype) {
                        case self.licenseType.CASTLEBLACK:
                            {
                                return [{
                                    name: "Authorization",
                                    value: "Bearer " + configModel.source.drm.token
                                }, {
                                    name: "X-CB-Ticket",
                                    value: configModel.source.drm.ticket
                                }, {
                                    name: "Content-Type",
                                    value: "application/json"
                                }, 
                                ];
                            }
                            break;
                    }
                }
                break;
        }
    }

    function prepareDrm(configModel, headers) {
        var drm = {
            widevine: {
                LA_URL: urlLicenseWidevine,
                withCredentials: configModel.source.drm.withCredentials,
                maxLicenseRequestRetries: configModel.source.drm.maxLicenseRequestRetries,
                licenseRequestRetryDelay: configModel.source.drm.licenseRequestRetryDelay,
                headers: headers,
                prepareLicense: function (licenseObj) {
                    var license = { license: licenseObj.license };

                    try {
                        var widevineObj = JSON.parse(String.fromCharCode.apply(null, licenseObj.license));
                        if (widevineObj && widevineObj.Status && widevineObj.License) {
                            if (widevineObj.Status == "OK") {
                                var str = window.atob(widevineObj.License);
                                var bufView = new Uint8Array(new ArrayBuffer(str.length));
                                for (var i = 0; i < str.length; i++) {
                                    bufView[i] = str.charCodeAt(i);
                                }
                                license.license = bufView;
                            } else {
                                console.log("license not okay");
                            }
                        } else {
                            console.log("no valid Digiturk license");
                        }
                    } catch (e) {
                        console.log("no valid Digiturk license, exception:" + e.message);
                    }
                    return license;
                }
            },
            playready: {
                LA_URL: urlLicensePlayready,
                withCredentials: configModel.source.drm.withCredentials,
                maxLicenseRequestRetries: configModel.source.drm.maxLicenseRequestRetries,
                licenseRequestRetryDelay: configModel.source.drm.licenseRequestRetryDelay,
                headers: headers,
            },
            fairplay: {
                LA_URL: urlLicenseFairplay,
                certificateURL: certificateUrl.replace("#version#", configModel.source.drm.version),
                certificateHeaders: [{
                    name: "Authorization",
                    value: "Bearer " + configModel.source.drm.token
                }],
                headers: headers,
                prepareMessage: function (keyMessageEvent, keySession) {
                    var model = {
                        Spc: keyMessageEvent.messageBase64Encoded
                    }
                    var jsonModel = JSON.stringify(model);
                    return jsonModel;
                },
                prepareContentId: function (rawContentId) {
                    var tmp = rawContentId.split('/');
                    var cId = tmp[tmp.length - 1];
                    if (cId.indexOf("?") > -1) {
                        var url = cId.split("?");
                        if (url.length > 1) {
                            cId = url[0];
                        }
                    }
                    return cId;
                }
                , prepareLicense: function (license) {
                    var m = JSON.parse(license);
                    return m.Result;
                }
            }
        };

        return drm;
    }

    function prepareSourceAndLabeling(configModel, source, labeling) {
        switch (configModel.source.streamType) {
            case self.streamType.DASH:
                {
                    source.dash = configModel.source.file;
                    source.labeling = {
                        dash: labeling
                    }
                }
                break;
            case self.streamType.HLS:
                {
                    source.hls = configModel.source.file;
                    source.labeling = {
                        hls: labeling
                    }
                }
                break;
            case self.streamType.MP4:
                {
                    source.progressive = configModel.source.file;
                    source.labeling = {
                        progressive: labeling
                    }
                }
                break;
            default:
                {
                    console.log(configModel.streamType);
                }
        }
    }

    self.isSetup = function () {
        if (!self.player || !self.player.isSetup())
            return false;

        return self.player.isSetup();
    };

    self.unLoad = function () {
        if (!self.player || !self.player.isSetup())
            return null;

        self.player.unload();
    };

    self.play = function (audio, subtitle) {
        if (!self.player || !self.player.isSetup())
            return null;

        if (audio != null) {
            self.setAudio(audio);
        }

        if (subtitle != null) {
            self.setSubtitle(subtitle);
        }

        self.player.play();
    };

    self.setTimeShift = function (offset) {
        if (!self.player || !self.player.isSetup())
            return null;

        self.player.timeShift(offset);
    }

    self.getTimeShift = function () {
        if (!self.player || !self.player.isSetup())
            return null;

        return self.player.getTimeShift();
    }

    self.getCurrentTime = function () {
        if (!self.player || !self.player.isSetup())
            return null;

        return self.player.getCurrentTime();
    }

    self.getSubtitles = function () {
        if (!self.player || !self.player.isSetup())
            return null;

        return self.player.getAvailableSubtitles();
    }

    self.setSubtitle = function (subtitle) {
        if (!self.player || !self.player.isSetup())
            return;

        self.player.setSubtitle(subtitle.id);
    }

    self.getAudios = function () {
        if (!self.player || !self.player.isSetup())
            return null;

        return self.player.getAvailableAudio();
    }

    self.setAudio = function (audio) {
        if (!self.player || !self.player.isSetup())
            return;

        self.player.setAudio(audio.id);
    }

    function validationConfig(model) {
        if (model.player.key == "") {
            console.error("player key is empty.");
            return;
        }
        if (model.player.container == "" || ($("#" + model.player.container) == null || $("." + model.player.container) == null)) {
            console.error("player container not found.");
            return;
        }
        if (model.source.streamType == "" || model.source.streamType == null || model.source.streamType == undefined) {
            console.error("streamType not found.");
            return;
        }
        if (model.source.file == "") {
            console.error("source not found.");
            return;
        }
        if (model.source.drm != null) {
            if (model.source.drm.licensetype == self.licenseType.CASTLEBLACK && model.source.drm.token == "") {
                console.error("token is empty. Not Authorization.");
                return;
            }
            if (model.source.drm.licensetype == self.licenseType.CASTLEBLACK && model.source.drm.contentId == "") {
                console.error("contentId not found.");
                return;
            }
            if (model.source.drm.drmType == "" || model.source.drm.drmType == null || model.source.drm.drmType == undefined) {
                console.error("drmType not found.");
                return;
            }
        }
    };

    function isNullOrEmpty(value) {
        var result = false;

        if (!value)
            result = true;

        return result;
    }

    function parseUri(str) {
        var o = parseUri.options,
            m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
        });

        return uri;
    };

    parseUri.options = {
        strictMode: false,
        key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
};
