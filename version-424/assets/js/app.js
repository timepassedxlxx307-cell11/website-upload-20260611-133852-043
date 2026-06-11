(function () {
  "use strict";

  var body = document.body;
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      body.classList.toggle("nav-open", mobileNav.classList.contains("is-open"));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        if (!Number.isNaN(index)) {
          show(index);
          start();
        }
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var grid = root.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var input = panel.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
      var reset = panel.querySelector("[data-filter-reset]");
      var count = panel.querySelector("[data-result-count]");
      var empty = root.querySelector("[data-empty-state]");

      function currentFilters() {
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter-select")] = normalize(select.value);
        });
        filters.query = normalize(input ? input.value : "");
        return filters;
      }

      function matchCard(card, filters) {
        var searchable = normalize(card.getAttribute("data-search"));
        var title = normalize(card.getAttribute("data-title"));
        var region = normalize(card.getAttribute("data-region"));
        var type = normalize(card.getAttribute("data-type"));
        var year = normalize(card.getAttribute("data-year"));
        var genre = normalize(card.getAttribute("data-genre"));

        if (filters.query && searchable.indexOf(filters.query) === -1 && title.indexOf(filters.query) === -1) {
          return false;
        }
        if (filters.region && region !== filters.region) {
          return false;
        }
        if (filters.type && type !== filters.type) {
          return false;
        }
        if (filters.year && year !== filters.year) {
          return false;
        }
        if (filters.genre && genre.indexOf(filters.genre) === -1) {
          return false;
        }
        return true;
      }

      function applyFilters() {
        var filters = currentFilters();
        var visible = 0;
        cards.forEach(function (card) {
          var show = matchCard(card, filters);
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "显示 " + visible + " / " + cards.length + " 部";
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          applyFilters();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      applyFilters();
    });
  }

  function loadHls(video, src, status) {
    if (!video || !src) {
      if (status) {
        status.textContent = "未找到播放源";
      }
      return Promise.reject(new Error("missing video or source"));
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      video._hlsInstance = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      return new Promise(function (resolve, reject) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (status) {
            status.textContent = "播放源加载完成";
          }
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (status) {
              status.textContent = "播放源加载异常，请刷新重试";
            }
            reject(new Error(data.type || "hls error"));
          }
        });
      });
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (status) {
        status.textContent = "使用浏览器原生 HLS 播放";
      }
      return Promise.resolve();
    }

    video.src = src;
    if (status) {
      status.textContent = "当前浏览器可能需要 HLS 支持组件";
    }
    return Promise.resolve();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play-trigger]");
      var status = player.querySelector("[data-player-status]");
      var src = player.getAttribute("data-m3u8");
      var initialized = false;

      function play() {
        var ready = initialized ? Promise.resolve() : loadHls(video, src, status);
        initialized = true;
        ready.then(function () {
          player.classList.add("is-playing");
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              if (status) {
                status.textContent = "浏览器阻止了自动播放，请再次点击播放按钮";
              }
              player.classList.remove("is-playing");
            });
          }
        }).catch(function () {
          player.classList.remove("is-playing");
        });
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHero();
    initFilters();
    initPlayers();
  });
})();
