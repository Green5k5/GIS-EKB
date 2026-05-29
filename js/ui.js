// Навигация между страницами
function initNavigation() {
  document.querySelectorAll(".nav-item").forEach(el => {
    el.addEventListener("click", function(e) {
      e.preventDefault();
      const pg = this.dataset.page;
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      this.classList.add("active");
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      document.getElementById("page-" + pg).classList.add("active");
      
      const navCounter = document.getElementById("navCounter");
      if (navCounter) navCounter.style.display = pg === "map" ? "block" : "none";
      
      const mapEl = document.getElementById("map");
      const sidebar = document.querySelector(".sidebar");
      if (pg === "map") {
        if (mapEl) mapEl.style.visibility = "visible";
        if (sidebar) sidebar.style.visibility = "visible";
        setTimeout(() => {
          if (window.map) window.map.invalidateSize();
        }, 100);
      } else {
        if (mapEl) mapEl.style.visibility = "hidden";
        if (sidebar) sidebar.style.visibility = "hidden";
      }
    });
  });
}

// Бургер-меню
function initBurger() {
  const burgerBtn = document.getElementById("burgerBtn");
  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu) mobileMenu.classList.toggle("show");
    });
  }
}

// Поиск с выпадающим списком
function initSearch() {
  const inp = document.getElementById("searchInput");
  const clr = document.getElementById("searchClear");
  const res = document.getElementById("searchResults");
  
  if (!inp) return;
  
  inp.addEventListener("input", function() {
    if (clr) clr.className = "search-clear" + (this.value ? " show" : "");
    showSearchResults(this.value);
    searchQuery = this.value.trim();
    if (typeof update === 'function') update();
  });
}

function showSearchResults(q) {
  const res = document.getElementById("searchResults");
  if (!res) return;
  if (!q || q.length < 2) {
    res.className = "search-results";
    res.innerHTML = "";
    return;
  }
  q = q.toLowerCase();
  const matches = allData.filter(d => (d.surname + " " + d.name + " " + d.patronymic).toLowerCase().indexOf(q) !== -1).slice(0, 15);
  if (!matches.length) {
    res.className = "search-results";
    res.innerHTML = "";
    return;
  }
  let html = "";
  matches.forEach(d => {
    const fn = [d.surname, d.name, d.patronymic].filter(Boolean).join(" ");
    html += `<div class="search-result" onclick="focusOnItem(${d.id})">
              <b>${esc(fn)}</b> <span style="color:var(--muted);font-size:10px">${esc(d.settlement)}, №${esc(d.num)}</span>
            </div>`;
  });
  res.innerHTML = html;
  res.className = "search-results show";
}

// Функция для открытия скана в новой вкладке или через модальное окно
function openScan(url) {
  if (!url) return;
  // Прямое открытие в новой вкладке - самый надёжный способ для Яндекс.Диска
  window.open(url, '_blank');
}

