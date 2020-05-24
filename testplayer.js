var video, context, player;
var manifest, laurl, videoPlayerWrapper;
var g_laurlOverride = "";

function playSelectedStream() {
    manifest = document.getElementById("txtManifest").value;
    laurl = document.getElementById("txtLAURL").value.trim();

    g_laurlOverride = laurl;

    var video, context, player;
    videoPlayerWrapper.innerHTML = "<div style=\"background-color:#EFEFFF;\"><video id=\"videoPlayer\" controls=\"true\" /></div>";

    if (player != null) {
        player.reset();
    }

    video = document.getElementById("videoPlayer");

    var protectionData = new MediaPlayer.vo.protection.ProtectionData(laurl, null, null);
    var protData;
    if (laurl == "")
    {
        protData = null;
    }
    else
    {
        protData = { 'com.microsoft.playready': protectionData };
    }   

    player = new MediaPlayer(new MediaPlayer.di.Context());
    //player.startup();

    var stream = {
        url: manifest,
        protData: protData
    };
    player.init(video);
    player.load(stream);

    videoPlayerWrapper.style.display = "block";
}

function loaded() {
    videoPlayerWrapper = document.getElementById("videoPlayerWrapper");
    videoPlayerWrapper.style.display = "none";
}

window.onload = loaded;