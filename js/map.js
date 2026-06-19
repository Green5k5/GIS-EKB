let map;
let markersGroup;
let overlayLayers = [];

const SOSLOVIE_COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#4e79a7", "#f28e2b", "#59a14f", "#e15759", "#76b7b2"
];

const DEFAULT_COLOR = "#C49A5C";

const SETTLEMENT_BOUNDS = {
  "Екатеринбург": [[56.7927911754743, 60.5750235922242], [56.8551170611752, 60.6562421757520]],
  "Нижне-Исетск": [[56.7421477889542, 60.6734656696532], [56.7549395792231, 60.7047743621075]],
  "Уктус": [[56.7765203849077, 60.6388761928545], [56.7856875315059, 60.6663385556073]]
};

const OVERLAY_BASE_PATH = "assets/overlays-lite";
const OVERLAY_VERSION = "20260619-ni-no-mode-1";
const overlayUrl = fileName => `${OVERLAY_BASE_PATH}/${fileName}?v=${OVERLAY_VERSION}`;

const HISTORICAL_OVERLAYS = [
  { url: overlayUrl("ekb-plan-1.png"), bounds: [[56.8377931146054, 60.5702035731542], [56.8522689721454, 60.6079379255312]] },
  { url: overlayUrl("ekb-plan-2.png"), bounds: [[56.8396680218251, 60.6026082847361], [56.8551170611752, 60.6395297198479]] },
  { url: overlayUrl("ekb-plan-3.png"), bounds: [[56.8218774047269, 60.5750235922242], [56.8402751837158, 60.6132545360013]] },
  { url: overlayUrl("ekb-plan-4.png"), bounds: [[56.8258407106161, 60.6068097453513], [56.8445465369357, 60.6463043603396]] },
  { url: overlayUrl("ekb-plan-5.png"), bounds: [[56.8087627383191, 60.5798843778145], [56.8260436112885, 60.6185924669467]] },
  { url: overlayUrl("ekb-plan-6.png"), bounds: [[56.8117186117775, 60.6123612106181], [56.8299963336875, 60.6493399108491]] },
  { url: overlayUrl("ekb-plan-8.png"), bounds: [[56.7927911754743, 60.6182411553104], [56.8157711510122, 60.6562421757520]] },
  { url: overlayUrl("ni-plan-1.png"), bounds: [[56.7442144208524, 60.6734656696532], [56.7543139226161, 60.6957519187631]] },
  { url: overlayUrl("ni-plan-2.png"), bounds: [[56.7464309702041, 60.6826682492235], [56.7540138535890, 60.7047743621075]] },
  { url: overlayUrl("ni-plan-3.png"), bounds: [[56.7472015644912, 60.6755104796883], [56.7532665336143, 60.6855516477125]] },
  { url: overlayUrl("ni-plan-4.png"), bounds: [[56.7459709072051, 60.6829023722163], [56.7549395792231, 60.6993132898570]] },
  { url: overlayUrl("ni-plan-5.png"), bounds: [[56.7456499933395, 60.6920532418001], [56.7494902463049, 60.7032789640166]] },
  { url: overlayUrl("ni-plan-6.png"), bounds: [[56.7421477889542, 60.6879534783064], [56.7489477047511, 60.7016004049810]] },
  { url: overlayUrl("uktus-plan-2.png"), bounds: [[56.7800202483807, 60.6491429946757], [56.7845546472531, 60.6555451392860]] },
  { url: overlayUrl("uktus-plan-3.png"), bounds: [[56.7834411939831, 60.6503580016756], [56.7851184893273, 60.6539975060555]] },
  { url: overlayUrl("uktus-plan-4.png"), bounds: [[56.7814179562033, 60.6523835454807], [56.7856875315059, 60.6604668952290]] },
  { url: overlayUrl("uktus-plan-5.png"), bounds: [[56.7804315741802, 60.6586974140737], [56.7837600435609, 60.6663385556073]] },
  { url: overlayUrl("uktus-plan-6.png"), bounds: [[56.7785904897463, 60.6555498939090], [56.7824954235554, 60.6641415059546]] },
  { url: overlayUrl("uktus-plan-7.png"), bounds: [[56.7765203849077, 60.6529681496874], [56.7804519934062, 60.6653534687148]] },
  { url: overlayUrl("uktus-plan-8.png"), bounds: [[56.7767378571737, 60.6388761928545], [56.7812317014816, 60.6509493738894]] },
  { url: overlayUrl("uktus-plan-1.png"), bounds: [[56.7796392134027, 60.653159060667576], [56.78138896288448, 60.65679496812579]] }
];

let soslovieColorMap = null;

function getSoslovieColor(item) {
  if (shouldUseColorCoding()) {
    if (!soslovieColorMap) {
      const values = [...new Set(allData.map(d => d.soslovie).filter(Boolean))].sort();
      soslovieColorMap = new Map(values.map((value, index) => [
        value,
        SOSLOVIE_COLORS[index % SOSLOVIE_COLORS.length]
      ]));
    }
    return (item.soslovie && soslovieColorMap.get(item.soslovie)) || DEFAULT_COLOR;
  }

  return DEFAULT_COLOR;
}

