/* =====================================================================
   Bloom Cycle — cycle tracker page
   Handles the daily check-in form (create / edit / delete), the cycle
   settings form, the summary strip and the phase calendar.
   ===================================================================== */

(function () {
  var byId = function (id) {
    return document.getElementById(id);
  };

  var today = window.Cycle.today();
  var state = window.Store.load();

  var requested = new URLSearchParams(window.location.search).get("date");
  var activeDate =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested <= today ? requested : today;

  // What the form currently holds (one day at a time).
  var draft = { flow: "none", symptoms: [], mood: "", energy: 3, notes: "" };
  var flowButtons = {};
  var symptomButtons = {};
  var moodButtons = {};

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* --------------------------- build the options --------------------------- */
  function buildOptions() {
    var flowMount = byId("flowOptions");
    window.BloomData.flow.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "flow-opt";
      button.setAttribute("aria-pressed", "false");
      button.innerHTML =
        '<em aria-hidden="true">' + item.emoji + "</em><span>" + item.label + "</span>";
      button.addEventListener("click", function () {
        draft.flow = item.id;
        syncControls();
      });
      flowButtons[item.id] = button;
      flowMount.appendChild(button);
    });

    var symptomMount = byId("symptomOptions");
    window.BloomData.symptoms.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.setAttribute("aria-pressed", "false");
      button.innerHTML =
        '<span class="chip-emoji" aria-hidden="true">' + item.emoji + "</span>" + item.label;
      button.addEventListener("click", function () {
        var index = draft.symptoms.indexOf(item.id);
        if (index >= 0) draft.symptoms.splice(index, 1);
        else draft.symptoms.push(item.id);
        syncControls();
      });
      symptomButtons[item.id] = button;
      symptomMount.appendChild(button);
    });

    var moodMount = byId("moodOptions");
    window.BloomData.moods.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.setAttribute("aria-pressed", "false");
      button.innerHTML =
        '<span class="chip-emoji" aria-hidden="true">' + item.emoji + "</span>" + item.label;
      button.addEventListener("click", function () {
        draft.mood = draft.mood === item.id ? "" : item.id;
        syncControls();
      });
      moodButtons[item.id] = button;
      moodMount.appendChild(button);
    });
  }

  /* ----------------------------- form syncing ----------------------------- */
  function syncControls() {
    Object.keys(flowButtons).forEach(function (id) {
      flowButtons[id].setAttribute("aria-pressed", String(draft.flow === id));
    });
    Object.keys(symptomButtons).forEach(function (id) {
      symptomButtons[id].setAttribute(
        "aria-pressed",
        String(draft.symptoms.indexOf(id) >= 0)
      );
    });
    Object.keys(moodButtons).forEach(function (id) {
      moodButtons[id].setAttribute("aria-pressed", String(draft.mood === id));
    });

    byId("energyRange").value = draft.energy;
    byId("energyBadge").textContent = window.BloomData.energy[draft.energy] || "Okay";
    byId("notesInput").value = draft.notes;

    var saved = window.Store.getLog(state, activeDate);
    var badge = byId("entryBadge");
    var deleteButton = byId("deleteButton");

    if (saved) {
      badge.textContent = "Editing saved day";
      badge.className = "badge badge-pink";
      deleteButton.classList.remove("hidden");
      byId("saveButton").textContent = "Update check-in";
    } else {
      badge.textContent = "New entry";
      badge.className = "badge badge-soft";
      deleteButton.classList.add("hidden");
      byId("saveButton").textContent = "Save check-in";
    }
  }

  function resetDraft() {
    draft = { flow: "none", symptoms: [], mood: "", energy: 3, notes: "" };
  }

  function loadDate(dateKey) {
    activeDate = dateKey > today ? today : dateKey;
    byId("logDate").value = activeDate;

    var entry = window.Store.getLog(state, activeDate);
    resetDraft();
    if (entry) {
      draft.flow = entry.flow || "none";
      draft.symptoms = (entry.symptoms || []).slice();
      draft.mood = entry.mood || "";
      draft.energy = clamp(Number(entry.energy) || 3, 1, 5);
      draft.notes = entry.notes || "";
    }
    syncControls();
    renderCalendar();
  }

  /* ------------------------------- summary -------------------------------- */
  function renderSummary() {
    var info = window.Cycle.currentCycle(state);
    var mount = byId("summary");

    function item(label, value) {
      return '<div class="summary-item"><span>' + label + "</span><b>" + value + "</b></div>";
    }

    if (!info.hasData) {
      mount.innerHTML =
        item("Cycle day", "—") +
        item("Phase", "—") +
        item("Next period", "Add a date") +
        item("Average cycle", (Number(state.profile.cycleLength) || 28) + " days");
      return;
    }

    var phase = window.BloomData.phases[info.phase];
    var nextText = window.Cycle.pretty(info.nextPeriod, "short");
    if (info.daysUntil > 1) nextText += " · in " + info.daysUntil + "d";
    else if (info.daysUntil === 1) nextText += " · tomorrow";
    else if (info.daysUntil === 0) nextText += " · today";
    else nextText += " · " + info.daysUntil * -1 + "d late";

    mount.innerHTML =
      item("Cycle day", "Day " + info.cycleDay) +
      item("Phase", phase.emoji + " " + phase.label) +
      item("Next period", nextText) +
      item("Average cycle", info.cycleLength + " days") +
      item("Period length", info.periodLength + " days");
  }

  /* ---------------------------- entries list ------------------------------ */
  function entryMarkup(log) {
    var tags = [];
    var flow = window.BloomData.flow.find(function (item) {
      return item.id === (log.flow || "none");
    });
    if (flow && flow.id !== "none") {
      tags.push('<span class="tag flow">' + flow.label + " flow</span>");
    }
    (log.symptoms || []).forEach(function (id) {
      tags.push('<span class="tag">' + window.UI.symptomLabel(id) + "</span>");
    });
    if (log.mood) {
      var mood = window.UI.moodMeta(log.mood);
      tags.push('<span class="tag lav">' + mood.emoji + " " + mood.label + "</span>");
    }
    if (log.energy) {
      tags.push('<span class="tag lav">Energy · ' + window.UI.energyLabel(log.energy) + "</span>");
    }

    return (
      '<article class="entry">' +
      '<div class="entry-top">' +
      "<div>" +
      '<div class="entry-date">' + window.Cycle.pretty(log.date, "weekday") + "</div>" +
      (tags.length
        ? '<div class="entry-tags">' + tags.join("") + "</div>"
        : '<div class="entry-sub">Saved check-in</div>') +
      "</div>" +
      '<div class="entry-actions">' +
      '<button class="btn-icon" type="button" data-edit="' + log.date +
      '" aria-label="Edit ' + window.Cycle.pretty(log.date, "long") + '" title="Edit">✎</button>' +
      '<button class="btn-icon" type="button" data-delete="' + log.date +
      '" aria-label="Delete ' + window.Cycle.pretty(log.date, "long") + '" title="Delete">🗑</button>' +
      "</div>" +
      "</div>" +
      (log.notes
        ? '<p class="entry-note">“' + window.UI.escapeHtml(log.notes) + "”</p>"
        : "") +
      "</article>"
    );
  }

  function renderEntries() {
    var mount = byId("entryList");
    var logs = state.logs.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });

    byId("entryCount").textContent =
      logs.length + (logs.length === 1 ? " entry" : " entries");

    if (!logs.length) {
      mount.innerHTML =
        '<div class="empty-state">' +
        '<span class="empty-emoji">🌱</span>' +
        "<p>Nothing logged yet. Save your first check-in above — even a short note helps " +
        "patterns appear.</p></div>";
      return;
    }

    mount.innerHTML = logs.map(entryMarkup).join("");
  }

  /* ------------------------------ calendar -------------------------------- */
  function renderCalendar() {
    window.UI.renderCalendar(byId("trackerCalendar"), {
      state: state,
      selected: activeDate,
      onSelect: function (dateKey) {
        if (dateKey > today) {
          window.UI.toast("Future days can't be logged yet.");
          return;
        }
        loadDate(dateKey);
      }
    });
  }

  /* ------------------------------- actions -------------------------------- */
  function removeEntry(dateKey) {
    var entry = window.Store.getLog(state, dateKey);
    if (!entry) return;
    var label = window.Cycle.pretty(dateKey, "weekday");
    if (!window.confirm("Delete the check-in for " + label + "? This can't be undone.")) return;

    window.Store.deleteLog(dateKey);
    state = window.Store.load();
    loadDate(dateKey);
    renderSummary();
    renderEntries();
    window.UI.toast("Check-in deleted");
  }

  function renderAll() {
    state = window.Store.load();
    renderSummary();
    renderEntries();
    syncControls();
    renderCalendar();
  }

  /* -------------------------------- events -------------------------------- */
  function bindEvents() {
    byId("logDate").addEventListener("change", function (event) {
      var value = event.target.value;
      if (!value) return;
      if (value > today) {
        window.UI.toast("Future days can't be logged yet.");
        event.target.value = activeDate;
        return;
      }
      loadDate(value);
    });

    byId("energyRange").addEventListener("input", function (event) {
      draft.energy = Number(event.target.value);
      byId("energyBadge").textContent = window.BloomData.energy[draft.energy] || "Okay";
    });

    byId("notesInput").addEventListener("input", function (event) {
      draft.notes = event.target.value;
    });

    byId("logForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var date = byId("logDate").value || activeDate;

      if (!date) {
        window.UI.toast("Please choose a date first.");
        return;
      }
      if (date > today) {
        window.UI.toast("Future days can't be logged yet.");
        return;
      }

      window.Store.upsertLog({
        date: date,
        flow: draft.flow,
        symptoms: draft.symptoms.slice(),
        mood: draft.mood,
        energy: Number(draft.energy),
        notes: draft.notes.trim()
      });

      state = window.Store.load();
      activeDate = date;
      draft.notes = (window.Store.getLog(state, date) || {}).notes || "";
      renderAll();
      window.UI.toast("Check-in saved for " + window.Cycle.pretty(date, "weekday"));
    });

    byId("clearButton").addEventListener("click", function () {
      resetDraft();
      syncControls();
      window.UI.toast("Form cleared — nothing was deleted.");
    });

    byId("deleteButton").addEventListener("click", function () {
      removeEntry(activeDate);
    });

    byId("entryList").addEventListener("click", function (event) {
      var editTarget = event.target.closest("[data-edit]");
      if (editTarget) {
        loadDate(editTarget.getAttribute("data-edit"));
        byId("logCard").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      var deleteTarget = event.target.closest("[data-delete]");
      if (deleteTarget) removeEntry(deleteTarget.getAttribute("data-delete"));
    });

    byId("profileForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var length = clamp(Number(byId("cycleLength").value) || 28, 15, 60);
      var duration = clamp(Number(byId("periodDuration").value) || 5, 1, 12);
      var lastStart = byId("lastPeriod").value;

      window.Store.setProfile({
        name: byId("nameInput").value.trim().slice(0, 24),
        lastPeriodStart: lastStart,
        cycleLength: length,
        periodDuration: duration
      });

      state = window.Store.load();
      renderAll();
      window.UI.toast("Cycle settings saved");
    });

    byId("seedButton").addEventListener("click", function () {
      if (
        window.Store.load().logs.length &&
        !window.confirm("Sample data will replace what is saved now. Continue?")
      ) {
        return;
      }
      window.Store.seedDemo();
      state = window.Store.load();
      loadProfileForm();
      loadDate(window.Cycle.today());
      renderAll();
      window.UI.toast("Sample cycles loaded");
    });

    byId("resetButton").addEventListener("click", function () {
      if (!window.confirm("Clear every saved check-in and setting from this browser?")) return;
      window.Store.reset();
      state = window.Store.load();
      loadProfileForm();
      loadDate(window.Cycle.today());
      renderAll();
      window.UI.toast("All data cleared");
    });
  }

  function loadProfileForm() {
    var profile = state.profile;
    byId("nameInput").value = profile.name || "";
    byId("lastPeriod").value = profile.lastPeriodStart || "";
    byId("cycleLength").value = Number(profile.cycleLength) || 28;
    byId("periodDuration").value = Number(profile.periodDuration) || 5;
  }

  /* --------------------------------- init --------------------------------- */
  byId("logDate").max = today;
  byId("lastPeriod").max = today;

  buildOptions();
  loadProfileForm();
  loadDate(activeDate);
  bindEvents();
  renderAll();
})();
