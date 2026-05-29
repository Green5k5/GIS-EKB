// Инициализация карты
let map;
let markersGroup;
let overlayLayer = null;

function initMap() {
  map = L.map("map", { center: [56.82, 60.60], zoom: 12 });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OSM, CARTO",
    maxZoom: 19
  }).addTo(map);
  
  markersGroup = L.layerGroup().addTo(map);
  
  // Сохраняем в глобальную переменную для доступа из других модулей
  window.map = map;
  window.markersGroup = markersGroup;
}

function renderMap(filtered) {
  if (!markersGroup) return;
  markersGroup.clearLayers();
  
  // Генерируем цвета для сословий
  const allSoslovie = [...new Set(allData.map(d => d.soslovie).filter(Boolean))];
  const colorPalette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
  let soslovieColorMap = new Map();
  let colorIndex = 0;
  allSoslovie.forEach(sos => {
      soslovieColorMap.set(sos, colorPalette[colorIndex % colorPalette.length]);
      colorIndex++;
  });

  filtered.forEach(item => {
    if (!item.lat || !item.lng) return;
    
    // Определяем цвет: сначала по сословию, если нет - по умолчанию для поселения
    let color = "#888";
    if (item.soslovie && soslovieColorMap.has(item.soslovie)) {
        color = soslovieColorMap.get(item.soslovie);
    } else {
        color = COLORS[item.settlement] || "#888";
    }

    let m;
    // Преобразуем номер в целое число для поиска в полигонах
    const numKey = String(Math.round(parseFloat(item.num)));
    
    if (item.settlement === "Нижне-Исетск" && niPolygons[numKey]) {
      const coords = niPolygons[numKey].coords.map(c => [c[1], c[0]]);
      m = L.polygon(coords, {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    } else if (item.settlement === "Екатеринбург" && ekbPolygons[numKey]) {
      const coords = ekbPolygons[numKey].coords.map(c => [c[1], c[0]]);
      m = L.polygon(coords, {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    } else {
      const sz = Math.max(3, Math.min(10, Math.sqrt(item.area_sazh || 100) * 0.25));
      m = L.circleMarker([item.lat, item.lng], {
        radius: sz,
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    }
    
    // Формируем номер усадьбы без .0
    const displayNum = Math.round(parseFloat(item.num));
    const fn = [item.surname, item.name, item.patronymic].filter(Boolean).join(" ");
    let h = `<div class="popup-inner"><div class="popup-title">Усадьба №${displayNum}</div>`;
    
    // Определяем заголовки для полей (сокращенно для карты)
    let soslovieLabel = "Сословие";
    let familyStatusLabel = "Сем. положение";
    
    [
      ["Владелец", fn],
      ["Поселение", item.settlement],
      ["Тип", item.buildingType],
      [soslovieLabel, item.soslovie],
      ["Чин", item.rank],
      ["Место приписки", item.registrationPlace],
      ["Место службы", item.servicePlace],
      ["Площадь", item.area_sazh ? item.area_sazh + " саж." : ""]
    ].forEach(r => {
      if (r[1]) h += `<div class="popup-row"><span class="popup-lbl">${r[0]}</span><span>${esc(r[1])}</span></div>`;
    });
    
    // Добавляем ссылку на скан, если есть
    if (item.scanUrl) {
        h += `<div class="popup-row"><span class="popup-lbl">Скан</span><span><a href="${esc(item.scanUrl)}" target="_blank">Открыть скан ↗</a></span></div>`;
    }

    h += `</div>`;
    m.bindPopup(h, { className: "custom-popup", maxWidth: 300 });
    m.on("click", () => {
      if (typeof showSelected === 'function') showSelected(item);
    });
  });
  
  // Подгоняем карту под видимые маркеры
  if (markersGroup.getLayers().length > 0) {
    try {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    } catch (e) {}
  }
}

// Функция для перелета камеры к заданной области (поселению)
function flyToSettlement(settlement) {
    let bounds;
    if (settlement === "Екатеринбург") {
        bounds = L.latLngBounds(L.latLng(56.80, 60.55), L.latLng(56.85, 60.65));
    } else if (settlement === "Нижне-Исетск") {
        bounds = L.latLngBounds(L.latLng(56.73, 60.68), L.latLng(56.76, 60.71));
    } else if (settlement === "Уктус") {
        bounds = L.latLngBounds(L.latLng(56.77, 60.64), L.latLng(56.79, 60.66));
    } else {
        return;
    }
    if (map) {
        map.flyToBounds(bounds, { duration: 1.5 });
    }
}

function initOverlay(url, bounds) {
  overlayLayer = L.imageOverlay(url, bounds, { opacity: 0.6 }).addTo(map);
  const control = document.getElementById("overlayControl");
  if (control) control.style.display = "block";
  const toggle = document.getElementById("overlayToggle");
  if (toggle) {
    toggle.checked = true;
    toggle.onchange = function() {
      if (this.checked) overlayLayer.addTo(map);
      else map.removeLayer(overlayLayer);
    };
  }
  const opacity = document.getElementById("overlayOpacity");
  if (opacity) {
    opacity.oninput = function() {
      overlayLayer.setOpacity(this.value / 100);
    };
  }
}