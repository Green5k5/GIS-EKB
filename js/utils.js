// Вспомогательные функции

// Экранирование HTML
function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Скачивание CSV
function downloadCSV(settlement) {
  let data = settlement ? allData.filter(d => d.settlement === settlement) : allData;
  const keys = ["id", "num", "settlement", "street", "buildingType", "surname", "name", "patronymic", "soslovie", "familyStatus", "sex", "serviceType", "rank", "position", "servicePlace", "registrationPlace", "area_sazh", "source", "scanUrl", "lat", "lng"];
  const headers = ["ID", "Номер", "Поселение", "Улица", "Тип постройки", "Фамилия", "Имя", "Отчество", "Сословие", "Сем. положение", "Пол", "Род службы", "Чин", "Должность", "Место службы", "Место приписки", "Площадь (саж.)", "Источник", "Скан", "Широта", "Долгота"];
  
  let csv = "\uFEFF" + headers.join(";") + "\n";
  data.forEach(d => {
    csv += keys.map(k => {
      let v = d[k] || "";
      return '"' + String(v).replace(/"/g, '""') + '"';
    }).join(";") + "\n";
  });
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (settlement || "full_dataset") + "_ekb_1809.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Закрытие мобильного меню
function closeMobile() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.remove("show");
}

// Очистка поиска
function clearSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
    // Вызов updateSearchResults должен быть в глобальной области
    if (typeof updateSearchResults === 'function') updateSearchResults("");
  }
  if (typeof update === 'function') update();
}

// Очистка всех фильтров
function clearAll() {
  if (typeof resetAllFilters === 'function') resetAllFilters();
  clearSearch();
  if (typeof update === 'function') update();
}

// Фокус на объекте
function focusOnItem(id) {
  const item = allData.find(d => d.id === id);
  if (!item || !item.lat || !item.lng) return;
  if (typeof window.map !== 'undefined') {
    window.map.setView([item.lat, item.lng], 17);
  }
  if (typeof showSelected === 'function') showSelected(item);
  
  const searchResults = document.getElementById("searchResults");
  if (searchResults) searchResults.className = "search-results";
  
  const sec = document.getElementById("selectedSection");
  if (sec) {
    const existing = sec.querySelector(".search-back");
    if (!existing) {
      const back = document.createElement("div");
      back.className = "search-back";
      back.textContent = "← Назад к результатам поиска";
      back.onclick = function() {
        sec.style.display = "none";
        const results = document.getElementById("searchResults");
        if (results) results.className = "search-results show";
      };
      sec.insertBefore(back, sec.firstChild);
    }
  }
}