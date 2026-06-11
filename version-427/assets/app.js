(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      });
    });
    timer = setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initSearch() {
    var input = document.getElementById("siteSearch");
    var year = document.getElementById("yearFilter");
    var region = document.getElementById("regionFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
    var results = document.getElementById("globalSearchResults");
    if (!input && !year && !region) {
      return;
    }
    function textOf(item) {
      return [
        item.getAttribute("data-title"),
        item.getAttribute("data-year"),
        item.getAttribute("data-region"),
        item.getAttribute("data-tags"),
        item.getAttribute("data-category")
      ].join(" ").toLowerCase();
    }
    function renderGlobal(query) {
      if (!results || !window.SEARCH_INDEX || query.length < 1) {
        if (results) {
          results.classList.remove("is-active");
          results.innerHTML = "";
        }
        return;
      }
      var list = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [item.title, item.year, item.region, item.type, item.category, item.tags].join(" ").toLowerCase();
        return haystack.indexOf(query) !== -1;
      }).slice(0, 18);
      results.innerHTML = list.map(function (item) {
        return "<a class=\"search-result-link\" href=\"" + escapeHtml(item.url) + "\">" +
          "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\">" +
          "<span><strong>" + escapeHtml(item.title) + "</strong><em>" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.category) + "</em></span>" +
          "</a>";
      }).join("");
      results.classList.toggle("is-active", list.length > 0);
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
      renderGlobal(query);
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (region) {
      region.addEventListener("change", apply);
    }
  }

  function attachSource(video, source, onReady) {
    if (!source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", source);
      }
      onReady();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          onReady();
        });
        video._hlsInstance = hls;
      } else {
        onReady();
      }
      return;
    }
    if (!video.getAttribute("src")) {
      video.setAttribute("src", source);
    }
    onReady();
  }

  function initPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector(".player-start");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-m3u8");
      function playVideo() {
        if (button) {
          button.classList.add("is-hidden");
        }
        attachSource(video, source, function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        });
      }
      if (button) {
        button.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
