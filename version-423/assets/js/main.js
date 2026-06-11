(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  if (slides.length) {
    showSlide(0);
    startHeroTimer();
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(activeSlide - 1);
      startHeroTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(activeSlide + 1);
      startHeroTimer();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHeroTimer();
    });
  });

  var searchScopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));

  searchScopes.forEach(function (scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var emptyState = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-card-title'));
        var region = normalize(card.getAttribute('data-card-region'));
        var genre = normalize(card.getAttribute('data-card-genre'));
        var cardYear = card.getAttribute('data-card-year') || '';
        var cardType = card.getAttribute('data-card-type') || '';
        var keywordMatched = !keyword || title.indexOf(keyword) >= 0 || region.indexOf(keyword) >= 0 || genre.indexOf(keyword) >= 0;
        var yearMatched = !year || cardYear === year;
        var typeMatched = !type || cardType === type;
        var visible = keywordMatched && yearMatched && typeMatched;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount ? 'none' : 'block';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilters);
    }
  });

  var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  playerBlocks.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var playUrl = player.getAttribute('data-play-url');
    var hlsInstance = null;
    var hasLoaded = false;

    function loadVideo() {
      if (!video || !playUrl) {
        return;
      }

      if (!hasLoaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(playUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = playUrl;
        }
        hasLoaded = true;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', loadVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
