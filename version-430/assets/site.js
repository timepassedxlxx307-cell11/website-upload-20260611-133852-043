(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]"));
    blocks.forEach(function (block) {
      var input = block.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(block.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(block.querySelectorAll("[data-movie-card]"));
      var currentType = "";

      if (block.dataset.urlQuery && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get(block.dataset.urlQuery);
        if (query) {
          input.value = query;
        }
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var searchable = (card.dataset.search || "").toLowerCase();
          var type = card.dataset.type || "";
          var typeMatch = !currentType || type.indexOf(currentType) !== -1 || searchable.indexOf(currentType.toLowerCase()) !== -1;
          var termMatch = !term || searchable.indexOf(term) !== -1;
          card.hidden = !(typeMatch && termMatch);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          currentType = button.dataset.filterValue || "";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector("[data-player-cover]");
      var streamUrl = shell.dataset.streamUrl;
      var started = false;
      var hls = null;

      if (!video || !streamUrl) {
        return;
      }

      function playVideo() {
        shell.classList.add("is-playing");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      function start() {
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
          }
        } else {
          playVideo();
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function setupScrollPlayer() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        var player = document.querySelector("[data-player]");
        if (player) {
          player.scrollIntoView({ behavior: "smooth", block: "center" });
          var cover = player.querySelector("[data-player-cover]");
          if (cover) {
            cover.click();
          }
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupScrollPlayer();
  });
})();
