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
