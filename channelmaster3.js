/* Minification failed. Returning unminified contents.
(1442,49-50): run-time error JS1005: Expected '(': {
(1444,41-47): run-time error JS1006: Expected ')': return
(1444,41-47): run-time error JS1008: Expected '{': return
(1447,30-31): run-time error JS1009: Expected '}': ;
 */
/**
 * Check multi play request'leri gönderir
 * checkIntervalInSeconds 0 verilirse auto check yapılmaz
 * @param {{player: player, endpoint: string, data: {}, checkIntervalInSeconds: number, checkCallback: Function}} options
 */
var MultiPlayManager = function (options) {
    var self = this;

    if (!options || !options.player) return self;

    var defaultOptions = {
        endpoint: '/service/checkmultiplay',
        data: {},
        checkIntervalInSeconds: 60 * 4
    };

    var timer = null;
    var initialized = false;
    var player = options.player;
    var endpoint = options.endpoint || defaultOptions.endpoint;
    var data = options.data || defaultOptions.data;
    var checkIntervalInSeconds = (isNaN(options.checkIntervalInSeconds) || options.checkIntervalInSeconds < 0)
        ? defaultOptions.checkIntervalInSeconds : options.checkIntervalInSeconds;
    var checkCallback = options.checkCallback;

    var checkSuccessHandler = function (responseJson) {
        Utilities.logger.log('MultiPlayManager: check success', responseJson);

        if (typeof checkCallback === 'function') {
            checkCallback(responseJson);
        }

        if (responseJson.Status)
            return;

        if (responseJson.isNoContent) {
            // UNDONE: Offer gösterilecek mi bilinmiyor
            // return;
        }

        var timeout = 10000;

        player.conviva.reportPlaybackFailed(responseJson.Message);
        player.unload();
        player.alert.setup({
            containerType: 'standalone',
            alertType: 'danger',
            hideAfter: timeout
        }).showMessage(responseJson.Message);

        setTimeout(function () {
            window.location.href = '/';
        }, timeout);
    };

    var checkErrorHandler = function (error) {
        Utilities.logger.error('MultiPlayManager: check error', error);

        // UNDONE: ideal olan, bu noktada multiplay yapılıyormuş muamelesi göstermektir. Ancak servisler güvenilir olmadığından aksiyon alınmıyor
    };

    self.check = function () {
        Utilities.makeFetch().fetch({
            endpoint: endpoint,
            requestParams: {
                method: 'POST',
                body: Utilities.serialize(data)
            }
        }, function (response) {
            response.json().then(checkSuccessHandler).catch(checkErrorHandler);
        }, checkErrorHandler);
    }

    self.start = function () {
        self.stop();

        if (checkIntervalInSeconds !== 0) {
            timer = setInterval(self.check, 1000 * checkIntervalInSeconds);
        }
    }

    self.stop = function () {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    self.initialize = function () {
        if (initialized || !player) return self;

        if (checkIntervalInSeconds !== 0) {
            player.onError.subscribe(self.stop);
            player.onDestroy.subscribe(self.stop);
            player.onSourceUnloaded.subscribe(self.stop);
            player.onSourceLoaded.subscribe(self.start);
        }

        initialized = true;

        return self;
    }
};;/**
 * Black out request'lerini yönetir
 */
var BlackOutManager = function (config) {
    var self = this;

    var BlackOutResponseStatus = {
        Ok: 1,
        Error: 10,
        Authentication: 20,
        SessionExpired: 21
    };

    var blackOutRequestSuccessCallback = null;
    var blackOutRequestErrorCallback = null;
    var blackOutCancelSuccessCallback = null;
    var blackOutCancelErrorCallback = null;
    var defaultErrorMessage = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin';

    function blackOutCancelSuccessHandler(responseJson) {
        Utilities.logger.log('BlackOutManager: black out cancel success', responseJson);

        switch (responseJson.Status) {
            case BlackOutResponseStatus.Ok:
                if (typeof blackOutCancelSuccessCallback === 'function') {
                    try {
                        blackOutCancelSuccessCallback({ message: responseJson.Message });
                    }
                    catch (err) { }
                }

                break;

            default:
                var error = new Error(responseJson.Message || defaultErrorMessage);
                error.name == 'BlackOutCancelError';
                throw error;
        }
    }

    function blackOutCancelErrorHandler(error) {
        Utilities.logger.log('BlackOutManager: black out cancel error', error);
        
        if (typeof blackOutCancelErrorCallback === 'function') {
            try {
                blackOutCancelErrorCallback({ message: error.name === 'BlackOutCancelError' ? error.message : defaultErrorMessage });
            }
            catch (err) { }
        }
    }

    /**
     * Black out cancel request'i gönderir
     * @param {number} channelId
     * @param {number} usageSpecId
     * @param {Function} successCallback
     * @param {Function} errorCallback
     */
    self.blackOutCancel = function (channelId, usageSpecId, successCallback, errorCallback) {
        blackOutCancelSuccessCallback = successCallback;
        blackOutCancelErrorCallback = errorCallback;

        Utilities.makeFetch().fetch({
            endpoint: config.boCancelUrl,
            requestParams: {
                method: 'POST',
                body: Utilities.serialize({
                    channelId: channelId,
                    usageSpecId, usageSpecId
                })
            }
        }, function (response) {
            response.json().then(blackOutCancelSuccessHandler).catch(blackOutCancelErrorHandler);
        }, blackOutCancelErrorHandler);
    };

    function blackOutRequestSuccessHandler(responseJson) {
        Utilities.logger.log('BlackOutManager: blackout request success', responseJson);
        //console.log('bo  error', error)
        switch (responseJson.Status) {
            case BlackOutResponseStatus.Ok:
                if (typeof blackOutRequestSuccessCallback === 'function') {
                    try {
                        blackOutRequestSuccessCallback({ message: responseJson.Message });
                    }
                    catch (err) { }
                }

                break;

            default:
                var error = new Error(responseJson.Message || defaultErrorMessage);
                error.name = 'BlackOutRequestError';
                throw error;
        }
    }

    function blackOutRequestErrorHandler(error) {
        
        Utilities.logger.log('BlackOutManager: blackout request error', error);

        if (typeof blackOutRequestErrorCallback === 'function') {
            try {
                blackOutRequestErrorCallback({ message: error.name === 'BlackOutRequestError' ? error.message : defaultErrorMessage });
            }
            catch (err) { }
        }
    }

    /**
     * Black out request'i gönderir
     * @param {number} usageSpecId
     * @param {number} channelId
     * @param {string} eventStartTime
     * @param {string} eventEndTime
     * @param {number} rfsIdToBlackout
     * @param {number} blackoutServiceAccountId
     * @param {Function} successCallback
     * @param {Function} errorCallback
     */
    self.blackOutRequest = function (usageSpecId, channelId, eventStartTime, eventEndTime, rfsIdToBlackout, blackoutServiceAccountId, successCallback, errorCallback) {
        blackOutRequestSuccessCallback = successCallback;
        blackOutRequestErrorCallback = errorCallback;

        Utilities.makeFetch().fetch({
            endpoint: config.boActivateUrl,
            requestParams: {
                method: 'POST',
                body: Utilities.serialize(AddAntiForgeryToken({
                    usageSpecId: usageSpecId,
                    channelId: channelId,
                    eventStartTime: eventStartTime,
                    eventEndTime: eventEndTime,
                    rfsIdToBlackout: rfsIdToBlackout,
                    blackOutServiceAccountId: blackoutServiceAccountId,
                    serviceAccountId: blackoutServiceAccountId
                }))
            }
        }, function (response) {
            response.json().then(blackOutRequestSuccessHandler).catch(blackOutRequestErrorHandler);
        }, blackOutRequestErrorHandler);
    };
};;/**
 * Offer verilerini alır ve yönetir
 * @param {{player: player}} offerManagerOptions
 * */
var OfferManager = function (options) {
    var self = this;
    self.OrderActionType = { Rent: 1, Buy: 2, BuyPackage: 3 };

    if (!options || !options.player) return self;

    var player = options.player;
    var selectedOfferParams = null;
    var offerContainer = null;
    var requestVerificationToken = null;
    var informationMessageLabel = null;
    var previousInformationMessage = null;
    var offerForm = null;
    var offerError = null;
    var smsVerificationForm = null;
    var smsConfirmationError = null;
    var smsConfirmationCodeInput = null;
    var smsDurationLabel = null;
    var smsSendConfirmationCodeButton = null;
    var smsResendCodeButton = null;
    var smsVerificationFormBackButton = null;
    var smsTimeUpPanel = null;
    var smsTimer = null;
    var generalErrorMessage = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin';

    function showOfferError(message) {
        if (offerError)
            offerError.error(message);
        else {
            offerError = Utilities.alert.inline().error(message);
            Utilities.DOM.find('#bc-offer-views').before(offerError.dom);
        }
    }

    function hideOfferError() {
        if (offerError)
            offerError.error('');
    }

    function showSmsConfirmationError(message) {
        if (smsConfirmationError)
            smsConfirmationError.error(message);
        else {
            smsConfirmationError = Utilities.alert.inline().error(message);
            smsConfirmationCodeInput.after(smsConfirmationError.dom);
        }
    }

    function hideSmsConfirmationError() {
        if (smsConfirmationError)
            smsConfirmationError.error('');
    }

    function buildFormSuccessHandler(responseText) {
        // TODO: Loading gizlenmeli

        player.alert.setup({
            containerType: 'cover',
            alertType: 'info'
        }).showHTML(responseText);

        setupFormElements();
    }

    function buildFormErrorHandler(error) {
        Utilities.logger.error(error);

        // TODO: Loading gizlenmeli
        player.alert.setup({
            containerType: 'standalone',
            alertType: 'error',
            hideAfter: 5000
        }).showMessage(generalErrorMessage);
    }

    /**
     * Offer formunu build eder
     * @param {{ endpoint: string, data: { orderAction: number, offerId: number, channelId: number }}} formOptions
     */
    self.buildForm = function (formOptions) {
        // TODO: Loading gösterilmeli

        Utilities.makeFetch().fetch({
            endpoint: formOptions.endpoint || '/order/OfferSalesFormNew',
            requestParams: {
                method: 'POST',
                body: Utilities.serialize(AddAntiForgeryToken(formOptions.data || {}))
            }
        }, function (response) {
            response.text().then(buildFormSuccessHandler).catch(buildFormErrorHandler);
        }, buildFormErrorHandler);
    }

    var onOfferItemClick = function () {
        var item = this;

        selectOffer({
            offerId: item.getAttribute('data-offerId'),
            smsVerificationEnabled: item.getAttribute('data-verification-enabled') === '1',
            smsVerificationMode: item.getAttribute('data-verification-mode')
        });
    };

    var onSendConfirmationCodeButtonClick = function () {
        var confirmationCode = smsConfirmationCodeInput.value().trim();

        if (confirmationCode === '') {
            showSmsConfirmationError('Onay Kodu giriniz!');
            return;
        }

        sendConfirmationCode();
    };

    var onResendCodeButtonClick = function () {
        resetSmsVerificationForm(true);
        resendVerificationCode();
    };

    var onSmsVerificationBackButtonClick = function () {
        resetSmsVerificationForm();
        showOfferForm();
    };

    var setupFormElements = function () {
        offerContainer = player.alert.getDomElement();

        if (!offerContainer || offerContainer.length === 0) return;

        offerContainer = Utilities.DOM.wrap(offerContainer.get(0));

        var bbRedirectElement = offerContainer.find('[data-category]');

        if (bbRedirectElement) {
            Utilities.store.setItem('.nextact', bbRedirectElement.attribute('data-category'));
            return;
        }

        informationMessageLabel = offerContainer.find('.offer-detail-message p');
        requestVerificationToken = offerContainer.find('input[name=__RequestVerificationToken]');
        requestVerificationToken = requestVerificationToken ? requestVerificationToken.value() : null;

        if (informationMessageLabel)
            previousInformationMessage = informationMessageLabel.html();

        offerForm = offerContainer.find('#bc-offer-view-package-list');

        if (offerForm) {
            var offerLinks = offerForm.findAll('.package-item-offer-link');

            if (offerLinks.length !== 0) {
                for (var link of offerLinks) {
                    link.on('click', onOfferItemClick);
                }
            }
        }

        smsVerificationForm = offerContainer.find('#bc-offer-view-sms-verification');

        if (smsVerificationForm) {
            smsConfirmationCodeInput = smsVerificationForm.find('.confirmation-code-input');
            smsDurationLabel = smsVerificationForm.find('#confirmation-remaining-time');
            smsSendConfirmationCodeButton = smsVerificationForm.find('#confirmation-code-send');

            if (smsSendConfirmationCodeButton)
                smsSendConfirmationCodeButton.on('click', onSendConfirmationCodeButtonClick);

            smsTimeUpPanel = smsVerificationForm.find('.confirmation-error-time-up');
            smsResendCodeButton = smsVerificationForm.find('#confirmation-code-resend');

            if (smsResendCodeButton)
                smsResendCodeButton.on('click', onResendCodeButtonClick);

            smsVerificationFormBackButton = smsVerificationForm.find('#bc-btn-cancel-sms-verification');

            if (smsVerificationFormBackButton)
                smsVerificationFormBackButton.on('click', onSmsVerificationBackButtonClick);
        }
    };

    /**
     * @param {boolean} dontResetMessageLabel
     */
    var resetSmsVerificationForm = function (dontResetMessageLabel) {
        stopSmsVerificationTimer();

        smsConfirmationCodeInput.value('');
        hideOfferError();
        hideSmsConfirmationError();
        smsSendConfirmationCodeButton.removeClass('bc-player-hidden');
        smsTimeUpPanel.addClass('bc-player-hidden');

        if (!dontResetMessageLabel)
            informationMessageLabel.html(previousInformationMessage);
    };

    /**
     * @param {{offerId: string, smsVerificationMode: number, smsVerificationEnabled: boolean}} offerParams
     */
    var selectOffer = function (offerParams) {
        Utilities.logger.log('offer selected', offerParams);

        if (!offerParams.offerId) return;

        selectedOfferParams = offerParams;

        if (selectedOfferParams.smsVerificationEnabled) {
            sendVerificationCodeForProcessOffer();
        } else {
            processOffer();
        }
    };

    function sendVerificationCodeForProcessOfferSuccessHandler(responseJson) {
        Utilities.logger.log('send verification code for process offer response', responseJson);
        offerForm.hideLoading();

        var StatusType = { SessionKeyInvalid: -2, Error: -1, UnSuccessful: 0, Success: 1 }

        switch (responseJson.status) {
            case StatusType.SessionKeyInvalid:
            case StatusType.Error:
            case StatusType.UnSuccessful:
                showOfferError(responseJson.message || generalErrorMessage);

                break;
            case StatusType.Success:
                hideOfferError();
                informationMessageLabel.html(responseJson.message);
                showSmsVerificationForm();
                startSmsVerificationTimer({ duration: responseJson.keyDuration });

                break;
        }
    }

    function sendVerificationCodeForProcessOfferErrorHandler(error) {
        Utilities.logger.error(error);
        offerForm.hideLoading();

        showOfferError(generalErrorMessage);
    }

    var sendVerificationCodeForProcessOffer = function () {
        offerForm.showLoading();

        var data = { offerId: selectedOfferParams.offerId, smsVerification: selectedOfferParams.smsVerificationMode };

        Utilities.makeFetch().fetch({
            endpoint: '/order/sendverificationprocessoffer', requestParams: {
                method: 'POST',
                body: Utilities.serialize(requestVerificationToken
                    ? Utilities.addAntiForgeryToken(requestVerificationToken, data) : AddAntiForgeryToken(data))
            }
        }, function (response) {
            response.json().then(sendVerificationCodeForProcessOfferSuccessHandler).catch(sendVerificationCodeForProcessOfferErrorHandler);
        }, sendVerificationCodeForProcessOfferErrorHandler);
    };

    function resendVerificationCodeSuccessHandler(responseJson) {
        Utilities.logger.log('resend verification code success', responseJson);
        smsVerificationForm.hideLoading();

        if (responseJson.status) {
            startSmsVerificationTimer({ duration: responseJson.keyDuration });
        } else {
            showOfferError(responseJson.message || generalErrorMessage);
        }
    }

    function resendVerificationCodeErrorHandler(error) {
        Utilities.logger.error('resend verification code error', error);
        smsVerificationForm.hideLoading();
        showOfferError(generalErrorMessage);
    }

    var resendVerificationCode = function () {
        var SmsVerificationType = { PackageOrder: 3 }
        var data = { smsVerification: SmsVerificationType.PackageOrder };

        smsVerificationForm.showLoading();

        Utilities.makeFetch().fetch({
            endpoint: '/Account/ReSendVerificationCode',
            requestParams: {
                method: 'POST',
                body: Utilities.serialize(requestVerificationToken
                    ? Utilities.addAntiForgeryToken(requestVerificationToken, data) : AddAntiForgeryToken(data))
            }
        }, function (response) {
            response.json().then(resendVerificationCodeSuccessHandler).catch(resendVerificationCodeErrorHandler);
        }, resendVerificationCodeErrorHandler);
    };

    function sendConfirmationCodeSuccessHandler(responseJson) {
        Utilities.logger.log('send confirmation code success', responseJson);
        smsVerificationForm.hideLoading();

        var StatusType = { SessionKeyInvalid: -2, Error: -1, UnSuccessful: 0, Success: 1 };

        switch (responseJson.status) {
            case StatusType.Success:
                location.reload();

                break;
            default:
                hideOfferError();
                showSmsConfirmationError(responseJson.model.FormResult);

                break;
        }
    }

    function sendConfirmationCodeErrorHandler(error) {
        Utilities.logger.log('send confirmation code error', error);
        smsVerificationForm.hideLoading();

        showSmsConfirmationError(generalErrorMessage);
    }

    var sendConfirmationCode = function () {
        var VerificationType = { Order: 1, BlackoutRequest: 2, BlackoutCancel: 3 };

        var data = {
            code: smsConfirmationCodeInput.value().trim(),
            verificationFor: VerificationType.Order,
            verificationForVersion: true
        };

        smsVerificationForm.showLoading();

        Utilities.makeFetch().fetch({
            endpoint: '/account/VerificationCode', requestParams: {
                method: 'POST',
                body: Utilities.serialize(requestVerificationToken
                    ? Utilities.addAntiForgeryToken(requestVerificationToken, data) : AddAntiForgeryToken(data))
            }
        }, function (response) {
            response.json().then(sendConfirmationCodeSuccessHandler).catch(sendConfirmationCodeErrorHandler);
        }, sendConfirmationCodeErrorHandler);
    };

    var showOfferForm = function () {
        if (!offerForm) return;

        if (smsVerificationForm) {
            smsVerificationForm.addClass('bc-player-hidden');
        }

        offerForm.removeClass('bc-player-hidden');
    };

    var showSmsVerificationForm = function () {
        if (!smsVerificationForm) return;

        if (offerForm) {
            offerForm.addClass('bc-player-hidden');
        }

        smsVerificationForm.removeClass('bc-player-hidden');
    };

    /**
     * @param {{duration: number}} smsVerificationTimerOptions
     */
    var startSmsVerificationTimer = function (smsVerificationTimerOptions) {
        var duration = smsVerificationTimerOptions.duration || 4 * 60;
        var counter = duration;

        stopSmsVerificationTimer();

        var update = function () {
            if (counter < 0) {
                stopSmsVerificationTimer();
                showOfferError('Onay kodu süresi sona erdi');
                smsSendConfirmationCodeButton.addClass('bc-player-hidden');
                smsTimeUpPanel.removeClass('bc-player-hidden');
            } else {
                var min = Math.floor(counter / 60);
                var minPrefix = min < 10 ? '0' : '';
                var sec = Math.floor(counter % 60);
                var secPrefix = sec < 10 ? '0' : '';

                smsDurationLabel.html(minPrefix + min + ':' + secPrefix + sec);
            }

            counter--;
        };

        smsTimer = setInterval(update, 1000);
        update();
    };

    var stopSmsVerificationTimer = function () {
        if (smsTimer) {
            clearInterval(smsTimer);
            smsTimer = null;
        }
    };

    //function processOfferSuccessHandler(responseJson) {
    //    Utilities.logger.log('process offer response', responseJson);
    //    // UNDONE: Loading varsa gizlenmeli

    //    var StatusType = { SessionKeyInvalid: -2, Error: -1, UnSuccessful: 0, Success: 1 };

    //    switch (responseJson.status) {
    //        case StatusType.SessionKeyInvalid:
    //        case StatusType.Error:
    //        case StatusType.UnSuccessful:
    //            // TODO: hata mesajı (responseJson.message) gösterilmeli

    //            break;
    //        case StatusType.Success:
    //            location.reload();

    //            break;
    //    }
    //}

    //function processOfferErrorHandler(error) {
    //    Utilities.logger.error(error);

    //    // TODO: Hata gösterilmeli
    //    // UNDONE: Loading varsa gizlenmeli
    //}

    //// UNDONE: Sms verification olmaksızın bu case ele alınmadı
    //var processOffer = function () {
    //    // UNDONE: Loading nerede gösterilmeli?

    //    var endpoint = '/order/processoffer';
    //    var data = { offerId: selectedOfferParams.offerId };

    //    Utilities.makeFetch().fetch({
    //        endpoint: endpoint,
    //        requestParams: {
    //            method: 'POST',
    //            body: Utilities.serialize(requestVerificationToken
    //                ? Utilities.addAntiForgeryToken(requestVerificationToken, data) : AddAntiForgeryToken(data))
    //        }
    //    }, function (response) {
    //        response.json().then(processOfferSuccessHandler).catch(processOfferErrorHandler);
    //    }, processOfferErrorHandler);
    //}
};;var TagManager = function () {
    window.dataLayer = window.dataLayer || [];
    window.netmera = window.netmera || [];

    var _player = null;
    var _playerSessionId = (new Date()).getTime();
    var _heartBeatEnabled = false;
    var _heartBeatIntervalHandle = null;
    var _heartBeatIntervalInSeconds = 30;
    var _firstPlayFlag = true;
    var _isPPV = false;
    var _PPVInfos = {};
    var PlayerTypes = {
        LIVE: 'PLAYER_LIVE',
        VOD: 'PLAYER_VOD',
        TRAILER: 'PLAYER_TRAILER',
        PPV: 'PLAYER_PPV'
    };

    var PlayerEvents = {
        PLAY: 'PLAY',
        PAUSED: 'PAUSED',
        FULLSCREEN_ENTER: 'FULLSCREEN_ENTER',
        FULLSCREEN_EXIT: 'FULLSCREEN_EXIT',
        MUTED: 'MUTED',
        UNMUTED: 'UNMUTED',
        VOLUME_CHANGED: 'VOLUME_CHANGED',
        VIDEO_QUALITY_CHANGED: 'VIDEO_QUALITY_CHANGED',
        //SEEK: 'SEEK',
        TIMESHIFT: 'TIMESHIFT'
    };

    var LegacyPlayerEvents = {
        PLAY: 'videoPlay',
        PAUSED: 'videoPause',
        RESUME: 'videoResume',
        //FINISHED: 'videoCompleted',
        FULLSCREEN_ENTER: 'videoGoFullScreen',
        FULLSCREEN_EXIT: 'videoExitFullScreen',
        VIDEO_QUALITY_CHANGED: 'videoChangeRes'
    };


    var addPlayerEventToDataLayer = function (eventName, eventArgs) {
        var event = 'playerEvent';
        var eventAction = 'click';
        var eventCategory = 'player/{{PLAYER-CONTENT-TYPE}}';
        var eventLabel = '';
        var title = '';
        var url = window.location.href;
        var currentTime = 0;
        
        if (_player.isLive()) {
            var currentChannel = _player.channels.getCurrentItem();
            var currentProgram = _player.tvGuide.getCurrentItem();

            eventCategory = eventCategory.replace('{PLAYER-CONTENT-TYPE}', _isPPV ? PlayerTypes.PPV : PlayerTypes.LIVE);
            currentTime = _player.timeShift().toFixed();
            if (_isPPV) {
                title = _PPVInfos.channelName + ' \\ ' + _PPVInfos.epgTitle;
            } else {
                title = currentChannel.item.name + ' \\ ' + (currentProgram ? currentProgram.item.title : 'Untitled');
            }

            
        } else {

        }
        
        eventLabel = eventName + ' | ' + currentTime + ' | ' + title + ' | ' + url;

        if (eventName === PlayerEvents.VIDEO_QUALITY_CHANGED) {
            var targetVideoQuality = eventArgs.targetVideoQuality;

            eventCategory = eventCategory.replace('player/', 'player/floating/');
            eventAction = 'select';
            eventLabel = 'Video Quality | ' + targetVideoQuality.width + 'x' + targetVideoQuality.height + ', ' + targetVideoQuality.bitrate + 'bps';
        }

        dataLayer.push({
            event: event,
            eventAction: eventAction,
            eventCategory: eventCategory,
            eventLabel: eventLabel
        });
    };

    var addLegacyPlayerEventToDataLayer = function (eventName, eventArgs) {
        var currentTime = 0;

        if (_player.isLive()) {
            currentTime = _player.timeShift();
        }

        switch (eventName) {
            case LegacyPlayerEvents.PLAY:
            case LegacyPlayerEvents.PAUSED:
            case LegacyPlayerEvents.RESUME:
                dataLayer.push({
                    event: eventName,
                    currentProgress: Utilities.secondsToTime(currentTime),
                    currentProgressRate: '0.00'
                });

                break;
            case LegacyPlayerEvents.FULLSCREEN_ENTER:
                dataLayer.push({
                    event: eventName,
                    currentProgress: Utilities.secondsToTime(currentTime),
                    currentProgressRate: '0.00',
                    isFullScreen: 'Yes'
                });

                break;
            case LegacyPlayerEvents.FULLSCREEN_EXIT:
                dataLayer.push({
                    event: eventName,
                    currentProgress: Utilities.secondsToTime(currentTime),
                    currentProgressRate: '0.00',
                    isFullScreen: 'No'
                });

                break;
            case LegacyPlayerEvents.VIDEO_QUALITY_CHANGED:
                var targetVideoQuality = eventArgs.targetVideoQuality;

                dataLayer.push({
                    event: eventName,
                    currentProgress: Utilities.secondsToTime(currentTime),
                    currentProgressRate: '0.00',
                    videoResolution: targetVideoQuality.width + 'x' + targetVideoQuality.height + ', ' + targetVideoQuality.bitrate + 'bps'
                });

                break;
        }
    };

    var addHeartBeatEventToDataLayer = function () {
        var event = 'playerEvent';
        var eventAction = 'heartBeat';
        var eventCategory = 'player/{{PLAYER-CONTENT-TYPE}}';
        var eventLabel = '';
        console.log("ppvinfos", _PPVInfos + ' ' + _isPPV);
        if (_player.isLive()) {
            var currentChannel = _player.channels.getCurrentItem();
            var currentProgram = _player.tvGuide.getCurrentItem();

            eventCategory = eventCategory.replace('{PLAYER-CONTENT-TYPE}', _isPPV ? PlayerTypes.PPV : PlayerTypes.LIVE);
            if (_isPPV === false) {
                eventLabel = _playerSessionId + ' | ' + currentChannel.item.id + ' | '
                    + (currentProgram ? currentProgram.item.id + ' \\ ' + currentProgram.item.title : '') + ' | ' + _player.timeShift().toFixed();
            } else {
                eventLabel = _playerSessionId + ' | ' + _PPVInfos.channelId + ' | '
                    + (_PPVInfos.epgId + ' \\ ' + _PPVInfos.epgTitle) + ' | ' + _player.timeShift().toFixed();
            }

        } else {
            //eventLabel = _playerSessionId
            //    + ' |'
            //    + ' | ' + ModelPlayer.playRequestModel.contentId
            //    + ' | ' + (followMeStartAt || _player.getCurrentTime().toFixed())
            //    + ' | ';
        }

        dataLayer.push({
            event: event,
            eventAction: eventAction,
            eventCategory: eventCategory,
            eventLabel: eventLabel
        });
    };

    var addNetmeraPlayEvent = function () {
        var playEvent = {};
        if (_isPPV === false) {
            var currentProgram = _player.tvGuide.getCurrentItem();
            var currentChannel = _player.channels.getCurrentItem();
            var programId = '';
            var programTitle = currentChannel.item.name; //'untitled';
            var seriesName = currentProgram.item.seriesName;
            if (currentProgram) {
                programId = currentProgram.item.id;
                programTitle = currentProgram.item.title.toLowerCase();
            }

            playEvent = {
                "code": "zyr",
                "eb": programTitle,
                "et": currentChannel.item.categoryName,
                "eg": currentChannel.item.name,
                "ee": '' + programId,
                "ea": '' + currentChannel.item.id,
                "en": "live_tv",
                "ef": "live_channel",
                "ei": "play",
                "ev": "web",
                "fo": seriesName
            };
        } else {
            playEvent = {
                "code": "zyr",
                "eb": _PPVInfos.epgTitle,
                "et": 'SPOR',
                "eg": _PPVInfos.channelName,
                "ee": '' + _PPVInfos.epgId,
                "ea": '' + _PPVInfos.channelId,
                "en": "match_detail",
                "ef": "live_match",
                "ei": "play",
                "ev": "web"
            };
        }
        

        netmera.push(function (api) {
            api.sendEvent(playEvent);
        });
    };

    var playerOnPlay = function () {
        if (_heartBeatEnabled)
            startHeartBeat();


        if (_firstPlayFlag) {
            _firstPlayFlag = false;
            addNetmeraPlayEvent();
            addLegacyPlayerEventToDataLayer(LegacyPlayerEvents.PLAY);
        } else {
            addLegacyPlayerEventToDataLayer(LegacyPlayerEvents.RESUME);
        }
        addPlayerEventToDataLayer(PlayerEvents.PLAY);
    };

    var playerOnPaused = function () {
        if (_heartBeatEnabled)
            stopHeartBeat();

        addPlayerEventToDataLayer(PlayerEvents.PAUSED);
        addLegacyPlayerEventToDataLayer(LegacyPlayerEvents.PAUSED);
    };

    var playerOnFullScreenEnter = function () {
        addPlayerEventToDataLayer(PlayerEvents.FULLSCREEN_ENTER);
        addLegacyPlayerEventToDataLayer(LegacyPlayerEvents.FULLSCREEN_ENTER);
    };

    var playerOnFullScreenExit = function () {
        addPlayerEventToDataLayer(PlayerEvents.FULLSCREEN_EXIT);
        addLegacyPlayerEventToDataLayer(LegacyPlayerEvents.FULLSCREEN_EXIT);
    };

    var playerOnMuted = function () {
        addPlayerEventToDataLayer(PlayerEvents.MUTED);
    };

    var playerOnUnmuted = function () {
        addPlayerEventToDataLayer(PlayerEvents.UNMUTED);
    };

    var playerOnVolumeChanged = function () {
        addPlayerEventToDataLayer(PlayerEvents.VOLUME_CHANGED);
    };

    var playerOnVideoQualityChanged = function (player, eventArgs) {
        addPlayerEventToDataLayer(PlayerEvents.VIDEO_QUALITY_CHANGED, eventArgs);
        addLegacyPlayerEventToDataLayer(LegacyPlayerEvents.VIDEO_QUALITY_CHANGED, eventArgs);
    };

    //var playerOnSeek = function () {
    //    addPlayerEventToDataLayer(PlayerEvents.SEEK);
    //};

    var playerOnTimeShift = function () {
        addPlayerEventToDataLayer(PlayerEvents.TIMESHIFT);
    };

    var playerOnSourceLoaded = function () {
        _firstPlayFlag = true;
    };

    var playerOnChannelSelected = function () {
        var currentChannel = _player.channels.getCurrentItem();

        if (currentChannel) {
            dataLayer.push({
                componentInfo: 'sushi/Canlı TV',
                pageType: 'canli-tv',
                itemIndex: '' + _player.channels.getItems().indexOf(currentChannel),
                itemTitle: currentChannel.item.name,
                targetUrl: window.location.href
            });
        }
    };

    var startHeartBeat = function () {
        if (_heartBeatIntervalHandle) stopHeartBeat();

        _heartBeatIntervalHandle = setInterval(addHeartBeatEventToDataLayer, _heartBeatIntervalInSeconds * 1000);
    };


    var stopHeartBeat = function () {
        if (!_heartBeatIntervalHandle) return;

        clearInterval(_heartBeatIntervalHandle);
        _heartBeatIntervalHandle = null;
    };

    /**
     * HeartBeat için gerekli playerSessionId değerini günceller
     * @param {any} playerSessionId
     */
    this.updatePlayerSessionId = function (playerSessionId) {
        _playerSessionId = playerSessionId;
    };

    /**
     * Player'a entegre olarak player ile ilgili event'leri tag'ler
     * @param {Player} player
     */
    this.attachPlayer = function (player) {
        if (_player) this.detachPlayer();

        _player = player;

        _player.onPlay.subscribe(playerOnPlay);
        _player.onPaused.subscribe(playerOnPaused);
        _player.onFullScreenEnter.subscribe(playerOnFullScreenEnter);
        _player.onFullScreenExit.subscribe(playerOnFullScreenExit);
        _player.onMuted.subscribe(playerOnMuted);
        _player.onUnmuted.subscribe(playerOnUnmuted);
        _player.onVolumeChanged.subscribe(playerOnVolumeChanged);
        _player.onVideoQualityChanged.subscribe(playerOnVideoQualityChanged);
        //_player.onSeek.subscribe(playerOnSeek);
        _player.onTimeShift.subscribe(playerOnTimeShift);

        _player.onSourceLoaded.subscribe(playerOnSourceLoaded);
        _player.channels.onChannelSelected.subscribe(playerOnChannelSelected);
    };

    /**
     * Player entegrasyonunu kaldırır
     * */
    this.detachPlayer = function () {
        if (!_player) return;

        _player.onPlay.unsubscribe(playerOnPlay);
        _player.onPaused.unsubscribe(playerOnPaused);
        _player.onFullScreenEnter.unsubscribe(playerOnFullScreenEnter);
        _player.onFullScreenExit.unsubscribe(playerOnFullScreenExit);
        _player.onMuted.unsubscribe(playerOnMuted);
        _player.onUnmuted.unsubscribe(playerOnUnmuted);
        _player.onVolumeChanged.unsubscribe(playerOnVolumeChanged);
        _player.onVideoQualityChanged.unsubscribe(playerOnVideoQualityChanged);
        //_player.onSeek.unsubscribe(playerOnSeek);
        _player.onTimeShift.unsubscribe(playerOnTimeShift);

        _player.onSourceLoaded.unsubscribe(playerOnSourceLoaded);
        _player.channels.onChannelSelected.unsubscribe(playerOnChannelSelected);

        _player = null;
    };

    /**
     * HeartBeat'i belirtilen ayarlarla devreye alır
     * @param {{intervalInSeconds: Number}} options
     */
    this.enableHeartBeat = function (options) {
        if (options && options.intervalInSeconds)
            _heartBeatIntervalInSeconds = options.intervalInSeconds;
        else
            _heartBeatIntervalInSeconds = 60;

        _heartBeatEnabled = true;
    };

    /**
     * HeartBeat'i devredışı eder
     * */
    this.disableHeartBeat = function () {
        stopHeartBeat();

        _heartBeatEnabled = false;
    };

    this.setPPVInfos = function (PPVInfos) {
        _isPPV = true;
        _PPVInfos = PPVInfos
    }

    
};;var EPGManager = (function () {
    var _manager = {};
    var _programs = [];
    var _timer = null;

    var toTime = function (endTimeString) {
        return parseInt(endTimeString.substr(6), 10);
    };

    var sortProgramsByEndTime = function () {
        _programs = _programs.sort(function (programA, programB) {
            var result = 0;

            if (programA.EndTime < programB.EndTime)
                result = -1;
            else if (programA.EndTime > programB.EndTime)
                result = 1;

            return result;
        });
    };

    var getProgramsAboutToFinish = function (time) {
        sortProgramsByEndTime();
        var programs = [];

        for (var i = 0; i < _programs.length; i++) {
            programs.push(_programs[i]);

            if (_programs[i].EndTime > time)
                break;
        }

        return programs;
    };

    var update = function (programs) {
        var query = programs.map(function (p) {
            return p.ContentId;
        });

        var errorHandler = function (error) {
            console.log('EPG ERROR', error);
            refreshTimer();
        }

        var successHandler = function (responseJson) {
            for (var i = 0; i < responseJson.length; i++) {
                _programs = _programs.filter(function (p) {
                    return p.ContentId !== responseJson[i].ContentId;
                });

                responseJson[i].EndTime = toTime(responseJson[i].EndTime);
                _programs.push(responseJson[i]);
            }

            refreshTimer();
        }

        Utilities.makeFetch().fetch({
            endpoint: '/tvnew/tvguidenow?c=' + query.join(','),
            requestParams: { method: 'GET' }
        }, function (response) {
            response.json().then(successHandler).catch(errorHandler);
        }, errorHandler);
    };

    var refreshTimer = function () {
        if (_timer !== null)
            clearTimeout(_timer);

        var time = (new Date()).getTime();
        var programs = getProgramsAboutToFinish(time);

        if (programs.length === 0) return;

        var timeout = programs[programs.length - 1].EndTime - time;

        console.log('SETTING UP NEW EPG TIMER', timeout);

        _timer = setTimeout(function () {
            update(programs);
        }, timeout < 0 ? (60 * 1000) : timeout);
    };

    _manager.initialize = function (programs) {
        //current playing programs
        var initialPrograms = JSON.parse(JSON.stringify(programs));

        _programs = initialPrograms.map(function (p) {
            p.EndTime = toTime(p.EndTime);

            return p;
        });
        //refreshTimer();
    };

    _manager.getChannelProgram = function (channelNo) {
        var programs = _programs.filter(function (p) {
            return p.ContentId == channelNo;
        });

        return programs.length > 0 ? programs[0] : null;
    }

    return _manager;
})();
;var PPVPlayer = function () {
    var self = this;
    var StreamType = { DASH: 1, SS: 2, HLS: 3, MP4: 4 };
    var DrmType = { PlayReady: 1, Widevine: 2, FairPlay: 3 };
    var ActionType = {
        None: 0,
        Play: 1,
        Login: 10,
        SessionExpired: 11,
        NotEntitled: 30,
        LicenseNotStarted: 31,
        NoCdnUrl: 32,
        MultiPlay: 40,
        TicketError: 41,
        Offer: 50,
        ParentalControl: 60,
        Error: 100,
        BlackOut: 200,
        Fraud: 300,
        ShowPreAgreement: 400
    };

    


    var initialized = false;

    var params = {};

    /**
     * Normalde multiPlayManager player'a göre otomatik olarak start stop ve check yapıyor.
     * Ancak gerekirse bazı durumlarda kullanılmak üzere referansı mevcut.
     * multiPlayManager.check(); şeklinde manual check için kullanılabilir.
     */
    var multiPlayManager = null;
    var offerManager = null;
    var blackOutManager = !!BlackOutManager ? new BlackOutManager({ boActivateUrl: '/content/ActivateBlackOut', boCancelUrl: '/Tv/BlackoutCancel' }) : null;
    var tagManager = null;
    var playerSessionId = (new Date()).getTime();
    var lastTimeShiftValue = 0;

    function prepareParams() {

        var dataElem = document.querySelector('.match-detail-button');

        if (dataElem) {
            params = {
                cmsContentId: dataElem.dataset.cmsContentId,
                usageSpecId: dataElem.dataset.usageSpecId,
                channelId: dataElem.dataset.channelId,
                eventStartTime: dataElem.dataset.eventStartTime,
                eventEndTime: dataElem.dataset.eventEndTime,
                blackoutServiceAccountId: dataElem.dataset.blackoutServiceAccountId,
                rfsIdToBlackout: dataElem.dataset.rfsId,
                channelName: matchInfos.channelName,
                nextAction: dataElem.dataset.nextAction,
                offerId: dataElem.dataset.offerId
            };
        }

            document.querySelector('.match-player-wrapper').classList.remove('d-none');
            dataElem.classList.add('d-none');
        if (params.nextAction !== "Offer") {
        }
    }

    function getCastleBlackBaseURL() {
        var baseUrl = '';
        var hostname = window.location.hostname.toLowerCase();

        switch (hostname) {
            //case 'localhost':
            //case 'test-www.beinconnect.com.tr':
            //    baseUrl = 'https://test-castleblack.digiturk.com.tr';
            //    break;
            default:
                baseUrl = 'https://castleblack.digiturk.com.tr';
                break;
        }

        return baseUrl;
    }

    function createSecureUrl(url) {
        var isSecurePage = window.location.protocol.indexOf("https") > -1;

        if (isSecurePage) {
            if (url.indexOf("http://") === 0) {
                url = url.replace("http://", "https://");

                if (url.indexOf("switch") > -1) {
                    if (url.indexOf("?") > -1) {
                        url += "&secure=1";
                    } else {
                        url += "?secure=1";
                    }
                }
            }
        }

        return url;
    }

    function showBufferingOverlay(isShow) {
        var bufferingOverlay = self.player.getBufferingOverlay();

        if (bufferingOverlay) {
            isShow ? bufferingOverlay.show() : bufferingOverlay.hide();
        }
    }


    function playRequestSuccessHandler(responseJson) {

        if (responseJson.status === false) {
            if (params.nextAction === 'Offer')
                responseJson['Action'] = ActionType.Offer;
            else
                responseJson['Action'] = ActionType.BlackOut;
        }
        else
            responseJson = responseJson.model.Data.model;



        Utilities.logger.log('PPV: play request success', responseJson);
        showBufferingOverlay(false);

        var timeShiftValue = lastTimeShiftValue;
        lastTimeShiftValue = 0;

        if (responseJson.ServerTicks)
            playerSessionId = responseJson.ServerTicks;
        else
            playerSessionId = (new Date()).getTime();

        tagManager.updatePlayerSessionId(playerSessionId);


        switch (responseJson.Action) {
            case ActionType.Login:
                window.location = '/kullanici/giris?r=' + encodeURI(window.location.pathname);

                break;
            case ActionType.Offer:
                self.player.conviva.reportPlaybackFailed('Not Entitled');
                offerManager = new OfferManager({ player: self.player });
                offerManager.buildForm({ data: { orderAction: offerManager.OrderActionType.BuyPackage, offerId: params.offerId, channelId: matchInfos.channelId, from:"match-detail" } });

                break;
            // UNDONE: Bu case ele alınmamış
            //case ActionType.ParentalControl:
            //    player.alert.setup({
            //        containerType: 'standalone',
            //        alertType: 'danger',
            //        hideAfter: 10000
            //    }).showMessage(message || 'Digiturk\'ün bu bölümünde yer alan içeriklerin 18 yaşından küçük kullanıcılar üzerinde olumsuz etkisi olabilir');

            //    break;
            case ActionType.None:
            case ActionType.SessionExpired:
            case ActionType.NotEntitled:
            case ActionType.LicenseNotStarted:
            case ActionType.NoCdnUrl:
            case ActionType.Fraud:
            case ActionType.Error:
                var message = responseJson.Message || 'Bir hata oluştu, lütfen daha sonra tekrar deneyin';
                self.player.conviva.reportPlaybackFailed(message);
                self.player.alert.setup({
                    containerType: 'cover',
                    alertType: 'danger'
                }).showMessage(message);

                break;
            case ActionType.BlackOut:
                // TODO: conviva'ya ne gönderilecek görüşülecek
                var parameters = { cmsContentId: params.cmsContentId, usageSpecId: params.usageSpecId, adUrl: null };


                $.post("/content/playrequestblackout", parameters, function (result) {
                    responseJson['blackout'] = result.model;

                    self.player.externalDevice.showCloseBroadcast(result.model.Message, {
                        isVerificationRequired: result.model.IsVerificationRequired,
                        eventStartTime: params.eventStartTime,
                        eventEndTime: params.eventEndTime,
                        rfsIdToBlackout: params.rfsId,
                        blackoutServiceAccountId: params.blackOutServiceAccountId
                    });

                });


                break;
            case ActionType.Play:
                var streamData = responseJson.StreamToPlay;

                if (!streamData || !streamData.Url) break;

                var url = createSecureUrl(streamData.Url);
                var playerSource = {};

                switch (streamData.StreamFormat) {
                    case StreamType.DASH:
                        playerSource.dash = url;

                        break;
                    case StreamType.HLS:
                        playerSource.hls = url;

                        break;
                    case StreamType.SS:
                        playerSource.smooth = url;

                        break;
                }

                if (streamData.IsDrm) {
                    var drmTicket = responseJson.DrmTicket.replace('ticket=', '');

                    switch (responseJson.DrmType) {
                        case DrmType.Widevine:
                            playerSource.drm = {
                                widevine: {
                                    LA_URL: getCastleBlackBaseURL() + '/api/widevine/license?version=1.0',
                                    headers: {
                                        Authorization: 'Bearer ' + responseJson.CastleBlackToken,
                                        'X-CB-Ticket': drmTicket,
                                    },
                                    licenseRequestRetryDelay: 1000,
                                    maxLicenseRequestRetries: 5,
                                    videoRobustness: 'SW_SECURE_CRYPTO',
                                    audioRobustness: 'SW_SECURE_CRYPTO',
                                    prepareLicense: function (license) {
                                        var result = { license: license.license };

                                        try {
                                            var widevine = JSON.parse(String.fromCharCode.apply(null, license.license));

                                            if (widevine && widevine.License && widevine.Status === "OK") {
                                                var licenseString = window.atob(widevine.License);
                                                var buffer = new Uint8Array(new ArrayBuffer(licenseString.length));

                                                for (var i = 0; i < licenseString.length; i++) {
                                                    buffer[i] = licenseString.charCodeAt(i);
                                                }

                                                result.license = buffer;
                                            }
                                        } catch { }

                                        return result;
                                    }
                                }
                            };

                            break;
                        case DrmType.FairPlay:
                            playerSource.drm = {
                                fairplay: {
                                    LA_URL: getCastleBlackBaseURL() + '/api/fairplay/license?version=1.0',
                                    headers: {
                                        Authorization: 'Bearer ' + responseJson.CastleBlackToken,
                                        'X-CB-Ticket': drmTicket,
                                        'X-CB-ContentId': streamData.AssetId,
                                        'Content-Type': 'application/json'
                                    },
                                    certificateURL: getCastleBlackBaseURL() + '/api/fairplay/certificate?version=1.0',
                                    certificateHeaders: {
                                        Authorization: 'Bearer ' + responseJson.CastleBlackToken
                                    },
                                    prepareMessage: function (keyMessageEvent) {
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
                                    },
                                    prepareLicense: function (license) {
                                        var m = JSON.parse(license);
                                        return m.Result;
                                    }
                                }
                            }

                            break;
                        case DrmType.PlayReady:
                            playerSource.drm = {
                                playready: {
                                    LA_URL: 'https://digiturk-drm.ercdn.com/playready/rightsmanager.asmx?op=AcquireLicense',
                                    headers: {
                                        'X-ErDRM-Message': drmTicket
                                    },
                                    licenseRequestRetryDelay: 1000,
                                    maxLicenseRequestRetries: 10
                                }
                            }

                            break;
                    }
                }



                if (responseJson.Blackout) {
                    playerSource.title = params.channelName;

                    var blackout = responseJson.Blackout;

                    if (blackout != null && blackout.HasBlackout && blackout.HasRightToCancel) {

                        self.player.externalDevice.setOpenBroadcastParams({
                            channelId: params.channelId,
                            usageSpecId: params.usageSpecId ? params.usageSpecId : undefined
                        });
                    } else {
                        self.player.externalDevice.setOpenBroadcastParams(null);
                    }
                }

                // Player'a source verilirken oynatmanın nereden başlayacağı iletiliyor.
                playerSource.options = {
                    startOffset: timeShiftValue
                };



                if (responseJson.MultiplaySessionKey) {
                    self.player.conviva.setPlaySessionId(responseJson.MultiplaySessionKey);
                }

                var epgContentLength = responseJson.EventDurationInSeconds || -1;

                console.log('conviva data', streamData.CdnTypeString + ' ' + url);
                self.player.conviva.setDefaultResource(streamData.CdnTypeString).setStreamURL(url).setContentLength(epgContentLength).setContentInfo();
                self.player.load(playerSource);

                break;
        }
    }

    function playRequestErrorHandler(error) {
        var message = 'PPVPlayer: play request error.';

        Utilities.logger.error(message, error);

        if (error) {
            message += typeof error === 'string' ? error : error.message;
        }

        self.player.conviva.setContentInfo().reportPlaybackFailed(message);
        showBufferingOverlay(false);

        lastTimeShiftValue = 0;

        // TODO: hata gösterilmeli
    }

    function playRequest(cmsContentId, usageSpecId) {
        showBufferingOverlay(true);

        console.log('params', params);

        Utilities.makeFetch().fetch({
            endpoint: 'https://user10182.requestly.dev/1?',
            requestParams: {
                method: 'POST',
                body: Utilities.serialize(Utilities.addAntiForgeryToken(null, {
                    cmsContentId: params.cmsContentId,
                    usageSpecId: params.usageSpecId
                }))
            }
        }, function (response) {
            response.json().then(playRequestSuccessHandler).catch(playRequestErrorHandler);
        }, playRequestErrorHandler);
    }

    function offerRequest() {
        ViewHelper.showLoading();
        ViewHelper.showOverlay();

        Utilities.makeFetch().fetch({
            endpoint: '/order/OfferSalesFormLiveSports',
            requestParams: {
                method: 'POST',
                body: Utilities.serialize(Utilities.addAntiForgeryToken(null, { orderAction: 3 /*BuyPackage*/, offerId: params.offerId }))
            }
        }, function (response) {
            response.json().then(offerRequestHandler).catch(offerRequestHandler);
        }, offerRequestHandler);
    }

    function offerRequestHandler(responseJson) {
        ViewHelper.hideLoading();
        ViewHelper.hideOverlay();

        if (responseJson.IsBb) {
            localStorage.setItem(".nextact", responseJson.NextSection);

            const catalogHash = responseJson.NextSection == "SPE_PLUS_OTT_WEB_KATALOGU" ? "spor-extra" : "super-lig"
            window.location = "/satinal#" + catalogHash;
            return;
        }

       
    }

    function blackOutCancel(channelId, usageSpecId) {
        if (!blackOutManager) return;

        blackOutManager.blackOutCancel(channelId, usageSpecId,
            function (response) {
                self.player.alert.setup({
                    containerType: 'standalone',
                    alertType: 'warning',
                    hideAfter: 5000
                }).showMessage(response.message);

                self.player.externalDevice.setOpenBroadcastParams();
            }, function (error) {
                self.player.alert.setup({
                    containerType: 'standalone',
                    alertType: 'danger',
                    hideAfter: 5000
                }).showMessage(error.message);
            });
    }

    function blackOutRequest(usageSpecId, channelId, eventStartTime, eventEndTime, rfsIdToBlackout, blackoutServiceAccountId) {
        if (!blackOutManager) return;


        blackOutManager.blackOutRequest(
            usageSpecId,
            channelId,
            eventStartTime,
            eventEndTime,
            rfsIdToBlackout,
            blackoutServiceAccountId,
            function () {
                //playRequest(self.player.channels.getCurrentItem().id);
                playStream();
            },
            function (error) {
                self.player.alert.setup({
                    containerType: 'standalone',
                    alertType: 'danger',
                    hideAfter: 5000
                }).showMessage(error.message);
            }
        );
    }

    function playStream() {
        if (params.cmsContentId && params.usageSpecId) {
            playRequest(params.cmsContentId, params.usageSpecId);
        }
    }

    function setSettingsPanelHeight() {
        const playerEl = document.getElementById('player');
        const controlbar = playerEl.querySelector('.bmpui-ui-controlbar');
        
        if (!playerEl || !controlbar) return;

        const settingsPanel = controlbar.querySelector('.bmpui-bc-settings-panel')

        if (!settingsPanel) return;

        const maxHeight = (playerEl.offsetHeight - controlbar.offsetHeight - 24) + 'px';
        settingsPanel.style.setProperty('--max-height', maxHeight);
    }

    function preparePlayer(config) {
        var isProd = window.location.hostname === 'www.beinconnect.com.tr' ||
            window.location.hostname === 'cf-www.beinconnect.com.tr';
        var convivaLogLevels = { WARNING: 2, NONE: 4 };
        var playerConfig = {
            key: '669a4369-809d-4378-bf65-5b35f9b991a4',
            uiLanguage: 'tr',
            autoplay: true,
            conviva: {
                key: 'ceccd365fff47ef4b8016c9c274a5902896beafe',
                logLevel: convivaLogLevels.NONE,
                useDefaultMetadataDefinitions: true
            }
        };

        if (!isProd) {
            playerConfig.conviva.key = '3522c23bb736824927efc7baefc4539d4fe81bd1';
            playerConfig.conviva.gatewayURL = 'https://digiturk-test.testonly.conviva.com';
            playerConfig.conviva.logLevel = convivaLogLevels.WARNING;
        }

        self.player = bcplayer.PlayerFactory.createPlayer(playerConfig);

        self.player.conviva.endSession();
        self.player.conviva.setContentMetadata({ playerType: 'match_detail_player' });
        self.player.conviva.setAssetId(matchInfos.epgId).setViewerId(config.viewerID).setStreamType(true).setContentType('live')
            .setAssetName(matchInfos.epgTitle).setCategoryType('match').setReferringPage('match_detail')
            .setStreamType(true).setSessionStartType('default').setReferringCategory(getReferringCategory())
            .setChannelId(matchInfos.channelId).setChannelName(matchInfos.channelName).setChannelCategoryName("SPOR")
            .setUserType(config.userType).setSeriesName(leagueName).setHomeTeamId(matchInfos.homeTeamId)
            .setHomeTeamName(matchInfos.homeTeamName).setVisitorTeamId(matchInfos.awayTeamId)
            .setVisitorTeamName(matchInfos.awayTeamName).startSession();



        self.player.onReady.subscribe(function () {
            setSettingsPanelHeight();
            playStream();
        });


        self.player.onSourceLoaded.subscribe(function () {
            Utilities.logger.log('player: source loaded');
        });


        self.player.externalDevice.onOpenBroadcast.subscribe(function (externalDeviceApi, event) {
            Utilities.logger.log('player: on open broadcast', event);

            blackOutCancel(event.params.channelId, event.params.usageSpecId);
        });

        self.player.externalDevice.onCloseBroadcast.subscribe(function (externalDeviceApi, event) {
            Utilities.logger.log('player: on close broadcast', event);



            blackOutRequest(
                params.usageSpecId,
                params.channelId,
                params.eventStartTime,
                params.eventEndTime,
                params.rfsIdToBlackout,
                params.blackoutServiceAccountId
            );
        });


        self.player.onPlay.subscribe(function () {
            setSettingsPanelHeight();
        })

    }

    function getReferringCategory() {
        var refUrl = document.referrer;
        var referringCat = "";
        if (refUrl.indexOf('haftanin-maclari') > 0)
            referringCat = "spor/match_list";
        else if (refUrl.indexOf('spor') > 0)
            referringCat = "spor/match_module";
        else if (refUrl.indexOf('ana-sayfa') > 0)
            referringCat = "anasayfa/match_module";

        return referringCat;
    }

    /**
     * Initialize live tv
     * @param {{viewerID: string, userType: string}} config
     */
    self.initialize = function (config) {
        if (initialized) return self;

        prepareParams();

        if (params.nextAction[0] === "Offer") {
            offerRequest();
            
        } else {
            preparePlayer(config);

            multiPlayManager = new MultiPlayManager({
                player: self.player
            }).initialize();

            tagManager = new TagManager();
            tagManager.setPPVInfos(matchInfos);
            tagManager.attachPlayer(self.player);
            tagManager.enableHeartBeat({
                intervalInSeconds: !isNaN(parseInt(window.heartBeatFrequency)) ? parseInt(window.heartBeatFrequency) : 60
            });
            
        }





        initialized = true;

        return self;
    }
};;
