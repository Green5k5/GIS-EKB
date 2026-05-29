// Состояние фильтров
let state = {};
let searchQuery = "";
let expanded = {};

// Инициализация состояния фильтров
function initFiltersState() {
  FILTERS.forEach(f => {
    state[f.key] = new Set();
  });
}

// Получение отфильтрованных данных
function getFiltered() {
  return allData.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = (item.surname + " " + item.name + " " + item.patronymic).toLowerCase();
      if (fullName.indexOf(q) === -1) return false;
    }
    for (let i = 0; i < FILTERS.length; i++) {
      const f = FILTERS[i];
      if (state[f.key].size > 0 && !state[f.key].has(item[f.key])) return false;
    }
    return true;
  });
}

// Получение кросс-статистики
function getCrossCounts(dimKey) {
  const counts = {};
  allData.forEach(item => {
    if (searchQuery) {
      const fullName = (item.surname + " " + item.name + " " + item.patronymic).toLowerCase();
      if (fullName.indexOf(searchQuery.toLowerCase()) === -1) return;
    }
    for (let i = 0; i < FILTERS.length; i++) {
      const f = FILTERS[i];
      if (f.key !== dimKey && state[f.key].size > 0 && !state[f.key].has(item[f.key])) return;
    }
    counts[item[dimKey]] = (counts[item[dimKey]] || 0) + 1;
  });
  return counts;
}

// Переключение фильтра
function toggle(key, value) {
  if (state[key].has(value)) {
    state[key].delete(value);
  } else {
    state[key].add(value);
  }
  if (typeof update === 'function') update();
}

// Сброс всех фильтров
function resetAllFilters() {
  FILTERS.forEach(f => {
    state[f.key].clear();
  });
  searchQuery = "";
  expanded = {};
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  if (typeof update === 'function') update();
}

// Рендер фильтров
function renderFilters() {
  const container = document.getElementById("filtersContainer");
  if (!container) return;
  container.innerHTML = "";
  
  FILTERS.forEach(cfg => {
    const cross = getCrossCounts(cfg.key);
    const vals = [];
    const seen = {};
    allData.forEach(d => {
      if (d[cfg.key] && !seen[d[cfg.key]]) {
        seen[d[cfg.key]] = true;
        vals.push(d[cfg.key]);
      }
    });
    vals.sort((a, b) => (cross[b] || 0) - (cross[a] || 0));
    if (!vals.length) return;
    
    const activeN = state[cfg.key].size;
    const limit = cfg.limit || 999;
    const isExp = expanded[cfg.key];
    const show = isExp ? vals : vals.slice(0, limit);
    
    const div = document.createElement("div");
    div.className = "filter-section";
    let h = `<div class="filter-title">${cfg.title}${activeN ? `<span class="filter-count">${activeN}</span>` : ""}</div>`;
    if (cfg.inline) h += '<div class="filter-row">';
    
    show.forEach(v => {
      const cnt = cross[v] || 0;
      const isA = state[cfg.key].has(v);
      const dis = cnt === 0 && !isA;
      h += `<div class="filter-option${isA ? " active" : ""}${dis ? " disabled" : ""}" data-key="${esc(cfg.key)}" data-val="${esc(v)}">
              <div class="cb">${isA ? "✓" : ""}</div>
              <span>${esc(v)}</span>
              <span class="fb">${cnt}</span>
            </div>`;
    });
    
    if (cfg.inline) h += "</div>";
    if (vals.length > limit && !isExp) {
      h += `<div class="filter-expand" data-key="${esc(cfg.key)}">Ещё ${vals.length - limit} ▾</div>`;
    }
    div.innerHTML = h;
    container.appendChild(div);
  });
  
  // Обработчики событий
  container.onclick = function(e) {
    const opt = e.target.closest(".filter-option");
    if (opt) {
      toggle(opt.dataset.key, opt.dataset.val);
      return;
    }
    const exp = e.target.closest(".filter-expand");
    if (exp) {
      expanded[exp.dataset.key] = true;
      if (typeof update === 'function') update();
    }
  };
}

// Рендер активных тегов
function renderActiveTags() {
  const tags = [];
  FILTERS.forEach(f => {
    state[f.key].forEach(v => {
      tags.push({ key: f.key, val: v });
    });
  });
  if (searchQuery) tags.push({ key: "search", val: searchQuery });
  
  const activeBar = document.getElementById("activeBar");
  if (activeBar) {
    activeBar.className = "active-bar" + (tags.length ? " show" : "");
  }
  
  const container = document.getElementById("activeTags");
  if (!container) return;
  container.innerHTML = "";
  
  tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = (t.key === "search" ? `«${t.val}»` : t.val) + " ×";
    span.onclick = () => {
      if (t.key === "search") {
        clearSearch();
      } else {
        toggle(t.key, t.val);
      }
    };
    container.appendChild(span);
  });
}