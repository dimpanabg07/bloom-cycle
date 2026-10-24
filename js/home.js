/* =====================================================================
   Bloom Cycle — home dashboard
   Reads saved data, then fills in the greeting, cycle ring, upcoming
   period, tip of the day and the mini calendar.
   ===================================================================== */

(function () {
  var byId = function (id) {
    return document.getElementById(id);
  };

  var state = window.Store.load();
  var today = window.Cycle.today();

  function dayWord(count) {
    return Math.abs(count) === 1 ? "day" : "days";
  }

  function greetingWord() {
    var hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function renderGreeting(info) {
    var name = (state.profile.name || "").trim();
    var text = greetingWord() + (name ? ", <span>" + window.UI.escapeHtml(name) + "</span>" : ", lovely");
    byId("greeting").innerHTML = text + ".";
    byId("todayLabel").textContent = window.Cycle.pretty(today, "weekday");

    if (!info.hasData) {
      byId("heroSub").textContent =
        "Add the first day of your last period and Bloom Cycle will estimate your phases, your next period and how you're likely to feel.";
      return;
    }

    var phase = window.BloomData.phases[info.phase];
    byId("heroSub").textContent =
      "You're on cycle day " + info.cycleDay + " — the " + phase.label.toLowerCase() +
      " phase. " + phase.blurb;
  }

  function renderStats(info) {
    var phaseStat = byId("statPhase");
    var nextStat = byId("statNext");
    var avgStat = byId("statAvg");

    if (!info.hasData) {
      phaseStat.textContent = "—";
      nextStat.textContent = "—";
      avgStat.textContent = (state.profile.cycleLength || 28) + " days";
      return;
    }

    var phase = window.BloomData.phases[info.phase];
    phaseStat.textContent = phase.emoji + " " + phase.label;
    nextStat.textContent =
      info.daysUntil > 0
        ? "in " + info.daysUntil + " " + dayWord(info.daysUntil)
        : info.daysUntil === 0
        ? "today"
        : info.daysUntil * -1 + " " + dayWord(info.daysUntil) + " late";
    avgStat.textContent = info.cycleLength + " days";
  }

  function renderRing(info) {
    var ringDay = byId("ringDay");
    var svg = document.querySelector(".ring");

    if (!info.hasData) {
      ringDay.textContent = "–";
      window.UI.setRing(svg, 0);
      return;
    }

    ringDay.textContent = info.cycleDay;
    window.UI.setRing(svg, info.progress);
  }

  function renderUpcoming(info) {
    var nextDate = byId("nextDate");
    var nextIn = byId("nextIn");
    var emoji = byId("nextEmoji");
    var note = byId("phaseNote");

    if (!info.hasData) {
      nextDate.textContent = "Not set yet";
      nextIn.textContent = "Add your last period date to begin.";
      emoji.textContent = "🌷";
      note.textContent =
        "Bloom Cycle learns from what you log and updates your estimates each cycle.";
      return;
    }

    nextDate.textContent = window.Cycle.pretty(info.nextPeriod, "long");

    if (info.daysUntil > 0) {
      nextIn.textContent = "In " + info.daysUntil + " " + dayWord(info.daysUntil) + " · estimated";
      emoji.textContent = "🌷";
    } else if (info.daysUntil === 0) {
      nextIn.textContent = "Expected today — estimated";
      emoji.textContent = "🌺";
    } else {
      nextIn.textContent =
        "Expected " + info.daysUntil * -1 + " " + dayWord(info.daysUntil) +
        " ago. Log your flow when it starts and this updates.";
      emoji.textContent = "🌙";
    }

    var phase = window.BloomData.phases[info.phase];
    note.textContent =
      "Ovulation is estimated around cycle day " + info.ovulationDay +
      ". Estimates are a guide, not a guarantee.";
    if (info.phase === "luteal") {
      note.textContent += " " + phase.blurb;
    }
  }

  function renderTip() {
    var tips = window.BloomData.tips;
    var dayNumber = Math.abs(window.Cycle.diffDays("2026-01-01", today));
    byId("tipText").textContent = tips[dayNumber % tips.length];
    byId("tipMeta").textContent = "Tip for " + window.Cycle.pretty(today, "weekday");
  }

  function renderCalendar() {
    var mount = byId("homeCalendar");
    if (!state.profile.lastPeriodStart && !state.logs.length) {
      mount.innerHTML =
        '<div class="empty-state">' +
        '<span class="empty-emoji">🌸</span>' +
        "<strong>Your calendar is waiting</strong>" +
        "<p>Set the first day of your last period to colour in your phases, or load a little " +
        "sample data to explore how it works.</p>" +
        '<div class="btn-row" style="justify-content: center">' +
        '<a class="btn btn-primary btn-sm" href="tracker.html">Set up my cycle</a>' +
        '<button class="btn btn-soft btn-sm" type="button" data-seed>Load sample data</button>' +
        "</div></div>";
      return;
    }

    window.UI.renderCalendar(mount, {
      state: state,
      onSelect: function (dateKey) {
        window.location.href = "tracker.html?date=" + dateKey;
      }
    });
  }

  function renderRecent() {
    var mount = byId("recentLogs");
    var count = byId("logCount");
    var logs = state.logs.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });

    count.textContent = logs.length + (logs.length === 1 ? " day logged" : " days logged");

    if (!logs.length) {
      mount.innerHTML =
        '<div class="empty-state">' +
        '<span class="empty-emoji">📝</span>' +
        "<p>No check-ins yet. Note how you feel for a few days and your patterns will " +
        "start to appear here.</p>" +
        '<div class="btn-row" style="justify-content: center">' +
        '<a class="btn btn-primary btn-sm" href="tracker.html">Log today</a>' +
        "</div></div>";
      return;
    }

    mount.innerHTML =
      '<div class="recent-list">' +
      logs
        .slice(0, 4)
        .map(function (log) {
          var tags = [];
          var flow = window.BloomData.flow.find(function (item) {
            return item.id === log.flow;
          });
          if (flow && flow.id !== "none") {
            tags.push('<span class="tag flow">' + flow.label + " flow</span>");
          }
          (log.symptoms || []).slice(0, 2).forEach(function (id) {
            tags.push('<span class="tag">' + window.UI.symptomLabel(id) + "</span>");
          });
          if (log.mood) {
            var mood = window.UI.moodMeta(log.mood);
            tags.push('<span class="tag lav">' + mood.emoji + " " + mood.label + "</span>");
          }
          return (
            '<div class="recent-item">' +
            "<span><strong>" + window.Cycle.pretty(log.date, "weekday") + "</strong></span>" +
            '<span class="tags">' +
            (tags.join("") || '<span class="tag lav">Check-in saved</span>') +
            "</span></div>"
          );
        })
        .join("") +
      "</div>";
  }

  function renderStreak() {
    var streak = window.Store.loggingStreak(state);
    byId("streakValue").textContent = streak;
    byId("streakText").textContent = streak
      ? "day" + (streak === 1 ? "" : "s") + " in a row. Lovely consistency — small notes count."
      : "Log a check-in today to start a streak.";
  }

  function renderAll() {
    state = window.Store.load();
    var info = window.Cycle.currentCycle(state);
    renderGreeting(info);
    renderStats(info);
    renderRing(info);
    renderUpcoming(info);
    renderTip();
    renderCalendar();
    renderRecent();
    renderStreak();

    byId("logButton").setAttribute("href", "tracker.html?date=" + today);
  }

  // Sample data button inside the empty states.
  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-seed]")) return;
    window.Store.seedDemo();
    window.UI.toast("Sample cycles loaded — take a look around ✨");
    renderAll();
  });

  renderAll();
})();
