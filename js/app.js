// Главная функция обновления
function update() {
  const filtered = getFiltered();
  renderFilters();
  renderActiveTags();
  renderMap(filtered);
  updateStats(filtered);
  
  // Подгонка карты
  if (markersGroup && markersGroup.getLayers().length > 0) {
    try {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid() && window.map) {
        window.map.fitBounds(bounds, getResponsiveFitOptions(16));
      }
    } catch (e) {}
  }
}

function getResponsiveFitOptions(maxZoom) {
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  return {
    paddingTopLeft: [30, 30],
    paddingBottomRight: [30, mobile ? 96 : 30],
    maxZoom
  };
}

// Инициализация приложения
function initApp() {
  initFiltersState();
  initMap();
  initNavigation();
  initBurger();
  initSearch();
  initTable();
  initGlossary();
  initOrientationWarning();
  initSidebarDrag();
  renderInfographics();
  update();
  initThemeToggle();
  
  // Небольшая задержка для позиционирования карты
  setTimeout(() => {
    if (markersGroup && markersGroup.getLayers().length > 0 && window.map) {
      try {
        const bounds = markersGroup.getBounds();
        if (bounds.isValid()) window.map.fitBounds(bounds, getResponsiveFitOptions(14));
      } catch (e) {}
    }
  }, 300);
}

// Переключение тёмной темы
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  
  const lightIcon = toggle.querySelector(".theme-icon-light");
  const darkIcon = toggle.querySelector(".theme-icon-dark");
  
  // Проверяем сохранённую тему
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    if (lightIcon) lightIcon.style.display = "none";
    if (darkIcon) darkIcon.style.display = "block";
  }
  
  toggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    
    if (isDark) {
      if (lightIcon) lightIcon.style.display = "none";
      if (darkIcon) darkIcon.style.display = "block";
      localStorage.setItem("theme", "dark");
    } else {
      if (lightIcon) lightIcon.style.display = "block";
      if (darkIcon) darkIcon.style.display = "none";
      localStorage.setItem("theme", "light");
    }
    
    // Обновляем карту
    if (window.map) {
      setTimeout(() => window.map.invalidateSize(), 100);
    }
  });
}



// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", initApp);



