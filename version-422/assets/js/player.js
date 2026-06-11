(function () {
  function setupMoviePlayer(source) {
    const player = document.querySelector('[data-player-box]');
    if (!player || !source) {
      return;
    }

    const video = player.querySelector('video');
    const layer = player.querySelector('[data-play-layer]');
    let loaded = false;
    let hls = null;

    function bindSource() {
      if (loaded || !video) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      bindSource();
      if (layer) {
        layer.hidden = true;
      }
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (layer) {
            layer.hidden = false;
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
