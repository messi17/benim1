var ContentSliderViewModel = function () {

    var pageSize = 6;
    var itemWidth;
    var self = this;
    var totalRecommendationItem = 0;
    var lastPage = false;

    self.init = function () {
    };

    self.bindEvents = function () {

        var productSliders = $(".slider.slider-product");
        itemWidth = $("a.slider-item.product-item").outerWidth(true);
        var productActions = $("div.product-actions");
        var watchedThisContent = $("div.watched-this-content-product");
        var sliderRecommendationContentWrapper = productSliders.find("div.slider-content-wrapper.slider-recommendation-product-height");

        if (!isNullOrUndefined(sliderRecommendationContentWrapper))
            totalRecommendationItem = sliderRecommendationContentWrapper.find("a").length;

        productSliders.each(function () {
            var sliderContentWrapper = productSliders.find(".slider-content-wrapper");
            var slider = $(this);
            var contentSliderContainer = slider.find(".slider-container");

            var btnPrev = slider.find(".slider-button.prev");
            var btnNext = slider.find(".slider-button.next");
            var sliderMask = slider.find(".slider-content");
            var sliderWrapper = slider.find(".slider-content-wrapper");

            var items = sliderWrapper.find(".slider-item.product-item");
            var count = items.length;


            if (count > pageSize) {
                btnNext.addClass("active");
                lastPage = false;
            } else {
                lastPage = true;
            }

            btnPrev.click(function (e) {
                prevFunction(e);
            });

            btnNext.click(function (e) {
                nextFunction(e);
            });

            sliderMask.on('DOMMouseScroll mousewheel wheel', function (event) {
                var code = event.wheelDelta || event.originalEvent.wheelDeltaX;
                if (!isNullOrUndefined(code) && code != 0) {
                    switch (code) {
                        case 120:
                            prevFunction(event);
                            break;
                        case -120:
                            nextFunction(event);
                            break;
                        default:
                    }
                }
            });

            function nextFunction(e) {
                e.preventDefault();

                if (getIsLoading(slider))
                    return;

                var pageNo = getPage(slider);

                if (!hasItems(slider)) {
                    btnNext.removeClass("active");
                    return;
                }
                setIsLoading(slider, true);

                setPage(slider, pageNo + 1);

                if (hasNextPage(slider)) {
                    btnNext.addClass("active");
                    btnPrev.addClass("active");
                    lastPage = false;
                } else {
                    btnNext.removeClass("active");
                    lastPage = true;
                }

                handleNextPageMargin(slider, sliderMask, sliderWrapper);
                btnPrev.addClass("active");
            }


            function prevFunction(e) {
                e.preventDefault();

                var pageNo = getPage(slider);

                if (getIsLoading(slider) || pageNo <= 1)
                    return;

                setIsLoading(slider, true);

                setPage(slider, pageNo - 1);

                if (hasNextPage(slider)) {
                    btnNext.addClass("active");
                    btnPrev.addClass("active");
                    lastPage = false;
                } else {
                    btnNext.removeClass("active");
                    lastPage = true;
                }

                if (!hasPrevPage(slider)) {
                    btnPrev.removeClass("active");
                }

                var widthBase = (parseInt(itemWidth)) * pageSize;
                var marginLeftOfWrapper = parseInt(sliderWrapper.css("margin-left"));

                var position = marginLeftOfWrapper + widthBase;
                if (pageNo - 1 <= 1) {
                    position = 0;
                }

                sliderWrapper.animate({ "margin-left": position + "px" }, 200, function () {
                    setIsLoading(slider, false);
                });
            }

            contentSliderContainer.on({
                mouseenter: function () {

                    if (btnNext.parents(".content-others").length == 0) {
                        btnPrev.css("display", "block");
                        btnNext.css("display", "block");
                    }
                },
                mouseleave: function () {
                    if (btnNext.parents(".content-others").length == 0) {
                        btnPrev.css("display", "none");
                        btnNext.css("display", "none");
                    }
                }
            });

            var timer;
            sliderContentWrapper.on({
                mouseenter: function () {
                    var $this = $(this);
                    timer = setTimeout(function () {
                        $this.find('.detail').stop().animate({ top: 0 }, 300);
                    }, 300);
                },
                mouseleave: function () {
                    var $this = $(this);
                    clearTimeout(timer);
                    $this.find('.detail').stop().animate({ top: 207 }, 300);
                }
            }, ".slider-item");

            sliderContentWrapper.find(".slider-item.product-item").each(function () {
                var container = $(this);

                if (container.hasClass("recommendation-product-detail")) {
                    var desc = container.find(".recommendation-product-description > p");
                    desc.html(Utils.Substring(desc.text(), 85));
                } else {
                    var title = container.find("h4");
                    title.html(Utils.Substring(title.html(), 17));

                    var detail = container.find(".detail");

                    detail.find(".title").find("span").each(function () {
                        var span = $(this);
                        span.html(Utils.Substring(span.html(), 19));
                    });

                    var description = detail.find(".description");
                    description.html(Utils.Substring(description.html(), 100));
                }
            });


            sliderRecommendationContentWrapper.on({
                mouseenter: function () {
                    var $this = $(this);
                    $this.css("opacity", "0.7");
                    var button = $this.find(".recommendation-product-detail-button");
                    var action = $this.find("div.product-actions");
                    action.css("display", "block");
                    button.css("color", "#d7072a");
                },
                mouseleave: function () {
                    var $this = $(this);
                    var button = $this.find(".recommendation-product-detail-button");
                    var action = $this.find("div.product-actions");
                    action.css("display", "none");
                    button.css("color", "#fff");
                    $this.css("opacity", "1");
                }
            }, "a.slider-item.product-item.recommendation-product-detail");
        });

        productActions.on({
            click: function (e) {
                sendWebEyeEvet = false;
                e.preventDefault();
                var that = $(this);
                var id = that.attr("data-id");

                if (isNullOrUndefined(id))
                    return;

                var productDetail = that.parent("div").parent("div.recommendation-product-detail");
                var parent = productDetail.parent("a");

                $.post("/layout/recommendationSetAsViewed", AddAntiForgeryToken({ cmsContentId: id, isWatched: true }), function (response) {

                    if (!response.status) {
                        PopupMessage.Pop("form-error", PopUpTitle.Error, response.message, PopUpFooterButton.Ok);
                        return;
                    } else {
                        totalRecommendationItem--;

                        if (totalRecommendationItem == 0) {
                            parent.remove();
                            var recommendationProduct = $(".slider-content.slider-recommendation-product-height");
                            handleRecommendationItems(recommendationProduct, true);
                            var parameter = { page: 1, pageSize: 30, homePage: true };
                            var url = "/content/SliderUserJson";

                            $.get(url, parameter, function (result) {
                                loadHandlebarsScript(function () {
                                    var template = Handlebars.compile($("#template-recommendation-product-item").html());
                                    var html = template({ Products: result.Contents });
                                    sliderRecommendationContentWrapper.html();
                                    sliderRecommendationContentWrapper.css("margin-left", itemWidth * pageSize + "px");
                                    sliderRecommendationContentWrapper.css("margin-left", "0px");

                                    sliderRecommendationContentWrapper.html(html);

                                    self.bindEvents();
                                    handleRecommendationItems(recommendationProduct, false);
                                    return;
                                })
                            });
                        } else {
                            parent.animate({ right: -itemWidth + "px", width: '0%', opacity: '0.2' }, 400, "linear", function () { parent.remove(); });
                            productDetail.animate({ width: '0%' }, 400, "linear");
                            if (lastPage && totalRecommendationItem > pageSize - 1) {

                                var reTouchValue = parseInt((totalRecommendationItem - pageSize) * (-itemWidth));
                                sliderRecommendationContentWrapper.animate({ "margin-left": reTouchValue + "px" }, 400, function () {
                                });
                                return;
                            }
                            return;
                        }
                    }
                });
            },
            mouseenter: function (e) {
                var $this = $(this);
                $this.find("div.watched").css("display", "none");
                $this.find("div.watched-hover").css("display", "block");
                $this.find(watchedThisContent).css("display", "block");
            },
            mouseleave: function (e) {
                var $this = $(this);
                $this.find("div.watched").css("display", "block");
                $this.find("div.watched-hover").css("display", "none");
                $this.find(watchedThisContent).css("display", "none");
            }
        });

        watchedThisContent.on({
            mouseenter: function () {
                var $this = $(this);
                $this.css("display", "none");
            }
        });

        function handleNextPageMargin(slider, sliderMask, sliderWrapper) {

            var contentItems = sliderWrapper.find(".slider-item.product-item");
            var itemCount = contentItems.length;

            var pageNo = getPage(slider);

            var widthBase = (parseInt(itemWidth)) * pageSize;

            var retouch = 0;
            if (pageNo * pageSize > itemCount) {
                retouch = widthBase - (parseInt(itemWidth)) * (itemCount - ((pageNo - 1) * pageSize));
            }

            var marginLeftOfWrapper = parseInt(sliderWrapper.css("margin-left"));

            var widthNew = (widthBase * (pageNo + 1));
            sliderWrapper.width(widthNew);

            var position = marginLeftOfWrapper - widthBase + retouch;
            sliderWrapper.animate({ "margin-left": position + "px" }, 200, function () {
                setIsLoading(slider, false);
            });
        }

        function hasNextPage(slider) {
            var sliderWrapper = slider.find(".slider-content-wrapper");
            var contentItems = sliderWrapper.find(".slider-item.product-item");
            var itemCount = contentItems.length;

            var page = parseInt(slider.attr("data-page"));
            if (isNaN(page))
                page = 0;

            if (itemCount > pageSize * page)
                return true;

            return false;
        }

        function hasPrevPage(slider) {
            var page = parseInt(slider.attr("data-page"));
            if (isNaN(page))
                page = 1;

            if (pageSize < pageSize * page)
                return true;

            return false;
        }

        function hasItems(slider) {

            var sliderWrapper = slider.find(".slider-content-wrapper");
            var contentItems = sliderWrapper.find(".slider-item.product-item");
            var itemCount = contentItems.length;

            var page = parseInt(slider.attr("data-page"));
            if (isNaN(page)) {
                page = 1;
                setPage(slider, page);
            }

            if (pageSize * page >= itemCount)
                return false;

            return true;
        }

        function setPage(slider, page) {
            slider.attr("data-page", page);
        }

        function getPage(slider) {
            var page = parseInt(slider.attr("data-page"));
            if (isNaN(page))
                page = 1;

            return page;
        }

        function setIsLoading(slider, isLoading) {
            slider.attr("data-isloading", isLoading ? "1" : "0");
        }

        function getIsLoading(slider) {
            var isLoading = parseInt(slider.attr("data-isloading"));
            if (isNaN(isLoading))
                isLoading = 0;

            return isLoading == 1;
        }

        function handleRecommendationItems(recommendationProduct, isLoading) {
            var recommendationLoading = recommendationProduct.find("img.slider-loading");
            if (isLoading) {
                recommendationLoading.show();
            } else {
                recommendationLoading.hide();
            }
        }
    };

    self.getSlider = function (domIdToShow, domId, term, contentId, channelId, title, showHeader, showAllLink, showBorder) {

        if (domIdToShow) {
            $("#" + domIdToShow).hide();
        }

        var sliderWrapper = $("#" + domId);
        sliderWrapper.html("");

        var dataParameter = {
            showHeader: showHeader,
            showAllLink: showAllLink,
            showBorder: showBorder,
            title: title,
            pageSize: 30
        };

        if (term && (!contentId && !channelId))
            dataParameter.slug = term;
        else if (contentId && (!term && !channelId))
            dataParameter.contentId = contentId;
        else
            dataParameter.channelId = channelId;

        $.get("/content/slider", dataParameter, function (response) {

            if (response == null || response.length === 0)
                return;

            sliderWrapper.html(response);
            ImageCheck.ContentItem();

            if (domIdToShow) {
                $("#" + domIdToShow).show();
            }

            self.bindEvents(sliderWrapper);

        });
    };
}

