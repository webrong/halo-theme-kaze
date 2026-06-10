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
  // Sort changelog items by date ascending (oldest first — story/evolution narrative)
  function normalize(raw: string): string {
    var parts = raw.trim().split(/[-/.年月日]/).filter(function (p) { return p.length > 0; });
    if (parts.length < 2) return raw.trim();
    var year = parts[0].padStart(4, "0");
    var month = parts[1].padStart(2, "0");
    var day = parts[2] ? parts[2].padStart(2, "0") : "00";
    return year + "-" + month + "-" + day;
  }
  var list = document.getElementById("changelog-list");
  if (!list) return;
  var _list = list;
  var items = Array.prototype.slice.call(_list.querySelectorAll(".about-timeline-item"));
  items.sort(function (a: Element, b: Element) {
    var da = normalize(a.getAttribute("data-date") || "");
    var db = normalize(b.getAttribute("data-date") || "");
    return da < db ? -1 : da > db ? 1 : 0;
  });
  items.forEach(function (item: Element) {
    _list.appendChild(item);
  });
})();
