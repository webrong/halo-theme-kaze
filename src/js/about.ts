(function () {
  var el = document.getElementById("radar-values");
  var poly = document.getElementById("radar-data-polygon");
  if (!el || !poly) return;
  var vals = el.textContent.split(",").map(function (v) {
    return Math.max(0, Math.min(100, parseInt(v) || 0));
  });
  var n = vals.length;
  if (n < 3) return;
  var cx = 100,
    cy = 79,
    R = 59;
  var pts = vals.map(function (v, i) {
    var angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    var r = R * (v / 100);
    return (cx + r * Math.cos(angle)).toFixed(1) + "," + (cy + r * Math.sin(angle)).toFixed(1);
  });
  poly.setAttribute("points", pts.join(" "));
})();

(function () {
  // Sort changelog items by date descending (newest first)
  var list = document.getElementById("changelog-list");
  if (!list) return;
  var _list = list;
  var items = Array.prototype.slice.call(_list.querySelectorAll(".about-timeline-item"));
  items.sort(function (a: Element, b: Element) {
    var da = (a.getAttribute("data-date") || "").trim();
    var db = (b.getAttribute("data-date") || "").trim();
    // Pad short dates like "2025-05" to "2025-05-00" for correct compare
    var daPadded = da.length === 7 ? da + "-00" : da;
    var dbPadded = db.length === 7 ? db + "-00" : db;
    return dbPadded < daPadded ? -1 : dbPadded > daPadded ? 1 : 0;
  });
  items.forEach(function (item: Element) {
    _list.appendChild(item);
  });
})();