;var SalesViewModel = function () {
    var self = this;

    self.OrderAction = { Rent: 1, Buy: 2, BuyPackage: 3 };
    var constFormId = "form-sales";

    var containerForm;

    var formContent;
    var formMessage;
    var formResult;
    var dataMode;
    var offerTimer;
    var offersRequiredMessage;
    var offersWrapper;
    var formStepOne;
    var formStepTwo;
    var playerTvArea;

    self.id = null;
    self.init = function () {

    };

    self.buildForm = function (orderAction, offerId, channelId, categoryName) {
        ViewHelper.showLoading();

        self.id = channelId;
        $.ajax({
            type: "POST",
            url: "/order/OfferSalesForm",
            data: AddAntiForgeryToken({ orderAction: orderAction, offerId: offerId, channelId: channelId, categoryName: categoryName })
        }).done(function (response) {
            ViewHelper.hideLoading();

            containerForm = $("#" + constFormId);
            containerForm.html(response);

            formContent = containerForm.find("div.player-offer");
            formStepOne = containerForm.find("div.box-inner.step-one");
            formStepTwo = containerForm.find("div.box-inner.step-two");
            formBlackout = containerForm.find("div.box-inner.step-blackout");
            formMessage = formContent.find("div.form-message");
            formResult = formContent.find("div.form-result");
            dataMode = formContent.attr("data-mode");

            playerTvArea = $(".player-tv-area");
            playerTvArea.addClass("d-none");

            $(".step-bb-click-v2").click(function () {
                localStorage.setItem(".nextact", $(".step-bb-click-v2").attr("data-category"));
            });

            var offerToBuy;
            var isThereAnyOfferToBuy = true;

            //formStepOne.addClass("d-none");
            formStepTwo.addClass("d-none");
            formBlackout.addClass("d-none");

            switch (orderAction) {
                case self.OrderAction.Buy:
                    {
                        offerToBuy = formContent.find("input[name='offertobuy']").val();
                        if (offerToBuy === false)
                            isThereAnyOfferToBuy = false;
                    }
                    break;
                case self.OrderAction.BuyPackage:
                    {
                        offersWrapper = formContent.find("div.package-offers");
                        if (offersWrapper == null || offersWrapper.length === 0) {
                            isThereAnyOfferToBuy = false;
                        }
                        else {
                            offersRequiredMessage = offersWrapper.attr("data-required");
                            var offers = offersWrapper.find(".arrow-select-position");
                            offers.click(function (e) {
                                e.preventDefault();
                                var offerItem = $(this);
                                offerToBuy = offerItem.attr("data-id");
                            });
                        }
                    }
                    break;
            }


            if (isThereAnyOfferToBuy === false) {
                var cancelButton = containerForm.find(".form-footer").find("a[data-action='0']");
                cancelButton.hide();
                containerForm.find(".form-footer").removeClass("two-buttons");
            }

            containerForm.find(".chosen").click(function (e) {
                e.preventDefault();

                var link = $(this);
                var verification = link.attr("data-verification");
                switch (verification) {
                    case "False":
                        {
                            ViewHelper.showLoading();
                            ViewHelper.showOverlay();

                            $.ajax({
                                type: "POST",
                                url: "/order/processoffer",
                                data: AddAntiForgeryToken({ offerId: offerToBuy })
                            }).done(function (responseOrder) {


                                ViewHelper.hideLoading();
                                ViewHelper.hideOverlay();

                                switch (responseOrder.status) {
                                    //case -3:
                                    //case -2:
                                    //case -1:
                                    case 0:
                                        {
                                            // message
                                            //alert("Hata");
                                            //$("#player-controls").addClass("d-none");
                                            $(".confirmation-area .d-flex").before("<div class='txt-color-red w-100 verifySmsMessage'>" + responseOrder.message + "</div>");
                                        }
                                        break;
                                    case 1:
                                        {
                                            // message
                                            location.reload();
                                        }
                                        break;
                                    default:
                                        {
                                            $(".play-request-cancel-text").removeClass("d-none").find(".package__text span").html(responseOrder.message);
                                            $('html, body').animate({ scrollTop: ($(".play-request-cancel-text").parent().offset().top - 200) }, 800);
                                            setTimeout(function () { window.location.reload()},5000);
                                            break;
                                        }
                                }

                            });
                        }
                        break;
                    case "True":
                        {
                            ViewHelper.showLoading();
                            ViewHelper.showOverlay();

                            $.ajax({
                                type: "POST",
                                url: "/order/sendverificationprocessoffer",
                                data: AddAntiForgeryToken({ offerId: offerToBuy, smsVerification: dataMode })
                            }).done(function (responseOrder) {

                                ViewHelper.hideLoading();
                                ViewHelper.hideOverlay();

                                switch (responseOrder.status) {
                                    case -3:
                                    case -2:
                                    case -1:
                                    case 0:
                                        {
                                            $(".box-offer").find(".package-offers").next().html("");
                                            $(".box-offer").find(".package-offers").after("<div class='txt-color-red'>" + responseOrder.message + "</div>");
                                        }
                                        break;
                                    case 1:
                                        {
                                            formStepOne.addClass("d-none");
                                            formStepTwo.find(".offer-detail-message").html(responseOrder.message);
                                            formStepTwo.removeClass("d-none");
                                            timer(responseOrder.keyDuration);
                                        }
                                        break;
                                }

                            });
                        }
                        break;
                }


            });

            $(".step-two-click").click(function () {

                var confirmationInput = $(".confirmation-input");

                if (!validateCode(confirmationInput)) {
                    return;
                }

                ViewHelper.showLoading();
                ViewHelper.showOverlay();

                $.ajax({
                    type: "POST",
                    url: "/account/VerificationCode",
                    data: AddAntiForgeryToken({
                        code: confirmationInput.val(),
                        captcha: null,
                        verificationFor: 1,
                        verificationForVersion: true
                    })
                }).done(function (orderVerificationResult) {

                    ViewHelper.hideLoading();
                    ViewHelper.hideOverlay();

                    switch (orderVerificationResult.status) {
                        case 1:
                            {
                                formStepOne.addClass("d-none");
                                formStepTwo.addClass("d-none");
                                formBlackout.addClass("d-none");
                                playerTvArea.removeClass("d-none");

                                // Mustafa
                                location.reload();
                                break;
                            }
                        default:
                            {
                                // Hata 
                                //alert(orderVerificationResult.model.FormResult);
                                $(".confirmation-area .d-flex").before("<div class='txt-color-red w-100 verifySmsMessage'>" + orderVerificationResult.model.FormResult + "</div>");
                                setTimeout(function () { $(".confirmation-area").find(".verifySmsMessage").remove(); }, 3000)
                                break;
                            }
                    }
                });
            });

            $(".match-return-back-offer").click(function () {
                $('.verification-error').addClass('d-none');
                formStepOne.removeClass("d-none");
                formStepTwo.addClass("d-none");
            });
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("Error OfferSalesForm", errorThrown);
            ViewHelper.hideOverlay();
            ViewHelper.hideLoading();

            $(".play-request-cancel-text").removeClass("d-none").find(".package__text span").html("Sorun ile karşılaşıldı lütfen daha sonra deneyiniz.");
            $('html, body').animate({ scrollTop: ($(".play-request-cancel-text").parent().offset().top - 200) }, 800);

            setTimeout(function () {$(".play-request-cancel-text").addClass("d-none") }, 7000);
        });

        setTimeout(function () {
            $(".resend-section").click(function () {
                reSendCode();
            });
        }, 3000);
    };

    function validateCode(input) {
        var result = false;
        var validItem = ValidationHelper.IsNullOrEmptyString(input.val()) === false;

        if (validItem) {
            result = true;
            $('.verification-error').addClass('d-none');
        } else {
            result = false;
            $('.confirm-box-code .verification-error').removeClass('d-none');
        }

        return result;
    }

    function handleFormSummary(addOrDelete, type, message) {

        var item = formResult.find("p." + type);

        if (addOrDelete == 1) {
            if (item.length == 0) {
                formResult.append("<p class='error " + type + "'><span class='sp sp-icon-red-dot'>!</span>" + message + "</p>");
            }
        } else {
            if (item.length == 1)
                item.remove();
        }

        if (formResult.find("p").length > 0)
            formResult.show();
        else
            formResult.hide();
    }

    function timer(duration) {
        var offerDuration = $(".offer-duration");
       
        if (offerTimer == null) {
            offerTimer = new Timer();
            offerTimer.addEventListener('secondsUpdated',
                function (e) {
                    var totalSecond = offerTimer.getTotalTimeValues().seconds;
                    if (totalSecond === 0) {
                        $(".resend-section").children().removeClass("d-none");
                        $(".confirmation-text").addClass("d-none");
                        $(".step-two-click").addClass("d-none");
                        $('.confirm-box-code .verification-error').addClass('d-none');
                    }
                    offerDuration.html(offerTimer.getTimeValues().toString(['minutes', 'seconds']));
                });
            offerTimer.start({ countdown: true, startValues: { minutes: 0, seconds: duration } });
        } else {
            offerTimer.reset();
        }
    }

    function reSendCode() {

        ViewHelper.showOverlay();
        ViewHelper.showLoading();

        $.ajax({
            type: "POST",
            url: "/Account/ReSendVerificationCode",
            data: AddAntiForgeryToken({ smsVerification: 3 })
        }).done(function (responseResend) {
            ViewHelper.hideLoading();
            ViewHelper.hideOverlay();

            if (responseResend == null) {
                return;
            }

            if (responseResend.status) {
                $(".resend-section").children().addClass("d-none");
                $(".confirmation-text").removeClass("d-none");
                $(".verification-code").removeClass("d-none");
                $(".step-two-click").removeClass("d-none");
                timer(responseResend.keyDuration);
                return;
            }

            if (responseResend.NeedLogin) {
                confirmationInput
                window.location = response.LoginUrl;
            } else {
                // Hata
                if (newError) {
                    newError = false;
                    var starContainer = document.querySelector('.package-offer-one');
                    var spanEl = document.createElement('span');
                    spanEl.innerText = response.message;
                    spanEl.style.color = 'red';
                    spanEl.style.marginTop = '16px';
                    spanEl.style.paddingLeft = '25px';
                    starContainer.insertAdjacentElement('afterend', spanEl);
                }
                setTimeout(function () {
                    newError = true;
                    spanEl.remove();
                }, errorLastingDuration);

            }

        });
    }
};
;var timerInterval;

