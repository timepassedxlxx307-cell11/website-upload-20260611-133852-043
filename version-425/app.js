(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      current = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));

  filterPanels.forEach(function (panel) {
    var section = panel.parentElement;
    var list = section ? section.querySelector('[data-filter-list]') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var input = panel.querySelector('[data-search]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var visibleCount = panel.querySelector('[data-visible-count]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matches(card, query, typeValue, yearValue) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';

      if (query && haystack.indexOf(query) === -1) {
        return false;
      }

      if (typeValue && cardType !== typeValue) {
        return false;
      }

      if (yearValue && cardYear !== yearValue) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      var query = normalize(input && input.value);
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var count = 0;

      cards.forEach(function (card) {
        var ok = matches(card, query, typeValue, yearValue);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          count += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(count);
      }
    }

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var message = player.querySelector('[data-player-message]');
    var stream = player.getAttribute('data-stream');
    var initialized = false;
    var hlsInstance = null;

    function showMessage(value) {
      if (!message) {
        return;
      }

      message.textContent = value;
      message.classList.add('show');
    }

    function initializeVideo() {
      if (!video || initialized || !stream) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage('视频加载失败，请稍后重试');
          }
        });
        return;
      }

      showMessage('当前浏览器暂不支持播放');
    }

    function startPlayback() {
      initializeVideo();
      player.classList.add('is-playing');

      if (video) {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showMessage('点击视频控件即可开始播放');
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
