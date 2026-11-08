(function () {
  var theme = "dark";
  try {
    var saved = JSON.parse(localStorage.getItem("kw.theme"));
    if (saved === "light" || saved === "dark") {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      theme = "light";
    }
  } catch (e) {
    /* localStorage no disponible: se queda en oscuro por defecto */
  }
  document.documentElement.setAttribute("data-theme", theme);
})();
