(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var value = Number(dot.getAttribute("data-hero-dot"));
                show(value);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var scope = form.closest("section") || document;
            var search = form.querySelector("[data-filter-search]");
            var region = form.querySelector("[data-filter-region]");
            var year = form.querySelector("[data-filter-year]");
            var type = form.querySelector("[data-filter-type]");
            var empty = scope.querySelector("[data-empty-result]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            if (!cards.length) {
                cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            }

            function apply() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var selectedRegion = region ? region.value : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var match = true;

                    if (q && haystack.indexOf(q) === -1) {
                        match = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        match = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        match = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        match = false;
                    }

                    card.classList.toggle("is-hidden", !match);
                    if (match) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            [search, region, year, type].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });

            form.addEventListener("reset", function () {
                window.setTimeout(apply, 0);
            });
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        ready(function () {
            var player = document.querySelector("[data-player]");
            if (!player) {
                return;
            }
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var started = false;
            var hls;

            function loadAndPlay() {
                if (!video || !sourceUrl) {
                    return;
                }
                if (!started) {
                    started = true;
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = sourceUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(sourceUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = sourceUrl;
                    }
                    video.controls = true;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        started = false;
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                        if (hls) {
                            hls.destroy();
                            hls = null;
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    loadAndPlay();
                });
            }

            player.addEventListener("click", function () {
                if (!started) {
                    loadAndPlay();
                }
            });
        });
    };

    ready(function () {
        initMobileNav();
        initHeroSlider();
        initFilters();
    });
})();
