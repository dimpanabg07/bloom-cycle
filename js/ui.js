/* =====================================================================
   Bloom Cycle — shared UI pieces
   Navigation, footer, toast messages, the phase calendar and small
   formatting helpers used by every page.
   ===================================================================== */

window.UI = (function () {
  var NAV = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "tracker", label: "Cycle Tracker", href: "tracker.html" },
    { key: "analysis", label: "Analysis", href: "analysis.html" },
    { key: "relief", label: "PMS Relief", href: "pms-relief.html" },
    { key: "exercises", label: "Exercises", href: "exercises.html" },
    { key: "about", label: "About", href: "about.html" }
  ];

  var LOGO =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<g fill="currentColor" opacity="0.9">' +
    '<circle cx="12" cy="6.2" r="3.1"></circle>' +
    '<circle cx="17.4" cy="11.2" r="3.1"></circle>' +
    '<circle cx="14.1" cy="17.1" r="3.1"></circle>' +
    '<circle cx="6.8" cy="14.9" r="3"></circle>' +
    "</g>" +
    '<circle cx="11.8" cy="11.6" r="2" fill="#fff7f1"></circle>' +
    "</svg>";

  var MENU_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';

  var CLOSE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';

  /* ------------------------- chrome (nav/footer) ------------------------ */
  function renderNav() {
    var mount = document.querySelector("[data-nav]");
    if (!mount) return;
    var page = document.body.getAttribute("data-page") || "home";

    var links = NAV.map(function (item) {
      var active = item.key === page ? ' aria-current="page"' : "";
      return '<a class="nav-link" href="' + item.href + '"' + active + ">" + item.label + "</a>";
    }).join("");

    mount.innerHTML =
      '<div class="container">' +
      '<nav class="nav" aria-label="Main navigation">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-mark">' + LOGO + "</span>" +
      "<span>Bloom Cycle</span>" +
      "</a>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-label="Open menu">' +
      MENU_ICON +
      "</button>" +
      '<div class="nav-links">' + links + "</div>" +
      "</nav>" +
      "</div>";

    var nav = mount.querySelector(".nav");
    var toggle = mount.querySelector(".nav-toggle");

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = open ? CLOSE_ICON : MENU_ICON;
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest(".nav-link") && nav.classList.contains("nav-open")) {
        nav.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = MENU_ICON;
      }
    });
  }

  function renderFooter() {
    var mount = document.querySelector("[data-footer]");
    if (!mount) return;
    var links = NAV.map(function (item) {
      return '<a href="' + item.href + '">' + item.label + "</a>";
    }).join("");

    mount.innerHTML =
      '<div class="container">' +
      '<div class="footer-inner">' +
      '<div class="footer-brand">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-mark">' + LOGO + "</span><span>Bloom Cycle</span></a>" +
      "<p>A calm, private space to understand your cycle, one gentle day at a time.</p>" +
      "</div>" +
      '<nav class="footer-links" aria-label="Footer navigation">' + links + "</nav>" +
      "</div>" +
      '<p class="footer-note">Bloom Cycle offers educational estimates only. Cycle dates, phases ' +
      "and ovulation days are calculated from what you log and are not a form of contraception " +
      "or a medical diagnosis. Please speak with a qualified healthcare professional about " +
      "severe, persistent or disruptive symptoms.</p>" +
      "</div>";
  }

  /* ------------------------------- toast ------------------------------- */
  var toastTimer = null;

  function toast(message) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    // Force a frame so the transition runs again on repeat messages.
    void el.offsetWidth;
    el.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2600);
  }

  /* ------------------------------ calendar ----------------------------- */
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function startOfMonth(year, month) {
    return new Date(year, month, 1);
  }

  function renderCalendar(mount, config) {
    if (!mount) return;
    var instance = mount.__bloomCalendar;
    if (!instance) {
      instance = { bound: false, state: null, month: null, config: {} };
      mount.__bloomCalendar = instance;
      mount.addEventListener("click", function (event) {
        var navButton = event.target.closest("[data-cal-nav]");
        if (navButton) {
          var step = Number(navButton.getAttribute("data-cal-nav"));
          instance.month = new Date(
            instance.month.getFullYear(),
            instance.month.getMonth() + step,
            1
          );
          drawCalendar(mount, instance);
          return;
        }
        var dayButton = event.target.closest("[data-date]");
        if (dayButton) {
          var dateKey = dayButton.getAttribute("data-date");
          if (typeof instance.config.onSelect === "function") {
            instance.config.onSelect(dateKey);
          } else {
            window.location.href = "tracker.html?date=" + dateKey;
          }
        }
      });
    }

    instance.state = config.state;
    instance.config = config;
    if (!instance.month) {
      var base = config.month || new Date();
      instance.month = startOfMonth(base.getFullYear(), base.getMonth());
    }
    drawCalendar(mount, instance);
  }

  function drawCalendar(mount, instance) {
    var state = instance.state;
    var month = instance.month;
    var year = month.getFullYear();
    var monthIndex = month.getMonth();
    var todayKey = window.Cycle.today();
    var selected = instance.config.selected || null;
    var firstDay = startOfMonth(year, monthIndex).getDay();
    var totalDays = new Date(year, monthIndex + 1, 0).getDate();
    var cells = [];

    for (var blank = 0; blank < firstDay; blank++) {
      cells.push('<span class="cal-cell is-empty" aria-hidden="true"></span>');
    }

    for (var day = 1; day <= totalDays; day++) {
      var dateKey = window.Cycle.key(new Date(year, monthIndex, day));
      var info = window.Cycle.dayInfo(state, dateKey);
      var log = window.Store.getLog(state, dateKey);
      var phase = info ? info.phase : null;

      // A logged flow day is always shown as a period day.
      if (log && log.flow && log.flow !== "none") phase = "menstrual";

      var classes = ["cal-cell"];
      if (phase) classes.push("is-" + phase);
      if (info && info.predicted) classes.push("is-predicted");
      if (dateKey === todayKey) classes.push("is-today");
      if (log) classes.push("has-log");
      if (selected === dateKey) classes.push("is-selected");

      var label = window.Cycle.pretty(dateKey, "weekday");
      if (info) {
        label += " · " + window.BloomData.phases[info.phase].label + " (estimated)";
      }
      if (info && info.predicted) label += " · predicted";
      if (log) label += " · logged";

      cells.push(
        '<button type="button" class="' + classes.join(" ") + '" data-date="' + dateKey +
          '" aria-label="' + label + '" title="' + label + '">' + day + "</button>"
      );
    }

    var legend =
      instance.config.legend === false
        ? ""
        : '<div class="legend">' +
          '<span><i class="dot rose"></i>Menstrual</span>' +
          '<span><i class="dot violet"></i>Follicular</span>' +
          '<span><i class="dot peach"></i>Ovulation</span>' +
          '<span><i class="dot lilac"></i>Luteal</span>' +
          '<span><i class="dot dashed"></i>Predicted</span>' +
          '<span><i class="dot" style="background:var(--pink-500)"></i>Logged</span>' +
          "</div>";

    mount.innerHTML =
      '<div class="cal">' +
      '<div class="cal-head">' +
      '<span class="cal-month">' + window.Cycle.monthLabel(month) + "</span>" +
      '<span class="cal-nav">' +
      '<button type="button" class="btn-icon" data-cal-nav="-1" aria-label="Previous month">‹</button>' +
      '<button type="button" class="btn-icon" data-cal-nav="1" aria-label="Next month">›</button>' +
      "</span>" +
      "</div>" +
      '<div class="cal-grid" role="grid">' +
      DOW.map(function (name) {
        return '<span class="cal-dow" aria-hidden="true">' + name.slice(0, 2) + "</span>";
      }).join("") +
      cells.join("") +
      "</div>" +
      legend +
      "</div>";
  }

  /* ------------------------------ ring -------------------------------- */
  function setRing(svg, ratio) {
    if (!svg) return;
    var progress = svg.querySelector(".ring-progress");
    if (!progress) return;
    var radius = Number(progress.getAttribute("r")) || 76;
    var circumference = 2 * Math.PI * radius;
    var safeRatio = Math.max(0, Math.min(1, ratio));
    progress.style.strokeDasharray = circumference.toFixed(1);
    progress.style.strokeDashoffset = (circumference * (1 - safeRatio)).toFixed(1);
  }

  /* ---------------------------- formatting ---------------------------- */
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function symptomLabel(id) {
    var found = window.BloomData.symptoms.find(function (symptom) {
      return symptom.id === id;
    });
    return found ? found.label : id;
  }

  function moodMeta(id) {
    return (
      window.BloomData.moods.find(function (mood) {
        return mood.id === id;
      }) || { id: id, label: id, emoji: "🙂" }
    );
  }

  function phasePill(phase) {
    var meta = window.BloomData.phases[phase];
    if (!meta) return "";
    return (
      '<span class="phase-pill tone-' + meta.tone + '">' + meta.emoji + " " + meta.label + "</span>"
    );
  }

  function scoreMoodLabel(value) {
    return window.BloomData.energy[value] || "";
  }

  /* ------------------------------ boot -------------------------------- */
  function init() {
    renderNav();
    renderFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    nav: NAV,
    toast: toast,
    renderCalendar: renderCalendar,
    setRing: setRing,
    escapeHtml: escapeHtml,
    symptomLabel: symptomLabel,
    moodMeta: moodMeta,
    phasePill: phasePill,
    energyLabel: scoreMoodLabel
  };
})();
