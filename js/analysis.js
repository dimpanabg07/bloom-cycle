/* =====================================================================
   Bloom Cycle — analysis page
   Turns saved logs into averages, a cycle-length chart, symptom and mood
   frequencies, plain-language insights and a cycle history timeline.
   Every number below comes from the user's own data.
   ===================================================================== */

(function () {
  var byId = function (id) {
    return document.getElementById(id);
  };

  var state = null;
  var starts = [];
  var cycles = [];
  var info = null;
  var completed = 0;

  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  function avg(values) {
    if (!values.length) return null;
    return values.reduce(function (a, b) {
      return a + b;
    }, 0) / values.length;
  }

  function symptomEmoji(id) {
    var found = window.BloomData.symptoms.find(function (item) {
      return item.id === id;
    });
    return found ? found.emoji : "•";
  }

  /* --------------------------- the bar chart --------------------------- */
  function cycleLengthChart(series) {
    if (!series.length) {
      return (
        '<div class="empty-state"><span class="empty-emoji">📈</span>' +
        "<p>Your chart appears once you have logged two period start dates.</p></div>"
      );
    }

    var width = 380;
    var height = 210;
    var pad = { top: 26, right: 14, bottom: 38, left: 34 };
    var plotW = width - pad.left - pad.right;
    var plotH = height - pad.top - pad.bottom;
    var values = series.map(function (point) {
      return point.value;
    });
    var highest = Math.max.apply(null, values);
    var lowest = Math.min.apply(null, values);
    var yMin = Math.max(0, Math.floor((lowest - 5) / 5) * 5);
    var yMax = Math.ceil((highest + 3) / 5) * 5;
    if (yMax - yMin < 10) yMax = yMin + 10;

    var average = Math.round(avg(values));

    function y(value) {
      return pad.top + plotH - ((value - yMin) / (yMax - yMin)) * plotH;
    }

    var step = plotW / series.length;
    var barWidth = Math.min(34, Math.max(10, step * 0.52));

    var gridLines = [0, 1, 2, 3]
      .map(function (index) {
        var value = yMin + ((yMax - yMin) * index) / 3;
        var lineY = y(value);
        return (
          '<line x1="' + pad.left + '" y1="' + lineY + '" x2="' + (width - pad.right) +
          '" y2="' + lineY + '" stroke="#f0e6f4" stroke-width="1"></line>' +
          '<text x="' + (pad.left - 8) + '" y="' + (lineY + 3.5) +
          '" text-anchor="end" font-size="9" fill="#b3a9c2">' + Math.round(value) + "</text>"
        );
      })
      .join("");

    var bars = series
      .map(function (point, index) {
        var centre = pad.left + step * (index + 0.5);
        var top = y(point.value);
        var barHeight = Math.max(4, pad.top + plotH - top);
        var isLast = index === series.length - 1;
        return (
          '<rect x="' + (centre - barWidth / 2) + '" y="' + top + '" width="' + barWidth +
          '" height="' + barHeight + '" rx="' + Math.min(9, barWidth / 2) +
          '" fill="' + (isLast ? "#e58aac" : "url(#bloomBarGrad)") + '"></rect>' +
          '<text x="' + centre + '" y="' + (top - 8) +
          '" text-anchor="middle" font-size="11" font-weight="800" fill="#5f4a93">' +
          point.value + "</text>" +
          '<text x="' + centre + '" y="' + (height - 16) +
          '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#918aa0">' +
          point.label + "</text>"
        );
      })
      .join("");

    var averageLine =
      '<line x1="' + pad.left + '" y1="' + y(average) + '" x2="' + (width - pad.right) +
      '" y2="' + y(average) + '" stroke="#de7fa4" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.8"></line>' +
      '<text x="' + (width - pad.right) + '" y="' + (y(average) - 6) +
      '" text-anchor="end" font-size="9" font-weight="800" fill="#c4708f">avg ' + average + "</text>";

    return (
      '<svg viewBox="0 0 ' + width + " " + height +
      '" role="img" aria-label="Bar chart of cycle lengths by start date">' +
      '<defs><linearGradient id="bloomBarGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#c3a7f0"></stop>' +
      '<stop offset="100%" stop-color="#eee2fb"></stop></linearGradient></defs>' +
      gridLines +
      averageLine +
      bars +
      "</svg>"
    );
  }

  /* ------------------------ horizontal bar lists ------------------------ */
  function renderFrequency(mount, captionEl, entries, totalDays, emptyText, unit) {
    if (!entries.length) {
      mount.innerHTML =
        '<div class="empty-state"><span class="empty-emoji">🌼</span><p>' + emptyText + "</p></div>";
      captionEl.textContent = "";
      return;
    }

    var highest = entries[0].count;
    mount.innerHTML = entries
      .map(function (entry) {
        var width = Math.max(8, Math.round((entry.count / highest) * 100));
        return (
          '<div class="hbar">' +
          "<span>" + entry.label + "</span>" +
          '<div class="hbar-track"><div class="hbar-fill" style="width:' + width + '%"></div></div>' +
          '<span class="hbar-value">' + entry.count + unit + "</span>" +
          "</div>"
        );
      })
      .join("");

    captionEl.textContent =
      "Across " + plural(totalDays, "logged day") + " · each bar is a share of your most reported item.";
  }

  /* ------------------------------ insights ----------------------------- */
  function buildInsights() {
    var insights = [];
    var trackedCycles = cycles.filter(function (cycle) {
      return cycle.logs.length > 0;
    });
    var recentCycles = trackedCycles.slice(-4);

    if (completed >= 1) {
      insights.push({
        emoji: "📏",
        text:
          "Your average cycle is <strong>" + info.cycleLength + " days</strong>, calculated from " +
          plural(completed, "completed cycle") + "."
      });
    } else if (starts.length) {
      insights.push({
        emoji: "🌱",
        text:
          "You have <strong>" + plural(starts.length, "period start") +
          "</strong> saved. Log the first day of your next period and cycle-length patterns " +
          "will start to appear."
      });
    }

    var spread = window.Cycle.cycleLengthSpread(state);
    if (spread) {
      var difference = spread.longest - spread.shortest;
      insights.push({
        emoji: "🌊",
        text:
          "Your cycles ranged from <strong>" + spread.shortest + "</strong> to <strong>" +
          spread.longest + " days</strong> (" + plural(difference, "day") + " of variation). " +
          (difference <= 7
            ? "That is a fairly steady rhythm, which makes predictions more reliable."
            : "A wider spread is common, but it does make predictions less certain.")
      });
    }

    // Symptom that shows up in the most of the last four tracked cycles.
    if (recentCycles.length) {
      var cycleCounts = {};
      recentCycles.forEach(function (cycle) {
        Object.keys(cycle.symptoms).forEach(function (id) {
          cycleCounts[id] = (cycleCounts[id] || 0) + 1;
        });
      });
      var topSymptom = Object.keys(cycleCounts).sort(function (a, b) {
        return cycleCounts[b] - cycleCounts[a];
      })[0];

      if (topSymptom) {
        var times = cycleCounts[topSymptom];
        insights.push({
          emoji: symptomEmoji(topSymptom),
          text:
            "<strong>" + window.UI.symptomLabel(topSymptom) + "</strong> " +
            (times === 1 ? "was" : "were") + " reported in " + times + " of your last " +
            plural(recentCycles.length, "tracked cycle") + "."
        });
      }
    }

    // Mood most often logged.
    var moodCounts = window.Cycle.countMoods(state.logs);
    var topMood = Object.keys(moodCounts).sort(function (a, b) {
      return moodCounts[b] - moodCounts[a];
    })[0];
    if (topMood) {
      var mood = window.UI.moodMeta(topMood);
      insights.push({
        emoji: "🌈",
        text:
          "<strong>" + mood.label + "</strong> is your most logged mood — " +
          plural(moodCounts[topMood], "day") + " out of " + plural(state.logs.length, "check-in") + "."
      });
    }

    // Where symptoms cluster inside the cycle.
    var lutealDays = 0;
    var lutealSymptomDays = 0;
    state.logs.forEach(function (log) {
      var day = window.Cycle.dayInfo(state, log.date);
      if (!day) return;
      if (day.phase === "luteal") {
        lutealDays += 1;
        if ((log.symptoms || []).length) lutealSymptomDays += 1;
      }
    });
    if (lutealSymptomDays >= 2) {
      insights.push({
        emoji: "🍂",
        text:
          "<strong>" + lutealSymptomDays + " of your " + lutealDays +
          " luteal-phase check-ins</strong> included symptoms — the days before a period are a " +
          "common time for PMS."
      });
    }

    // Energy by phase.
    var energyByPhase = { menstrual: [], follicular: [], ovulation: [], luteal: [] };
    state.logs.forEach(function (log) {
      var day = window.Cycle.dayInfo(state, log.date);
      if (day && log.energy) energyByPhase[day.phase].push(Number(log.energy));
    });
    var lutealEnergy = avg(energyByPhase.luteal);
    var follicularEnergy = avg(energyByPhase.follicular);
    if (lutealEnergy && follicularEnergy && Math.abs(follicularEnergy - lutealEnergy) >= 0.4) {
      insights.push({
        emoji: "⚡",
        text:
          "Energy averages <strong>" + lutealEnergy.toFixed(1) + "/5 in your luteal phase</strong> " +
          "versus <strong>" + follicularEnergy.toFixed(1) + "/5 in your follicular phase</strong>."
      });
    }

    // Change between the last two tracked cycles.
    if (trackedCycles.length >= 2) {
      function symptomDayCount(cycle) {
        return cycle.logs.filter(function (log) {
          return (log.symptoms || []).length > 0;
        }).length;
      }
      var latest = symptomDayCount(trackedCycles[trackedCycles.length - 1]);
      var previous = symptomDayCount(trackedCycles[trackedCycles.length - 2]);

      if (latest !== previous) {
        insights.push({
          emoji: "🔄",
          text:
            "You reported symptoms on <strong>" + plural(latest, "day") +
            "</strong> in your latest cycle, compared with <strong>" + plural(previous, "day") +
            "</strong> in the one before."
        });
      }
    }

    if (!insights.length) {
      insights.push({
        emoji: "🌷",
        text:
          "Keep logging for a couple more cycles — patterns need a little history before they " +
          "become clear."
      });
    }

    return insights.slice(0, 5);
  }

  /* ------------------------------ rendering ---------------------------- */
  function renderKpis() {
    var periodRuns = window.Cycle.periodRuns(state.logs);
    var periodLength = window.Cycle.avgPeriodLength(state);

    byId("kpiCycle").innerHTML = info.cycleLength + " <small>days</small>";
    byId("kpiCycleNote").textContent = completed
      ? "From " + plural(completed, "completed cycle")
      : "From your cycle settings";

    byId("kpiPeriod").innerHTML = periodLength + " <small>days</small>";
    byId("kpiPeriodNote").textContent =
      periodRuns.length >= 2
        ? "From " + plural(periodRuns.length, "logged period")
        : "From your cycle settings";

    byId("kpiNext").textContent = window.Cycle.pretty(info.nextPeriod, "short");
    byId("kpiNextNote").textContent =
      info.daysUntil > 1
        ? "Estimated in " + plural(info.daysUntil, "day")
        : info.daysUntil === 1
        ? "Estimated tomorrow"
        : info.daysUntil === 0
        ? "Estimated today"
        : "Estimated " + plural(info.daysUntil * -1, "day") + " ago";

    byId("kpiTracked").innerHTML = state.logs.length + " <small>days</small>";
    byId("kpiTrackedNote").textContent =
      plural(starts.length, "period start") + " · " + plural(cycles.length, "cycle");
  }

  function renderPrediction() {
    byId("predictionDate").textContent = window.Cycle.pretty(info.nextPeriod, "long");
    byId("predictionIn").textContent =
      info.daysUntil > 1
        ? "In " + plural(info.daysUntil, "day") + " · estimated"
        : info.daysUntil === 1
        ? "Tomorrow · estimated"
        : info.daysUntil === 0
        ? "Expected today · estimated"
        : "Was expected " + plural(info.daysUntil * -1, "day") + " ago";

    var notes = [
      {
        emoji: "🧮",
        text: completed
          ? "Based on your average of " + plural(info.cycleLength, "day") +
            " across " + plural(completed, "completed cycle") + "."
          : "Based on the settings you entered, not yet on logged cycles."
      },
      {
        emoji: "☀️",
        text: "Ovulation is estimated around cycle day " + info.ovulationDay + "."
      },
      {
        emoji: "🌙",
        text: "Predicted period length: " + plural(info.periodLength, "day") + "."
      },
      {
        emoji: "🔁",
        text: "This updates automatically the next time you log a period start."
      }
    ];

    byId("predictionNotes").innerHTML = notes
      .map(function (note) {
        return (
          '<li class="insight"><span class="insight-icon" aria-hidden="true">' + note.emoji +
          "</span><p>" + note.text + "</p></li>"
        );
      })
      .join("");
  }

  function renderChart() {
    var lengths = [];
    for (var i = 1; i < starts.length; i++) {
      var value = window.Cycle.diffDays(starts[i - 1], starts[i]);
      if (value >= 15 && value <= 60) {
        lengths.push({
          from: starts[i - 1],
          label: window.Cycle.pretty(starts[i - 1], "short"),
          value: value
        });
      }
    }

    var recent = lengths.slice(-8);
    byId("lengthChart").innerHTML = cycleLengthChart(recent);

    if (!recent.length) {
      byId("lengthCaption").textContent =
        starts.length === 1
          ? "One period start saved. Log the first day of your next period to see your first cycle length."
          : "No cycle lengths yet.";
      return;
    }

    var values = recent.map(function (point) {
      return point.value;
    });
    var caption =
      "Average " + Math.round(avg(values)) + " days across " +
      plural(values.length, "cycle") + ".";
    if (values.length > 1) {
      caption +=
        " Shortest " + Math.min.apply(null, values) + " days, longest " +
        Math.max.apply(null, values) + " days.";
    }
    byId("lengthCaption").textContent = caption;
  }

  function renderSymptoms() {
    var counts = window.Cycle.countSymptoms(state.logs);
    var entries = Object.keys(counts)
      .map(function (id) {
        return { id: id, label: window.UI.symptomLabel(id), count: counts[id] };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 7);

    renderFrequency(
      byId("symptomChart"),
      byId("symptomCaption"),
      entries,
      state.logs.length,
      "No symptoms logged yet. Add a check-in and the patterns will appear here.",
      "×"
    );

    if (entries.length) {
      byId("symptomCaption").textContent =
        "Most reported: " + entries[0].label + " (" + entries[0].count + "×)" +
        " · " + plural(state.logs.length, "logged day") + " in total.";
    }
  }

  function renderMoods() {
    var counts = window.Cycle.countMoods(state.logs);
    var entries = Object.keys(counts)
      .map(function (id) {
        var mood = window.UI.moodMeta(id);
        return { id: id, label: mood.emoji + " " + mood.label, count: counts[id] };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      });

    renderFrequency(
      byId("moodChart"),
      byId("moodCaption"),
      entries,
      state.logs.length,
      "No moods logged yet. They only take a tap to add.",
      "×"
    );

    if (entries.length) {
      byId("moodCaption").textContent =
        plural(entries.length, "mood") + " recorded so far. There is no right way to feel.";
    }
  }

  function renderInsights() {
    byId("insights").innerHTML = buildInsights()
      .map(function (insight) {
        return (
          '<li class="insight"><span class="insight-icon" aria-hidden="true">' + insight.emoji +
          "</span><p>" + insight.text + "</p></li>"
        );
      })
      .join("");
  }

  function renderTimeline() {
    var mount = byId("timeline");
    if (!cycles.length) {
      mount.innerHTML = '<li class="tl-body">No cycles to show yet.</li>';
      return;
    }

    mount.innerHTML = cycles
      .slice()
      .reverse()
      .map(function (cycle) {
        var tags = Object.keys(cycle.symptoms)
          .sort(function (a, b) {
            return cycle.symptoms[b] - cycle.symptoms[a];
          })
          .slice(0, 3)
          .map(function (id) {
            return '<span class="tag">' + window.UI.symptomLabel(id) + "</span>";
          })
          .join("");

        var range =
          window.Cycle.pretty(cycle.start, "short") +
          " – " +
          (cycle.isCurrent ? "today" : window.Cycle.pretty(cycle.end, "short"));

        var facts = [
          cycle.length
            ? plural(cycle.length, "day") + " cycle"
            : "Cycle in progress",
          cycle.periodLength ? plural(cycle.periodLength, "day") + " period" : null,
          plural(cycle.trackedDays, "check-in")
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          '<li class="tl-item' + (cycle.isCurrent ? " is-current" : "") + '">' +
          '<div class="tl-head">' + range +
          (cycle.isCurrent ? ' <span class="badge badge-pink">Current</span>' : "") +
          "</div>" +
          '<div class="tl-body">' + facts + "</div>" +
          (tags ? '<div class="entry-tags">' + tags + "</div>" : "") +
          "</li>"
        );
      })
      .join("");
  }

  function updateNotice() {
    var notices = [];
    if (completed < 1) {
      notices.push(
        "Cycle-length patterns need at least two period starts — you have " +
        plural(starts.length, "start") + " so far."
      );
    }
    if (state.logs.length < 5) {
      notices.push(
        "Only " + plural(state.logs.length, "day") + " of check-ins so far, so symptom " +
        "patterns are still forming."
      );
    }
    if (state.logs.length === 0) {
      notices.push("No daily check-ins yet, so averages currently come from your settings.");
    }

    var notice = byId("dataNotice");
    if (!notices.length) {
      notice.classList.add("hidden");
      return;
    }
    notice.classList.remove("hidden");
    byId("dataNoticeText").textContent = notices.join(" ");
  }

  function render() {
    state = window.Store.load();
    starts = window.Cycle.cycleStarts(state);
    cycles = window.Cycle.buildCycles(state);
    info = window.Cycle.currentCycle(state);
    completed = Math.max(0, starts.length - 1);

    if (!starts.length) {
      byId("emptyState").classList.remove("hidden");
      byId("analysisBody").classList.add("hidden");
      return;
    }

    byId("emptyState").classList.add("hidden");
    byId("analysisBody").classList.remove("hidden");

    updateNotice();
    renderKpis();
    renderChart();
    renderPrediction();
    renderSymptoms();
    renderMoods();
    renderInsights();
    renderTimeline();
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-seed]")) return;
    window.Store.seedDemo();
    window.UI.toast("Sample cycles loaded — take a look around ✨");
    render();
  });

  render();
})();
