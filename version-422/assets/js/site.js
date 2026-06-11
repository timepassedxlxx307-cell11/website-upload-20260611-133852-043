(function () {
  const menuButton = document.querySelector('[data-mobile-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    }, { once: true });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  const filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    const searchInput = filterScope.querySelector('[data-filter-search]');
    const yearSelect = filterScope.querySelector('[data-filter-year]');
    const typeSelect = filterScope.querySelector('[data-filter-type]');
    const regionSelect = filterScope.querySelector('[data-filter-region]');
    const cards = Array.from(filterScope.querySelectorAll('[data-movie-card], [data-rank-row]'));
    const emptyState = filterScope.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function includesText(value, keyword) {
      return String(value || '').toLowerCase().includes(keyword);
    }

    function applyFilters() {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();

        const matchedKeyword = !keyword || includesText(haystack, keyword);
        const matchedYear = !year || card.getAttribute('data-year') === year;
        const matchedType = !type || card.getAttribute('data-type') === type;
        const matchedRegion = !region || card.getAttribute('data-region') === region;
        const matched = matchedKeyword && matchedYear && matchedType && matchedRegion;

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
