// Глобальная переменная для текущего тайлового слоя
var currentTileLayer = null;

// Функция для смены подложки карты
function switchMapTiles(isDark) {
  if (!map) return;
  
  // Удаляем старый тайловый слой, если он есть
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }
  
  // Выбираем подложку в зависимости от темы
  var tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  
  // Создаем и добавляем новый слой
  currentTileLayer = L.tileLayer(tileUrl, {
    attribution: "\u00a9 OSM, CARTO",
    maxZoom: 19
  }).addTo(map);
  
  if (markersGroup) {
    markersGroup.bringToFront();
  }
}

// Закрыть мобильное меню
function closeMobile() {
  document.getElementById("mobileMenu").classList.remove("show");
}

// Общая функция обновления (вызывается при изменении фильтров или поиска)
function update() {
  var filtered = getFiltered();
  renderFilters();
  renderActiveTags();
  renderMap(filtered);
  updateStats(filtered);
  if (markersGroup.getLayers().length > 0) {
    try {
      var b = markersGroup.getBounds();
      if (b.isValid()) map.fitBounds(b, { padding: [30, 30], maxZoom: 16 });
    } catch (e) {}
  }
}

// Инициализация навигации и страниц
function initNavigation() {
  document.querySelectorAll(".nav-item").forEach(function(el) {
    el.addEventListener("click", function(e) {
      e.preventDefault();
      var pg = el.dataset.page;
      document.querySelectorAll(".nav-item").forEach(function(n) { n.classList.remove("active"); });
      el.classList.add("active");
      document.querySelectorAll(".page").forEach(function(p) { p.classList.remove("active"); });
      document.getElementById("page-" + pg).classList.add("active");
      document.getElementById("navCounter").style.display = pg === "map" ? "block" : "none";
      var mapEl = document.getElementById("map");
      var sidebar = document.querySelector(".sidebar");
      if (pg === "map") {
        mapEl.style.visibility = "visible";
        sidebar.style.visibility = "visible";
        setTimeout(function() { map.invalidateSize(); }, 100);
      } else {
        mapEl.style.visibility = "hidden";
        sidebar.style.visibility = "hidden";
      }
    });
  });

  document.getElementById("burgerBtn").addEventListener("click", function() {
    document.getElementById("mobileMenu").classList.toggle("show");
  });

  document.getElementById("sidebarToggle").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("show");
    this.textContent = document.querySelector(".sidebar").classList.contains("show") ? "Скрыть фильтры" : "Фильтры";
  });

  document.getElementById("searchInput").addEventListener("input", function(e) {
    searchQuery = e.target.value.trim();
    update();
  });
}

// Обновление иконок на всех кнопках темы
function updateAllThemeIcons(isDark) {
  const allBtns = document.querySelectorAll('#themeToggle, #themeToggleMobile');
  allBtns.forEach(btn => {
    const lightIcon = btn.querySelector('.theme-icon-light');
    const darkIcon = btn.querySelector('.theme-icon-dark');
    if (lightIcon && darkIcon) {
      if (isDark) {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
      } else {
        lightIcon.style.display = 'block';
        darkIcon.style.display = 'none';
      }
    }
  });
}

// Функция для переключения темы
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('#themeToggle, #themeToggleMobile');
  if (!toggleBtns.length) return;
  
  // Проверяем сохраненную тему в localStorage
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Устанавливаем тему при загрузке
  const isDarkStart = savedTheme === 'dark' || (!savedTheme && prefersDark);
  if (isDarkStart) {
    document.documentElement.classList.add('dark');
    updateAllThemeIcons(true);
    // Устанавливаем темную подложку карты 
    setTimeout(function() { switchMapTiles(true); }, 100);
  } else {
    document.documentElement.classList.remove('dark');
    updateAllThemeIcons(false);
    // Устанавливаем светлую подложку карты
    setTimeout(function() { switchMapTiles(false); }, 100);
  }
  
  // Обработчик клика для всех кнопок
  toggleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateAllThemeIcons(isDark);
      
      // Меняем подложку карты
      switchMapTiles(isDark);
      
      // Обновляем размер карты 
      setTimeout(function() {
        if (map && typeof map.invalidateSize === 'function') {
          map.invalidateSize();
        }
      }, 100);
    });
  });
}

// Инициализация всей страницы
function init() {
  initMap();           // создаем карту (без подложки)
  initNavigation();    // настройка меню
  initGlossary();      // глоссарий
  renderInfographics(); // графики
  initTable();         // таблица и фильтры (ДОБАВИТЬ ЭТУ СТРОКУ)
  initThemeToggle();   // кнопка переключения темы
  update();            // обновляем все
}

// Запуск после загрузки страницы
window.addEventListener("DOMContentLoaded", init);