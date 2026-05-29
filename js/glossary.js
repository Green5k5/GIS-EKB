// Глоссарий: поиск и категории
function initGlossary() {
  const searchInput = document.getElementById("glSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function(e) {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll(".gl-entry").forEach(el => {
        el.style.display = el.textContent.toLowerCase().indexOf(q) !== -1 ? "flex" : "none";
      });
      document.querySelectorAll(".gl-letter").forEach(el => {
        let next = el.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains("gl-letter")) {
          if (next.classList.contains("gl-entry") && next.style.display !== "none") hasVisible = true;
          next = next.nextElementSibling;
        }
        el.style.display = hasVisible ? "block" : "none";
      });
    });
  }
  
  // Переключение режимов
  const modes = document.querySelectorAll(".gl-mode");
  modes.forEach((m, i) => {
    m.addEventListener("click", function() {
      modes.forEach(mm => mm.classList.remove("active"));
      m.classList.add("active");
      const cats = document.getElementById("glCats");
      if (cats) cats.style.display = i === 1 ? "grid" : "none";
      if (i === 0) {
        document.querySelectorAll(".gl-cat-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".gl-entry").forEach(el => el.style.display = "flex");
        document.querySelectorAll(".gl-letter").forEach(el => el.style.display = "block");
      }
    });
  });
  
  // Алфавитная навигация
  const letters = [];
  document.querySelectorAll(".gl-letter").forEach(el => letters.push(el.textContent.trim()));
  const alphaNav = document.getElementById("glAlpha");
  if (alphaNav) {
    letters.forEach(letter => {
      const btn = document.createElement("div");
      btn.className = "gl-alpha-btn";
      btn.textContent = letter;
      btn.onclick = () => {
        document.querySelectorAll(".gl-letter").forEach(el => {
          if (el.textContent.trim() === letter) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      };
      alphaNav.appendChild(btn);
    });
  }

  // Кнопки категорий («Производство», «Чины» и т.д.): подключаем клик.
  // filterByCat была определена, но нигде не вызывалась - кнопки не работали.
  document.querySelectorAll(".gl-cat-btn").forEach(function(btn) {
    btn.addEventListener("click", function() { filterByCat(btn); });
  });
}

// Фильтрация по категории
function filterByCat(btn) {
  const cat = btn.dataset.cat;
  const wasActive = btn.classList.contains("active");
  document.querySelectorAll(".gl-cat-btn").forEach(b => b.classList.remove("active"));
  if (!wasActive) btn.classList.add("active");
  
  document.querySelectorAll(".gl-entry").forEach(el => {
    if (wasActive) {
      el.style.display = "flex";
      return;
    }
    const elCat = el.querySelector(".gl-cat");
    el.style.display = (elCat && elCat.textContent.trim() === cat) ? "flex" : "none";
  });
  
  document.querySelectorAll(".gl-letter").forEach(el => {
    if (wasActive) {
      el.style.display = "block";
      return;
    }
    let next = el.nextElementSibling;
    let hasVisible = false;
    while (next && !next.classList.contains("gl-letter")) {
      if (next.classList.contains("gl-entry") && next.style.display !== "none") hasVisible = true;
      next = next.nextElementSibling;
    }
    el.style.display = hasVisible ? "block" : "none";
  });
}