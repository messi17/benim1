var MultiPlayManager=function(n){var t=this;if(!n||!n.player)return t;var u={endpoint:"",data:{},checkIntervalInSeconds:240},r=null,e=!1,i=n.player,h=n.endpoint||u.endpoint,c=n.data||u.data,f=isNaN(n.checkIntervalInSeconds)||n.checkIntervalInSeconds<0?u.checkIntervalInSeconds:n.checkIntervalInSeconds,o=n.checkCallback,l=function(n){if(Utilities.logger.log("MultiPlayManager: check success",n),typeof o=="function"&&o(n),!n.Status){n.isNoContent;var t=1e4;i.conviva.reportPlaybackFailed(n.Message);i.unload();i.alert.setup({containerType:"standalone",alertType:"danger",hideAfter:t}).showMessage(n.Message);setTimeout(function(){window.location.href="/"},t)}},s=function(n){Utilities.logger.error("MultiPlayManager: check error",n)};t.check=function(){Utilities.makeFetch().fetch({endpoint:h,requestParams:{method:"POST",body:Utilities.serialize(c)}},function(n){n.json().then(l).catch(s)},s)};t.start=function(){t.stop();f!==0&&(r=setInterval(t.check,1e3*f))};t.stop=function(){r&&(clearInterval(r),r=null)};t.initialize=function(){return e||!i?t:(f!==0&&(i.onError.subscribe(t.stop),i.onDestroy.subscribe(t.stop),i.onSourceUnloaded.subscribe(t.stop),i.onSourceLoaded.subscribe(t.start)),e=!0,t)}},BlackOutManager=function(n){function c(n){Utilities.logger.log("BlackOutManager: black out cancel success",n);switch(n.Status){case o.Ok:if(typeof u=="function")try{u({message:n.Message})}catch(r){}break;default:var i=new Error(n.Message||t);i.name=="BlackOutCancelError";throw i;}}function s(n){if(Utilities.logger.log("BlackOutManager: black out cancel error",n),typeof f=="function")try{f({message:n.name==="BlackOutCancelError"?n.message:t})}catch(i){}}function l(n){Utilities.logger.log("BlackOutManager: blackout request success",n);switch(n.Status){case o.Ok:if(typeof i=="function")try{i({message:n.Message})}catch(u){}break;default:var r=new Error(n.Message||t);r.name="BlackOutRequestError";throw r;}}function h(n){if(Utilities.logger.log("BlackOutManager: blackout request error",n),typeof r=="function")try{r({message:n.name==="BlackOutRequestError"?n.message:t})}catch(i){}}var e=this,o={Ok:1,Error:10,Authentication:20,SessionExpired:21},i=null,r=null,u=null,f=null,t="Bir hata oluştu. Lütfen daha sonra tekrar deneyin";e.blackOutCancel=function(t,i,r,e){u=r;f=e;Utilities.makeFetch().fetch({endpoint:n.boCancelUrl,requestParams:{method:"POST",body:Utilities.serialize({channelId:t,usageSpecId:i,usageSpecId:i})}},function(n){n.json().then(c).catch(s)},s)};e.blackOutRequest=function(t,u,f,e,o,s,c,a){i=c;r=a;Utilities.makeFetch().fetch({endpoint:n.boActivateUrl,requestParams:{method:"POST",body:Utilities.serialize(AddAntiForgeryToken({usageSpecId:t,channelId:u,eventStartTime:f,eventEndTime:e,rfsIdToBlackout:o,blackOutServiceAccountId:s,serviceAccountId:s}))}},function(n){n.json().then(l).catch(h)},h)}},OfferManager=function(n){function l(n){f?f.error(n):(f=Utilities.alert.inline().error(n),Utilities.DOM.find("#bc-offer-views").before(f.dom))}function d(){f&&f.error("")}function g(n){e?e.error(n):(e=Utilities.alert.inline().error(n),h.after(e.dom))}function lt(){e&&e.error("")}function at(n){p.alert.setup({containerType:"cover",alertType:"info"}).showHTML(n);bt()}function rt(n){Utilities.logger.error(n);p.alert.setup({containerType:"standalone",alertType:"error",hideAfter:5e3}).showMessage(o)}function dt(n){Utilities.logger.log("send verification code for process offer response",n);u.hideLoading();var t={SessionKeyInvalid:-2,Error:-1,UnSuccessful:0,Success:1};switch(n.status){case t.SessionKeyInvalid:case t.Error:case t.UnSuccessful:l(n.message||o);break;case t.Success:d();s.html(n.message);ri();ct({duration:n.keyDuration})}}function ft(n){Utilities.logger.error(n);u.hideLoading();l(o)}function gt(n){Utilities.logger.log("resend verification code success",n);t.hideLoading();n.status?ct({duration:n.keyDuration}):l(n.message||o)}function ot(n){Utilities.logger.error("resend verification code error",n);t.hideLoading();l(o)}function ni(n){Utilities.logger.log("send confirmation code success",n);t.hideLoading();switch(n.status){case{SessionKeyInvalid:-2,Error:-1,UnSuccessful:0,Success:1}.Success:location.reload();break;default:d();g(n.model.FormResult)}}function ht(n){Utilities.logger.log("send confirmation code error",n);t.hideLoading();g(o)}var y=this,et,st;if(y.OrderActionType={Rent:1,Buy:2,BuyPackage:3},!n||!n.player)return y;var p=n.player,a=null,i=null,r=null,s=null,tt=null,u=null,f=null,t=null,e=null,h=null,it=null,c=null,w=null,b=null,k=null,v=null,o="Bir hata oluştu. Lütfen daha sonra tekrar deneyin";y.buildForm=function(n){Utilities.makeFetch().fetch({endpoint:n.endpoint||"/order/OfferSalesFormNew",requestParams:{method:"POST",body:Utilities.serialize(AddAntiForgeryToken(n.data||{}))}},function(n){n.text().then(at).catch(rt)},rt)};var vt=function(){var n=this;kt({offerId:n.getAttribute("data-offerId"),smsVerificationEnabled:n.getAttribute("data-verification-enabled")==="1",smsVerificationMode:n.getAttribute("data-verification-mode")})},yt=function(){var n=h.value().trim();if(n===""){g("Onay Kodu giriniz!");return}ti()},pt=function(){ut(!0);st()},wt=function(){ut();ii()},bt=function(){var n,f,e;if(i=p.alert.getDomElement(),i&&i.length!==0){if(i=Utilities.DOM.wrap(i.get(0)),n=i.find("[data-category]"),n){Utilities.store.setItem(".nextact",n.attribute("data-category"));return}if(s=i.find(".offer-detail-message p"),r=i.find("input[name=__RequestVerificationToken]"),r=r?r.value():null,s&&(tt=s.html()),u=i.find("#bc-offer-view-package-list"),u&&(f=u.findAll(".package-item-offer-link"),f.length!==0))for(e of f)e.on("click",vt);if(t=i.find("#bc-offer-view-sms-verification"),t){if(h=t.find(".confirmation-code-input"),it=t.find("#confirmation-remaining-time"),c=t.find("#confirmation-code-send"),c)c.on("click",yt);if(k=t.find(".confirmation-error-time-up"),w=t.find("#confirmation-code-resend"),w)w.on("click",pt);if(b=t.find("#bc-btn-cancel-sms-verification"),b)b.on("click",wt)}}},ut=function(n){nt();h.value("");d();lt();c.removeClass("bc-player-hidden");k.addClass("bc-player-hidden");n||s.html(tt)},kt=function(n){(Utilities.logger.log("offer selected",n),n.offerId)&&(a=n,a.smsVerificationEnabled?et():processOffer())};et=function(){u.showLoading();var n={offerId:a.offerId,smsVerification:a.smsVerificationMode};Utilities.makeFetch().fetch({endpoint:"/order/sendverificationprocessoffer",requestParams:{method:"POST",body:Utilities.serialize(r?Utilities.addAntiForgeryToken(r,n):AddAntiForgeryToken(n))}},function(n){n.json().then(dt).catch(ft)},ft)};st=function(){var n={smsVerification:{PackageOrder:3}.PackageOrder};t.showLoading();Utilities.makeFetch().fetch({endpoint:"/Account/ReSendVerificationCode",requestParams:{method:"POST",body:Utilities.serialize(r?Utilities.addAntiForgeryToken(r,n):AddAntiForgeryToken(n))}},function(n){n.json().then(gt).catch(ot)},ot)};var ti=function(){var n={code:h.value().trim(),verificationFor:{Order:1,BlackoutRequest:2,BlackoutCancel:3}.Order,verificationForVersion:!0};t.showLoading();Utilities.makeFetch().fetch({endpoint:"/account/VerificationCode",requestParams:{method:"POST",body:Utilities.serialize(r?Utilities.addAntiForgeryToken(r,n):AddAntiForgeryToken(n))}},function(n){n.json().then(ni).catch(ht)},ht)},ii=function(){u&&(t&&t.addClass("bc-player-hidden"),u.removeClass("bc-player-hidden"))},ri=function(){t&&(u&&u.addClass("bc-player-hidden"),t.removeClass("bc-player-hidden"))},ct=function(n){var r=n.duration||240,t=r,i;nt();i=function(){if(t<0)nt(),l("Onay kodu süresi sona erdi"),c.addClass("bc-player-hidden"),k.removeClass("bc-player-hidden");else{var n=Math.floor(t/60),r=n<10?"0":"",i=Math.floor(t%60),u=i<10?"0":"";it.html(r+n+":"+u+i)}t--};v=setInterval(i,1e3);i()},nt=function(){v&&(clearInterval(v),v=null)}},TagManager=function(){window.dataLayer=window.dataLayer||[];window.netmera=window.netmera||[];var n=null,c=(new Date).getTime(),s=!1,o=null,l=30,a=!0,f=!1,i={},h={LIVE:"PLAYER_LIVE",VOD:"PLAYER_VOD",TRAILER:"PLAYER_TRAILER",PPV:"PLAYER_PPV"},r={PLAY:"PLAY",PAUSED:"PAUSED",FULLSCREEN_ENTER:"FULLSCREEN_ENTER",FULLSCREEN_EXIT:"FULLSCREEN_EXIT",MUTED:"MUTED",UNMUTED:"UNMUTED",VOLUME_CHANGED:"VOLUME_CHANGED",VIDEO_QUALITY_CHANGED:"VIDEO_QUALITY_CHANGED",TIMESHIFT:"TIMESHIFT"},t={PLAY:"videoPlay",PAUSED:"videoPause",RESUME:"videoResume",FULLSCREEN_ENTER:"videoGoFullScreen",FULLSCREEN_EXIT:"videoExitFullScreen",VIDEO_QUALITY_CHANGED:"videoChangeRes"},u=function(t,u){var l="click",e="player/{{PLAYER-CONTENT-TYPE}}",s="",a="",p=window.location.href,v=0,y,c,o;n.isLive()&&(y=n.channels.getCurrentItem(),c=n.tvGuide.getCurrentItem(),e=e.replace("{PLAYER-CONTENT-TYPE}",f?h.PPV:h.LIVE),v=n.timeShift().toFixed(),a=f?i.channelName+" \\ "+i.epgTitle:y.item.name+" \\ "+(c?c.item.title:"Untitled"));s=t+" | "+v+" | "+a+" | "+p;t===r.VIDEO_QUALITY_CHANGED&&(o=u.targetVideoQuality,e=e.replace("player/","player/floating/"),l="select",s="Video Quality | "+o.width+"x"+o.height+", "+o.bitrate+"bps");dataLayer.push({event:"playerEvent",eventAction:l,eventCategory:e,eventLabel:s})},e=function(i,r){var u=0,f;n.isLive()&&(u=n.timeShift());switch(i){case t.PLAY:case t.PAUSED:case t.RESUME:dataLayer.push({event:i,currentProgress:Utilities.secondsToTime(u),currentProgressRate:"0.00"});break;case t.FULLSCREEN_ENTER:dataLayer.push({event:i,currentProgress:Utilities.secondsToTime(u),currentProgressRate:"0.00",isFullScreen:"Yes"});break;case t.FULLSCREEN_EXIT:dataLayer.push({event:i,currentProgress:Utilities.secondsToTime(u),currentProgressRate:"0.00",isFullScreen:"No"});break;case t.VIDEO_QUALITY_CHANGED:f=r.targetVideoQuality;dataLayer.push({event:i,currentProgress:Utilities.secondsToTime(u),currentProgressRate:"0.00",videoResolution:f.width+"x"+f.height+", "+f.bitrate+"bps"})}},ut=function(){var r="player/{{PLAYER-CONTENT-TYPE}}",u="",e,t;console.log("ppvinfos",i+" "+f);n.isLive()&&(e=n.channels.getCurrentItem(),t=n.tvGuide.getCurrentItem(),r=r.replace("{PLAYER-CONTENT-TYPE}",f?h.PPV:h.LIVE),u=f===!1?c+" | "+e.item.id+" | "+(t?t.item.id+" \\ "+t.item.title:"")+" | "+n.timeShift().toFixed():c+" | "+i.channelId+" | "+(i.epgId+" \\ "+i.epgTitle)+" | "+n.timeShift().toFixed());dataLayer.push({event:"playerEvent",eventAction:"heartBeat",eventCategory:r,eventLabel:u})},ft=function(){var u={};if(f===!1){var t=n.tvGuide.getCurrentItem(),r=n.channels.getCurrentItem(),e="",o=r.item.name,s=t.item.seriesName;t&&(e=t.item.id,o=t.item.title.toLowerCase());u={code:"zyr",eb:o,et:r.item.categoryName,eg:r.item.name,ee:""+e,ea:""+r.item.id,en:"live_tv",ef:"live_channel",ei:"play",ev:"web",fo:s}}else u={code:"zyr",eb:i.epgTitle,et:"SPOR",eg:i.channelName,ee:""+i.epgId,ea:""+i.channelId,en:"match_detail",ef:"live_match",ei:"play",ev:"web"};netmera.push(function(n){n.sendEvent(u)})},y=function(){s&&et();a?(a=!1,ft(),e(t.PLAY)):e(t.RESUME);u(r.PLAY)},p=function(){s&&v();u(r.PAUSED);e(t.PAUSED)},w=function(){u(r.FULLSCREEN_ENTER);e(t.FULLSCREEN_ENTER)},b=function(){u(r.FULLSCREEN_EXIT);e(t.FULLSCREEN_EXIT)},k=function(){u(r.MUTED)},d=function(){u(r.UNMUTED)},g=function(){u(r.VOLUME_CHANGED)},nt=function(n,i){u(r.VIDEO_QUALITY_CHANGED,i);e(t.VIDEO_QUALITY_CHANGED,i)},tt=function(){u(r.TIMESHIFT)},it=function(){a=!0},rt=function(){var t=n.channels.getCurrentItem();t&&dataLayer.push({componentInfo:"sushi/Canlı TV",pageType:"canli-tv",itemIndex:""+n.channels.getItems().indexOf(t),itemTitle:t.item.name,targetUrl:window.location.href})},et=function(){o&&v();o=setInterval(ut,l*1e3)},v=function(){o&&(clearInterval(o),o=null)};this.updatePlayerSessionId=function(n){c=n};this.attachPlayer=function(t){n&&this.detachPlayer();n=t;n.onPlay.subscribe(y);n.onPaused.subscribe(p);n.onFullScreenEnter.subscribe(w);n.onFullScreenExit.subscribe(b);n.onMuted.subscribe(k);n.onUnmuted.subscribe(d);n.onVolumeChanged.subscribe(g);n.onVideoQualityChanged.subscribe(nt);n.onTimeShift.subscribe(tt);n.onSourceLoaded.subscribe(it);n.channels.onChannelSelected.subscribe(rt)};this.detachPlayer=function(){n&&(n.onPlay.unsubscribe(y),n.onPaused.unsubscribe(p),n.onFullScreenEnter.unsubscribe(w),n.onFullScreenExit.unsubscribe(b),n.onMuted.unsubscribe(k),n.onUnmuted.unsubscribe(d),n.onVolumeChanged.unsubscribe(g),n.onVideoQualityChanged.unsubscribe(nt),n.onTimeShift.unsubscribe(tt),n.onSourceLoaded.unsubscribe(it),n.channels.onChannelSelected.unsubscribe(rt),n=null)};this.enableHeartBeat=function(n){l=n&&n.intervalInSeconds?n.intervalInSeconds:60;s=!0};this.disableHeartBeat=function(){v();s=!1};this.setPPVInfos=function(n){f=!0;i=n}},EPGManager=function(){var t={},n=[],i=null,r=function(n){return parseInt(n.substr(6),10)},f=function(){n=n.sort(function(n,t){var i=0;return n.EndTime<t.EndTime?i=-1:n.EndTime>t.EndTime&&(i=1),i})},e=function(t){var r,i;for(f(),r=[],i=0;i<n.length;i++)if(r.push(n[i]),n[i].EndTime>t)break;return r},o=function(t){var f=t.map(function(n){return n.ContentId}),i=function(n){console.log("EPG ERROR",n);u()},e=function(t){for(var i=0;i<t.length;i++)n=n.filter(function(n){return n.ContentId!==t[i].ContentId}),t[i].EndTime=r(t[i].EndTime),n.push(t[i]);u()};Utilities.makeFetch().fetch({endpoint:"/tvnew/tvguidenow?c="+f.join(","),requestParams:{method:"GET"}},function(n){n.json().then(e).catch(i)},i)},u=function(){var r,n,t;(i!==null&&clearTimeout(i),r=(new Date).getTime(),n=e(r),n.length!==0)&&(t=n[n.length-1].EndTime-r,console.log("SETTING UP NEW EPG TIMER",t),i=setTimeout(function(){o(n)},t<0?6e4:t))};return t.initialize=function(t){var i=JSON.parse(JSON.stringify(t));n=i.map(function(n){return n.EndTime=r(n.EndTime),n})},t.getChannelProgram=function(t){var i=n.filter(function(n){return n.ContentId==t});return i.length>0?i[0]:null},t}(),LiveTV=function(){function h(){var n="",t=window.location.hostname.toLowerCase();switch(t){default:n="https://castleblack.digiturk.com.tr"}return n}function tt(n){var t=window.location.protocol.indexOf("https")>-1;return t&&n.indexOf("http://")===0&&(n=n.replace("http://","https://"),n.indexOf("switch")>-1&&(n+=n.indexOf("?")>-1?"&secure=1":"?secure=1")),n}function y(){var n=window.location.pathname.split("/");if(n.length===3)return n[n.length-1]}function c(t){var i=n.player.getBufferingOverlay();i&&(t?i.show():i.hide())}function p(n){return n?n.map(function(n){return{id:n.EPGBroadcastId,time:parseInt(n.BeginTime.substr(6),10),categoryName:n.ProgramTypeTitle,title:n.ProgramName,duration:n.DurationCalculated,seriesName:n.SeriesName,seasonNo:n.SeasonNo,seasonTitle:n.SeasonName,episodeNo:n.EpisodeNo,episodeTitle:n.EpisodeName,genres:n.Genres,leagueName:n.LeagueName,homeTeamId:n.HomeTeamId,homeTeamName:n.HomeTeamName,visitorTeamId:n.VisitorTeamId,visitorTeamName:n.VisitorTeamName}}):[]}function it(e,l){var v=n.player.channels.getCurrentItem(),it,p,w,g,y,b,a,k,nt,d;if(!l||l===v.item.id){it=r;r=0;s=e.ServerTicks?e.ServerTicks:(new Date).getTime();i.updatePlayerSessionId(s);e.Streams&&e.Streams.length>1?(p=e.Streams.filter(function(n){return n.Label.toUpperCase()==="ORIJINAL"}),w=e.Streams.filter(function(n){return n.Label.toUpperCase()==="DUBLAJLI"}),p.length>0&&w.length>0?(p=p[0],w=w[0],n.player.dubSub.setup({dubOption:{id:w.StreamId},subOption:{id:p.StreamId},selected:e.StreamToPlay.StreamId})):n.player.dubSub.cleanUp()):n.player.dubSub.cleanUp();e.Action!==t.Play&&c(!1);switch(e.Action){case t.Login:window.location="/kullanici/giris?r="+encodeURI(window.location.pathname);break;case t.Offer:n.player.conviva.reportPlaybackFailed("Not Entitled");o=new OfferManager({player:n.player});o.buildForm({data:{orderAction:o.OrderActionType.BuyPackage,offerId:null,channelId:v.item.id}});break;case t.None:case t.SessionExpired:case t.NotEntitled:case t.LicenseNotStarted:case t.NoCdnUrl:case t.Fraud:case t.Error:g=e.Message||"Bir hata oluştu, lütfen daha sonra tekrar deneyin";n.player.conviva.reportPlaybackFailed(g);n.player.alert.setup({containerType:"cover",alertType:"danger"}).showMessage(g);break;case t.BlackOut:n.player.externalDevice.showCloseBroadcast(e.Blackout.Message,{isVerificationRequired:e.Blackout.IsVerificationRequired,eventStartTime:e.EventStartTime,eventEndTime:e.EventEndTime,rfsIdToBlackout:e.RfsIdToBlackout,blackoutServiceAccountId:e.BlackOutServiceAccountId});break;case t.Play:if(y=e.StreamToPlay,!y||!y.Url)break;b=tt(y.Url);a={};switch(y.StreamFormat){case u.DASH:a.dash=b;break;case u.HLS:a.hls=b;break;case u.SS:a.smooth=b}if(y.IsDrm){k=e.DrmTicket.replace("ticket=","");switch(e.DrmType){case f.Widevine:a.drm={widevine:{LA_URL:h()+"/api/widevine/license?version=1.0",headers:{Authorization:"Bearer "+e.CastleBlackToken,"X-CB-Ticket":k},licenseRequestRetryDelay:1e3,maxLicenseRequestRetries:5,videoRobustness:"SW_SECURE_CRYPTO",audioRobustness:"SW_SECURE_CRYPTO",prepareLicense:function(n){var f={license:n.license},t,r,u,i;try{if(t=JSON.parse(String.fromCharCode.apply(null,n.license)),t&&t.License&&t.Status==="OK"){for(r=window.atob(t.License),u=new Uint8Array(new ArrayBuffer(r.length)),i=0;i<r.length;i++)u[i]=r.charCodeAt(i);f.license=u}}catch(e){}return f}}};break;case f.FairPlay:a.drm={fairplay:{LA_URL:h()+"/api/fairplay/license?version=1.0",headers:{Authorization:"Bearer "+e.CastleBlackToken,"X-CB-Ticket":k,"X-CB-ContentId":y.AssetId,"Content-Type":"application/json"},certificateURL:h()+"/api/fairplay/certificate?version=1.0",certificateHeaders:{Authorization:"Bearer "+e.CastleBlackToken},prepareMessage:function(n){var t={Spc:n.messageBase64Encoded};return JSON.stringify(t)},prepareContentId:function(n){var r=n.split("/"),t=r[r.length-1],i;return t.indexOf("?")>-1&&(i=t.split("?"),i.length>1&&(t=i[0])),t},prepareLicense:function(n){var t=JSON.parse(n);return t.Result}}};break;case f.PlayReady:a.drm={playready:{LA_URL:"https://digiturk-drm.ercdn.com/playready/rightsmanager.asmx?op=AcquireLicense",headers:{"X-ErDRM-Message":k},licenseRequestRetryDelay:1e3,maxLicenseRequestRetries:10}}}}a.title=v.item.name;v.item.customData&&v.item.customData.no&&(nt=EPGManager.getChannelProgram(v.item.customData.no),nt&&(a.title=nt.ProgramName,a.description=v.item.name));d=e.Blackout;d!=null&&d.HasBlackout&&d.HasRightToCancel?n.player.externalDevice.setOpenBroadcastParams({channelId:v.item.id,usageSpecId:v.item.customData?v.item.customData.usageSpecId:undefined}):n.player.externalDevice.setOpenBroadcastParams(null);a.options={startOffset:it};e.MultiplaySessionKey&&n.player.conviva.setPlaySessionId(e.MultiplaySessionKey);n.player.conviva.setDefaultResource(y.CdnTypeString).setStreamURL(b).setContentInfo();n.player.load(a)}}}function w(t,i){var f=n.player.channels.getCurrentItem(),u;i&&i!==f.item.id||(u="LiveTV: play request error.",t&&(u+=typeof t=="string"?t:t.message),n.player.conviva.setContentInfo().reportPlaybackFailed(u),c(!1),r=0)}function l(t,i){c(!0);Utilities.makeFetch().fetch({endpoint:"/tv/playrequest",requestParams:{method:"POST",body:Utilities.serialize(Utilities.addAntiForgeryToken(null,{usageSpecId:916794,channelId:t,streamId:i,playRequestType:g.Channel}))}},function(n){n.json().then(function(n){it(n,t)}).catch(function(n){w(n,t)})},function(n){w(n,t)});Irdeto.init(t,n.player)}function rt(t,i){v.blackOutCancel(t,i,function(t){n.player.alert.setup({containerType:"standalone",alertType:"warning",hideAfter:5e3}).showMessage(t.message);n.player.externalDevice.setOpenBroadcastParams()},function(t){n.player.alert.setup({containerType:"standalone",alertType:"danger",hideAfter:5e3}).showMessage(t.message)})}function ut(t,i,r,u,f,e){v.blackOutRequest(t,i,r,u,f,e,function(){l(n.player.channels.getCurrentItem().item.id)},function(t){n.player.conviva.reportPlaybackFailed(t.message);n.player.alert.setup({containerType:"standalone",alertType:"danger",hideAfter:5e3}).showMessage(t.message)})}function ft(t){t.Channels.length>0&&(e=t.DefaultChannelId,EPGManager.initialize(t.Channels.filter(function(n){return!!n.Program}).map(function(n){return n.Program})),n.player.channels.load(t.Channels.map(function(n){return{id:n.Id,name:n.Name,categoryName:n.CategoryName,logo:n.Logo,customData:{no:n.No,slug:!n.Slug?null:n.Slug.toLowerCase()}}})))}function b(){}function et(){Utilities.makeFetch().fetch({endpoint:"https://5p0gkqai0rc5fqt4jmsminx5eqk2.requestly.me/channels",requestParams:{method:"GET"}},function(n){n.json().then(ft).catch(b)},b)}function ot(t){t.length>0&&n.player.tvGuide.load(p(t))}function k(){}function st(n){n&&Utilities.makeFetch().fetch({endpoint:"/tvnew/tvguide?channelnumber="+n,requestParams:{method:"GET"}},function(n){n.json().then(ot).catch(k)},k)}function d(){const n=document.getElementById("player"),t=n.querySelector(".bmpui-ui-controlbar");if(n&&t){const i=t.querySelector(".bmpui-bc-settings-panel");if(i){const r=n.offsetHeight-t.offsetHeight-24+"px";i.style.setProperty("--max-height",r)}}}function ht(t){var c=window.location.hostname==="www.todtv.com.tr"||window.location.hostname==="cf-www.todtv.com.tr",f={WARNING:2,NONE:4},i={key:"047ddde8-7d3f-4355-959a-4dc51ec5b10e",uiLanguage:"tr",autoplay:!0,conviva:{key:"ceccd365fff47ef4b8016c9c274a5902896beafe",logLevel:f.NONE,useDefaultMetadataDefinitions:!0}};c||(i.conviva.key="3522c23bb736824927efc7baefc4539d4fe81bd1",i.conviva.gatewayURL="https://digiturk-test.testonly.conviva.com",i.conviva.logLevel=f.WARNING);n.player=bcplayer.PlayerFactory.createPlayer(i);n.player.onReady.subscribe(function(){});n.player.onSourceLoaded.subscribe(function(){d()});n.player.onPlay.subscribe(function(){d()});var o=function(i,r){n.player.conviva.setViewerId(t.viewerID).setUserType(t.userType).setReferringPage("live_tv").setReferringCategory("CANLI TV").setChannelId(i.id).setChannelName(i.name).setChannelCategoryName(i.categoryName).setAssetName(i.name).setStreamType(!0).setContentType("live").setSessionStartType("default");r&&r.referringPage&&n.player.conviva.setReferringPage("player");n.player.conviva.setContentMetadata({playerType:"live_tv_player"})},s=function(t,i){n.player.conviva.setAssetId(t.id).setAssetName(t.title).setContentLength(t.duration).setCategoryType(t.categoryName).setSeriesName(t.seriesName).setSeasonName(t.seasonTitle).setSeasonNumber(t.seasonNo).setEpisodeNumber(t.episodeNo).setEpisodeName(t.episodeTitle).setGenreList(t.genres);i&&i.sessionStartType&&n.player.conviva.setSessionStartType(i.sessionStartType);t.leagueName?n.player.conviva.setSeriesName(t.leagueName).setHomeTeamId(t.homeTeamId).setHomeTeamName(t.homeTeamName).setVisitorTeamId(t.visitorTeamId).setVisitorTeamName(t.visitorTeamName):t.seriesName&&t.seasonNo&&t.episodeNo&&t.episodeTitle&&n.player.conviva.setAssetName(t.seriesName+" - "+t.seasonNo+".S:B"+t.episodeNo+" - "+t.episodeTitle)},h=!1,u=!1;n.player.channels.onChannelsLoaded.subscribe(function(t,i){var u=y(),r;u?(r=i.filter(function(n){return n.item.customData&&n.item.customData.slug&&n.item.customData.slug.toUpperCase()===u.toUpperCase()}),r&&r.length>0&&n.player.channels.setCurrentItemById(r[0].id)):e&&n.player.channels.setCurrentItemById(e)});n.player.channels.onChannelSelected.subscribe(function(t,i){var r,e,f,c,a,v;n.player.unload();n.player.tvGuide.unload();r=i.item;n.player.alert.hide();e=y();r.customData.slug&&e!==r.customData.slug&&(f=window.location.href,f=e?f.replace(e,r.customData.slug):f+(f.lastIndexOf("/")===f.length-1?"":"/")+r.customData.slug,window.history.replaceState(null,"",f));c={};h?c.referringPage="player":h=!0;n.player.conviva.endSession();o(r,c);r.customData.no&&(a=EPGManager.getChannelProgram(r.customData.no),a?(v=p([a])[0],s(v)):n.player.conviva.setContentLength(-1),st(r.customData.no));n.player.conviva.startSession();l(r.id);u=!1});n.player.tvGuide.onProgramsLoaded.subscribe(function(){u=!1});n.player.tvGuide.onProgramChanged.subscribe(function(t,i){var r,f;if(n.player.titleBar&&(r=i.item.item,n.player.titleBar.getTitleLabel().setText(r.title),f=n.player.channels.getCurrentItem().item,n.player.titleBar.getDescriptionLabel().setText(f.name)),!u){u=!0;return}var e=n.player.channels.getCurrentItem(),h=i.item,c=i.issuer==="timeshift-api"||i.issuer==="tv-guide-list"?"dvr":"epg_change",l=n.player.conviva.getPlaySessionId(),a=n.player.conviva.getDefaultResource(),v=n.player.conviva.getStreamURL();n.player.conviva.endSession();o(e.item);s(h.item,{sessionStartType:c});n.player.conviva.startSession();n.player.conviva.setDefaultResource(a).setStreamURL(v).setPlaySessionId(l).setContentInfo()});n.player.dubSub.onOptionSelected.subscribe(function(t,i){var u=n.player.channels.getCurrentItem();u&&(r=n.player.timeShift(),n.player.conviva.endSession(!0,!0).startSession(),l(u.item.id,i.id))});n.player.externalDevice.onOpenBroadcast.subscribe(function(n,t){rt(t.params.channelId,t.params.usageSpecId)});n.player.externalDevice.onCloseBroadcast.subscribe(function(t,i){var r=n.player.channels.getCurrentItem();ut(undefined,r?r.item.id:undefined,i.params.eventStartTime,i.params.eventEndTime,i.params.rfsIdToBlackout,i.params.blackoutServiceAccountId)});n.player.onError.subscribe(function(){})}var n=this,u={DASH:1,SS:2,HLS:3,MP4:4},f={PlayReady:1,Widevine:2,FairPlay:3},g={PPV:1,Channel:2},t={None:0,Play:1,Login:10,SessionExpired:11,NotEntitled:30,LicenseNotStarted:31,NoCdnUrl:32,MultiPlay:40,TicketError:41,Offer:50,ParentalControl:60,Error:100,BlackOut:200,Fraud:300,ShowPreAgreement:400},a=!1,e=null,nt=null,o=null,v=!BlackOutManager?null:new BlackOutManager({boCancelUrl:"/tv/blackoutcancel",boActivateUrl:"/tv/blackoutrequest"}),i=null,s=(new Date).getTime(),r=0;n.initialize=function(t){if(a)return n;ht(t);nt=new MultiPlayManager({player:n.player}).initialize();var r=parseInt(window.heartBeatFrequency);return i=new TagManager,i.attachPlayer(n.player),i.enableHeartBeat({intervalInSeconds:isNaN(r)?60:r}),et(),a=!0,n}}