function shouldUseColorCoding() {
  return Boolean(state.soslovie && state.soslovie.size >= 2);
}

function initMap() {
  map = L.map("map", { center: [56.82, 60.60], zoom: 12 });
  const historicalPane = map.createPane("historicalPane");
  historicalPane.style.zIndex = 250;
  historicalPane.style.pointerEvents = "none";

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OSM, CARTO",
    maxZoom: 19
  }).addTo(map);

  markersGroup = L.layerGroup().addTo(map);

  window.map = map;
  window.markersGroup = markersGroup;

  initOverlay(HISTORICAL_OVERLAYS);

  const initialSettlement = new URLSearchParams(window.location.search).get("settlement");
  if (initialSettlement && SETTLEMENT_BOUNDS[initialSettlement]) {
    setTimeout(() => flyToSettlement(initialSettlement), 150);
  }
}

function renderMap(filtered) {
  if (!markersGroup) return;
  markersGroup.clearLayers();

  if (shouldUseColorCoding()) {
    soslovieColorMap = null;
  }

  filtered.forEach(item => {
    if (!item.lat || !item.lng) return;

    const color = getSoslovieColor(item);
    const numKey = String(Math.round(parseFloat(item.num)));
    let layer;

    if (item.settlement === "Нижне-Исетск" && niPolygons[numKey]) {
      const coords = niPolygons[numKey].coords.map(coord => [coord[1], coord[0]]);
      layer = L.polygon(coords, {
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    } else if (item.settlement === "Екатеринбург" && ekbPolygons[numKey]) {
      const coords = ekbPolygons[numKey].coords.map(coord => [coord[1], coord[0]]);
      layer = L.polygon(coords, {
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    } else if (item.settlement === "Уктус" && typeof uktPolygons !== "undefined" && uktPolygons[numKey]) {
      const coords = uktPolygons[numKey].coords.map(coord => [coord[1], coord[0]]);
      layer = L.polygon(coords, {
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    } else {
      const size = Math.max(3, Math.min(10, Math.sqrt(item.area_sazh || 100) * 0.25));
      layer = L.circleMarker([item.lat, item.lng], {
        radius: size,
        color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 1.5,
        opacity: 0.8
      }).addTo(markersGroup);
    }

    const displayNum = Math.round(parseFloat(item.num));
    const fullName = [item.surname, item.name, item.patronymic].filter(Boolean).join(" ");
    let popupHtml = `<div class="popup-inner"><div class="popup-title">Усадьба №${esc(displayNum)}</div>`;

    [
      ["Владелец", fullName],
      ["Поселение", item.settlement],
      ["Тип", item.buildingType],
      ["Сословие", item.soslovie],
      ["Семейное положение", item.familyStatus],
      ["Чин", item.rank],
      ["Место приписки", item.registrationPlace],
      ["Место службы", item.servicePlace],
      ["Площадь", item.area_sazh ? `${item.area_sazh} саж.` : ""]
    ].forEach(row => {
      if (row[1]) {
        popupHtml += `<div class="popup-row"><span class="popup-lbl">${row[0]}</span><span>${esc(row[1])}</span></div>`;
      }
    });

    if (item.scanUrl) {
      popupHtml += `<div class="popup-row"><span class="popup-lbl">Скан</span><span><a href="${esc(item.scanUrl)}" target="_blank">Открыть скан →</a></span></div>`;
    }

    popupHtml += "</div>";
    layer.bindPopup(popupHtml, { className: "custom-popup", maxWidth: 300 });
    layer.on("click", () => {
      if (typeof showSelected === "function") showSelected(item);
    });
  });
}

function flyToSettlement(settlement) {
  const bounds = SETTLEMENT_BOUNDS[settlement];
  if (!map || !bounds) return;
  map.flyToBounds(bounds, { duration: 1.5, padding: [24, 24] });
}

function initOverlay(overlays) {
  const opacity = document.getElementById("overlayOpacity");
  const initialOpacity = ((opacity && Number(opacity.value)) || 45) / 100;
  overlayLayers = overlays.map(item => L.imageOverlay(item.url, item.bounds, {
    opacity: initialOpacity,
    interactive: false,
    pane: "historicalPane",
    className: "historical-overlay"
  }));

  overlayLayers.forEach(layer => layer.addTo(map));

  const control = document.getElementById("overlayControl");
  if (control) control.style.display = "block";

  const toggle = document.getElementById("overlayToggle");
  if (toggle) {
    toggle.checked = true;
    toggle.onchange = function() {
      overlayLayers.forEach(layer => {
        if (this.checked) {
          if (!map.hasLayer(layer)) layer.addTo(map);
        } else if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    };
  }

  if (opacity) {
    opacity.oninput = function() {
      const value = this.value / 100;
      overlayLayers.forEach(layer => layer.setOpacity(value));
    };
  }
}