var VerificationCodeViewModel = function () {
    var self = this;

    self.For = { Order: 1, BlackoutRequest: 2, BlackoutCancel: 3 };
    var okButton;
    var constFormId = "form-verification";
    var constFormClass = "modal modal-verification";

    var formItems = { Code: 1, Captcha: 2, FormResult: 4 };
    var errorField;

    var loadingForm;
    var containerForm;
    var captchaContainer;
    var form;
    var formFooter;
    var formResult;
    var txtCode;
    var counter;
    var timer;
    var resendText;
    var resendCode;

    self.init = function () { };

    self.orderCompleted = null;

    self.buildVerificationForm = function (forWhat, keyDuration, dataMode) {
        ViewHelper.showOverlay();
        ViewHelper.showLoading();

        window.clearInterval(timerInterval);

        $.ajax({
            type: "GET",
            url: "/account/VerificationCodeForm",
            data: {}
        }).done(function (response) {
            ViewHelper.hideLoading();
            $("body").append("<div id='" + constFormId + "' class='" + constFormClass + "'>");

            containerForm = $("#" + constFormId);
            containerForm.html(response);

            form = containerForm.find("form");
            form.submit(function (e) {
                e.preventDefault();
            });
            formResult = containerForm.find("div.form-result");
            $(".form-content").attr("data-mode", dataMode);
            formFooter = containerForm.find("div.form-footer");
            loadingForm = containerForm.find("img.loading-form");
            captchaContainer = $(".captcha-container.padding-spacer");
            txtCode = form.find("input[name='code']");
            resendCode = $("#resend-code");
            txtCode.blur(function () {
                validateCode(false);
            });
            txtCode.keypress(function () {
                handleErrorStates(formItems.Code, false);
                handleErrorStates(formItems.FormResult, false);
            });

            counter = $(".timer-duration");
            timer = $(".timer");
            resendText = $(".resend");
            okButton=$(".form-footer.two-buttons").find("a[data-action='" + 1 + "']");


            var detailedTime = TimerCounterHelper.GetTimeDetail(parseInt(keyDuration));
            var mins = detailedTime[0];
            var seconds = detailedTime[1];
            TimerCounterHelper.WriteTimer(mins, seconds, counter, null);
            TimerCounterHelper.CountDown(mins, seconds, counter, null, resendCode, resendText, timer, timerInterval);

            if (captchaContainer.attr("data-val-show") === "1") {
                CaptchaHelper.Render(captchaContainer, self.captchaCallback);
            }

            var isClickable = true;
            containerForm.find(".form-footer").find("a").click(function (e) {
                if (isClickable) {
                    isClickable = false;
                    e.preventDefault();

                    var link = $(this);

                    var action = parseInt(link.attr("data-action"));

                    switch (action) {
                        case 0:
                            {
                                containerForm.remove();
                                ViewHelper.hideOverlay();
                            }
                            break;
                        case 1:
                            {
                                errorField = null;

                                var isValidCode = validateCode(true);
                                var isValidCaptcha = validateCaptcha();

                                if (isValidCode && isValidCaptcha) {

                                    loadingForm.fadeIn();

                                    $.ajax({
                                        type: "POST",
                                        url: "/account/VerificationCode",
                                        data: AddAntiForgeryToken({ code: txtCode.val(), captcha: CaptchaHelper.GetValue(captchaContainer), verificationFor: forWhat })
                                    }).done(function (responseOrder) {
                                        loadingForm.fadeOut();
                                        var model = responseOrder.model;

                                        switch (responseOrder.status) {

                                            case -3:
                                            case -2:
                                            case -1:
                                            case 0:
                                                {
                                                    if (model.ShowCaptcha) {
                                                        CaptchaHelper.Render(captchaContainer, self.captchaCallback);
                                                    }

                                                    if (model.ValidationCode.Status == -1) {
                                                        handleErrorStates(formItems.Code, true, model.ValidationCode.Message);
                                                    } else {
                                                        handleErrorStates(formItems.Code, false);
                                                    }

                                                    if (model.ValidationCaptcha.Status == -1) {
                                                        handleErrorStates(formItems.Captcha, true, model.ValidationCaptcha.Message);
                                                        CaptchaHelper.ModeError(captchaContainer);
                                                    } else {
                                                        handleErrorStates(formItems.Captcha, false);
                                                        CaptchaHelper.ModeValid(captchaContainer);
                                                    }

                                                    if (model.FormResult) {
                                                        handleErrorStates(formItems.FormResult, true, model.FormResult);
                                                    } else {
                                                        handleErrorStates(formItems.FormResult, false);
                                                    }
                                                    isClickable = true;
                                                }
                                                break;
                                            case 1:
                                                {
                                                    handleErrorStates(formItems.FormResult, false);
                                                    $(".form-content:last").remove();
                                                    formResult.html(model.FormResult);
                                                    formResult.show();
                                                    form.remove();
                                                    formFooter.remove();

                                                    if (self.orderCompleted !== "undefined" && self.orderCompleted != null) {
                                                        self.orderCompleted();
                                                    }

                                                    if (self.verificationCompleted !== "undefined" && self.verificationCompleted != null) {
                                                        containerForm.remove();
                                                        ViewHelper.hideOverlay();
                                                        self.verificationCompleted();

                                                    } else {

                                                        setTimeout(function () {

                                                            containerForm.fadeOut();
                                                            window.location = document.location;

                                                        }, 5000);
                                                    }


                                                }
                                                break;
                                        }

                                    });
                                } else {
                                    isClickable = true;
                                }

                                if (errorField != null)
                                    errorField.focus();
                                
                            }
                            break;
                        case -1:
                            {
                                e.preventDefault();
                            }
                            break;
                    }
                }

            });

            resendCode.click(function (e) {
                e.preventDefault();
                var dataAction = resendCode.attr("data-action");
                resendCode.attr("data-action", 0);
                var action = parseInt(dataAction);
                switch (action) {
                    case 0:
                        e.preventDefault();
                        break;
                    case 1:
                        var mode = $(".form-content").attr("data-mode");
                        reSendCode(mode);
                        break;
                    default:
                        e.preventDefault();
                };
            });
        });
    };

    self.verificationCompleted = null;

    self.captchaCallback = function (response) {
        CaptchaHelper.SetValue(captchaContainer, response);
    };

    function reSendCode(mode) {
        loadingForm.fadeIn();

        $.ajax({
            type: "POST",
            url: "/Account/ReSendVerificationCode",
            data: AddAntiForgeryToken({ smsVerification: mode })
        }).done(function (response) {
            loadingForm.fadeOut();
            if (response == null) {
                return;
            }

            if (response.NeedLogin) {
                window.location = response.LoginUrl;
            }

            if (response.status) {
                okButton.css("opacity", "");
                okButton.attr('data-action', 1);
                resendCode.attr("data-action", 0);
                timer.css("border", 'none');
                counter.css("color", "");
                resendText.css("color", "#3f3f3f");
                var totalKeyDuration = parseInt(response.keyDuration);
                var detailedTime = TimerCounterHelper.GetTimeDetail(parseInt(totalKeyDuration));
                var mins = detailedTime[0];
                var seconds = detailedTime[1];
                TimerCounterHelper.WriteTimer(mins, seconds, counter, null);
                TimerCounterHelper.CountDown(mins, seconds, counter, null, resendCode, resendText, timer, timerInterval);
            } else {
                $(".form-result").css("display", "block");
                $(".form-result").append('<p class="error x-code">' + response.message + '</p>');
            }
        });
    }

    function validateCode(isClicked) {
        var result = false;

        var item = txtCode.val();
        var validItem = ValidationHelper.IsNullOrEmptyString(item) == false;

        if (validItem) {
            result = true;
            handleErrorStates(formItems.Code, false);
        } else {
            result = false;
            if (isClicked) {
                handleErrorStates(formItems.Code, true, txtCode.data("val-required"));
                if (errorField == null)
                    errorField = txtCode;
            }
        }

        return result;
    }

    function validateCaptcha() {

        var isOk = CaptchaHelper.Check(captchaContainer);

        if (isOk) {
            handleErrorStates(formItems.Captcha, false);
        } else {
            handleErrorStates(formItems.Captcha, true, captchaContainer.attr("data-val-required"));
        }

        return isOk;
    }

    function handleFormSummary(addOrDelete, type, message) {

        var item = formResult.find("p." + type);

        if (addOrDelete == 1) {
            if (item.length == 0) {
                formResult.append("<p class='error " + type + "'><span class='sp sp-icon-red-dot'>!</span>" + message + "</p>");
            }
        } else {
            if (item.length == 1)
                item.remove();
        }

        if (formResult.find("p").length > 0)
            formResult.show();
        else
            formResult.hide();
    }

    function handleErrorStates(formItem, showMe, message) {
        switch (formItem) {
            case formItems.Code:
                {
                    if (showMe) {
                        txtCode.addClass("error");
                        handleFormSummary(1, "x-code", message);
                    } else {
                        txtCode.removeClass("error");
                        handleFormSummary(0, "x-code");
                    }
                }
                break;
            case formItems.Captcha:
                {
                    if (showMe) {
                        handleFormSummary(1, "x-captcha", message);
                    } else {
                        handleFormSummary(0, "x-captcha");
                    }
                }
                break;
            case formItems.FormResult:
                {
                    if (showMe) {
                        handleFormSummary(1, "x-form-result", message);
                    } else {
                        handleFormSummary(0, "x-form-result");
                    }
                }
                break;
        }
    }
};
;function MultiplayViewModel () {
    var self = this;

    self.timer = null;

    self.init = function () { };

    self.checkMultiplay = function (playerDomId) {
        clearInterval(self.timer);
        self.timer = setInterval(function () { check(playerDomId); }, 1000 * 60 * 4);
    };

    function check(playerDomId) {

        try {
            AnalyticsHelper.Event("keep-alive", "check-multiplay", null, null);

        } catch (e) {

        }

        $.post("", function (response) {
            console.log(response);
            if (response == null || response.Status)
                return;

            if (response.isNoContent) {

                $('video').trigger('pause');
                $("#form-blackout").addClass("d-none");
                $("#form-sales").removeClass("d-none");
                $(".player-tv-area").addClass("d-none");
                $("#player-controls").addClass("d-none");

                $(".play-request-cancel-text").removeClass("d-none").find(".package__text span").html(response.Message);
                $('html, body').animate({ scrollTop: ($(".play-request-cancel-text").parent().offset().top - 200) }, 800);

                return;
            }

            $("#" + playerDomId).replaceWith($("<div/>", { id: playerDomId }));
            localStorage.setItem("headerErrorData", response.Message);


            clearInterval(self.timer);
            location.href = "/";
        });
    }
};;
function FollowUpViewModel () {
    var self = this;

    self.timer = null;

    self.init = function () { };

    self.clearInterval = function() {
        clearInterval(self.timer);
    };

    self.setFollowUp = function (referenceId, label, playAttributes) {
        self.clearInterval();

        if (isNullOrUndefined(label))
            label = "Play";
        if (isNullOrUndefined(playAttributes))
            playAttributes = null;

        self.timer = setInterval(function () { followUp(referenceId, label, playAttributes); }, 1000 * 60 * 2);
    };

    function followUp(referenceId, label, playAttributes) {

        try {
            if (!isNullOrUndefined(wrapper) && !isNullOrUndefined(wrapper.player)) {
                playAttributes.duration = parseInt(wrapper.player.getDuration());
                playAttributes.elapsed = parseInt(wrapper.player.getCurrentTime());
            }
        } catch (e) {
            // ignore
        } 

        CsTrackerHelper.Event(CsTrackerActionType.FollowUp, referenceId, label, null, playAttributes
            , null);
    }
};;