// Показ выбранного участка
function showSelected(item) {
  const sec = document.getElementById("selectedSection");
  if (!sec) return;
  sec.style.display = "block";
  
  // Формируем номер усадьбы без .0
  const displayNum = Math.round(parseFloat(item.num));
  const fn = [item.surname, item.name, item.patronymic].filter(Boolean).join(" ");
  
  let h = `<div class="selected-title">Усадьба №${displayNum}</div>
           <div class="selected-owner">${esc(fn)}</div>`;
  
  // Определяем заголовки для полей (полное название для карточки)
  let soslovieLabel = "Сословно-профессиональная группа";
  
  [
    [soslovieLabel, item.soslovie],
    ["Тип", item.buildingType],
    ["Чин", item.rank],
    ["Служба", item.serviceType],
    ["Место приписки", item.registrationPlace],
    ["Место службы", item.servicePlace],
    ["Улица", item.street],
    ["Площадь", item.area_sazh ? item.area_sazh + " саж." : ""]
  ].forEach(f => {
    if (f[1]) h += `<div class="sf"><span class="sl">${f[0]}</span><span class="sv">${esc(f[1])}</span></div>`;
  });
  
  // Кнопка для открытия скана в новой вкладке (надёжный способ)
  if (item.scanUrl) {
      h += `<div class="scan-block" style="margin-top: 12px;">
              <div class="scan-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A5C" stroke-width="1.5">
                  <path d="M3 3C3 1.9 3.9 1 5 1H15L21 7V21C21 22.1 20.1 23 19 23H5C3.9 23 3 22.1 3 21V3Z"/>
                  <path d="M15 1V5C15 6.1 15.9 7 17 7H21"/>
                  <line x1="7" y1="11" x2="17" y2="11"/>
                  <line x1="7" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div class="scan-text">
                <b>Скан ведомости</b><br>
                <a href="#" onclick="openScan('${esc(item.scanUrl)}'); return false;" style="color: var(--accent); text-decoration: underline;">↗ Открыть скан в новой вкладке</a>
              </div>
            </div>`;
  }
  
  const card = document.getElementById("selectedCard");
  if (card) card.innerHTML = h;
}

// Обновление статистики и бейджа
function updateStats(filtered) {
  const statShown = document.getElementById("statShown");
  const statTotal = document.getElementById("statTotal");
  if (statShown) statShown.textContent = filtered.length;
  if (statTotal) statTotal.textContent = allData.length;
  
  let dims = 0;
  FILTERS.forEach(f => { if (state[f.key].size) dims++; });
  
  const badge = document.getElementById("crossBadge");
  if (badge) {
    badge.className = dims >= 2 ? "cross-badge show" : "cross-badge";
  }
  const crossText = document.getElementById("crossText");
  if (crossText && dims >= 2) crossText.textContent = `Перекрёстная фильтрация: ${dims} изм.`;
}

// Предупреждение о повороте экрана
function initOrientationWarning() {
  const hint = document.getElementById("landscapeHint");
  if (!hint) return;
  
  function checkOrientation() {
    if (window.innerWidth <= 768) {
      const pg = document.getElementById("page-map");
      if (pg && pg.classList.contains("active") && window.innerHeight > window.innerWidth) {
        hint.className = "landscape-hint show";
      } else {
        hint.className = "landscape-hint";
      }
    } else {
      hint.className = "landscape-hint";
    }
  }
  
  window.addEventListener("resize", checkOrientation);
  document.querySelectorAll(".nav-item").forEach(el => {
    el.addEventListener("click", () => setTimeout(checkOrientation, 200));
  });
  checkOrientation();
}

// Перетаскивание шторки сайдбара на мобильном
function initSidebarDrag() {
  const sidebar = document.querySelector(".sidebar");
  const handle = document.querySelector(".sidebar-handle");
  if (!handle || !sidebar) return;
  
  let startY = 0, startTransform = 0, dragging = false;
  
  handle.addEventListener("touchstart", function(e) {
    dragging = true;
    startY = e.touches[0].clientY;
    const style = getComputedStyle(sidebar);
    const matrix = new DOMMatrix(style.transform);
    startTransform = matrix.m42;
    sidebar.style.transition = "none";
  });
  
  document.addEventListener("touchmove", function(e) {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY;
    const newY = Math.max(0, startTransform + dy);
    sidebar.style.transform = `translateY(${newY}px)`;
  });
  
  document.addEventListener("touchend", function() {
    if (!dragging) return;
    dragging = false;
    sidebar.style.transition = "transform .3s ease";
    const style = getComputedStyle(sidebar);
    const matrix = new DOMMatrix(style.transform);
    const currentY = matrix.m42;
    const height = sidebar.offsetHeight;
    if (currentY < height * 0.3) {
      sidebar.classList.add("show");
    } else {
      sidebar.classList.remove("show");
    }
    sidebar.style.transform = "";
  });
}

// Глобальное объявление функции для вызова из HTML
window.openScan = openScan;