var theatreModeActive = false;
var theatremodeIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMjQiIGhlaWdodD0iMjQiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTE0LjMzMzMzLDI4LjY2NjY3Yy03LjkxOTE3LDAgLTE0LjMzMzMzLDYuNDE0MTcgLTE0LjMzMzMzLDE0LjMzMzMzdjc4LjgzMzMzYzAsNy45MTkxNyA2LjQxNDE3LDE0LjMzMzMzIDE0LjMzMzMzLDE0LjMzMzMzaDQzdjcuMTY2NjdjMCwzLjk1NiAzLjIxMDY3LDcuMTY2NjcgNy4xNjY2Nyw3LjE2NjY3aDQzYzMuOTU2LDAgNy4xNjY2NywtMy4yMTA2NyA3LjE2NjY3LC03LjE2NjY3di03LjE2NjY3aDQzYzcuOTE5MTcsMCAxNC4zMzMzMywtNi40MTQxNyAxNC4zMzMzMywtMTQuMzMzMzN2LTc4LjgzMzMzYzAsLTcuOTE5MTcgLTYuNDE0MTcsLTE0LjMzMzMzIC0xNC4zMzMzMywtMTQuMzMzMzN6TTE0LjMzMzMzLDQzaDE0My4zMzMzM3Y3OC44MzMzM2gtMTQzLjMzMzMzeiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+';

if (jwplayer()) {
    var videoPlayer = jwplayer();
    var videoPlayerWrapper = videoPlayer.getContainer();

    var videoPlayerWidth = videoPlayer.getWidth();
    var videoPlayerHeight = videoPlayer.getHeight();
    var videoPlayerWrapperPosition = videoPlayerWrapper.style.position;
    var videoPlayerWrapperTop = videoPlayerWrapper.style.top;
    var videoPlayerWrapperLeft = videoPlayerWrapper.style.left;
    var videoPlayerWrapperZindex = videoPlayerWrapper.style.zIndex;

    function switchTheatreMode() {
        let isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null);
        if (theatreModeActive == false && !isInFullScreen) {
            videoPlayerWrapper.style.position = 'fixed';
            videoPlayerWrapper.style.top = 0;
            videoPlayerWrapper.style.left = 0;
            videoPlayerWrapper.style.zIndex = 9999;
            resizePlayer(window.innerWidth, window.innerHeight);
            theatreModeActive = true;
        } else if (theatreModeActive == false && isInFullScreen) {
            if (isInFullScreen) {
                document.exitFullscreen();
            }
            videoPlayerWrapper.style.position = 'fixed';
            videoPlayerWrapper.style.top = 0;
            videoPlayerWrapper.style.left = 0;
            videoPlayerWrapper.style.zIndex = 9999;
            resizePlayer(window.innerWidth, window.innerHeight);
            theatreModeActive = true;
        } else {
            if (isInFullScreen) {
                document.exitFullscreen();
            }
            videoPlayerWrapper.style.position = videoPlayerWrapperPosition;
            videoPlayerWrapper.style.top = videoPlayerWrapperTop;
            videoPlayerWrapper.style.left = videoPlayerWrapperLeft;
            videoPlayerWrapper.style.zIndex = videoPlayerWrapperZindex;
            resizePlayer(videoPlayerWidth, videoPlayerHeight);
            theatreModeActive = false;
        }
    }

    function resizePlayerWhenActive() {
        if (theatreModeActive == true) {
            resizePlayer(window.innerWidth, window.innerHeight);
        }
    }

    function resizePlayer(width, height) {
        videoPlayer.resize(width, height);
    }

    if (videoPlayerWrapper) {
        if (theatreModeActive == false) {
            var controlBarPresent = videoPlayer.getControls();
            if (controlBarPresent) {
                videoPlayer.addButton(theatremodeIcon, 'Switch theatre mode on/off', switchTheatreMode, 'theatreModeButton');
                window.addEventListener('resize', resizePlayerWhenActive);
            }
        }
    }
}