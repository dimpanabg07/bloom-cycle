/* =====================================================================
   Bloom Cycle — data storage
   Everything is kept in localStorage on this device only.
   Structure:
     profile      : name, lastPeriodStart, cycleLength, periodDuration
     logs         : one entry per day { date, flow, symptoms, mood, ... }
     exerciseDone : { "2026-10-24": ["cat-cow", "walking"] }
   ===================================================================== */

window.Store = (function () {
  var KEY = "bloomcycle.v1";
  var listeners = [];

  function defaults() {
    return {
      profile: { name: "", lastPeriodStart: "", cycleLength: 28, periodDuration: 5 },
      logs: [],
      exerciseDone: {},
      periodStarts: []
    };
  }

  function isLog(value) {
    return value && typeof value.date === "string" && value.date.length === 10;
  }

  function load() {
    var empty = defaults();
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return empty;
      var saved = JSON.parse(raw);
      return {
        profile: Object.assign(empty.profile, saved.profile || {}),
        logs: Array.isArray(saved.logs) ? saved.logs.filter(isLog) : [],
        exerciseDone:
          saved.exerciseDone && typeof saved.exerciseDone === "object" ? saved.exerciseDone : {},
        periodStarts: Array.isArray(saved.periodStarts) ? saved.periodStarts : []
      };
    } catch (error) {
      console.warn("Bloom Cycle: saved data could not be read.", error);
      return empty;
    }
  }

  function save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Bloom Cycle: data could not be saved.", error);
    }
    listeners.forEach(function (listener) {
      listener(state);
    });
    return state;
  }

  function update(mutator) {
    var state = load();
    var result = mutator(state);
    save(state);
    return result;
  }

  /* ----------------------------- profile ---------------------------- */
  function setProfile(patch) {
    return update(function (state) {
      Object.assign(state.profile, patch);
      return state.profile;
    });
  }

  /* ---------------------------- daily logs -------------------------- */
  function getLog(state, date) {
    return state.logs.find(function (log) {
      return log.date === date;
    }) || null;
  }

  function upsertLog(entry) {
    return update(function (state) {
      var index = state.logs.findIndex(function (log) {
        return log.date === entry.date;
      });
      var record = Object.assign({ updatedAt: Date.now() }, entry);
      if (index >= 0) {
        state.logs[index] = Object.assign({}, state.logs[index], record);
      } else {
        state.logs.push(record);
      }
      state.logs.sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
      });
      return record;
    });
  }

  function deleteLog(date) {
    return update(function (state) {
      state.logs = state.logs.filter(function (log) {
        return log.date !== date;
      });
    });
  }

  /* --------------------------- exercises ---------------------------- */
  function exerciseList(date) {
    var state = load();
    return state.exerciseDone[date] || [];
  }

  function toggleExercise(exerciseId, date) {
    var day = date || window.Cycle.today();
    return update(function (state) {
      var done = state.exerciseDone[day] || [];
      var index = done.indexOf(exerciseId);
      if (index >= 0) done.splice(index, 1);
      else done.push(exerciseId);
      state.exerciseDone[day] = done;
      return done;
    });
  }

  /* ----------------------------- helpers ---------------------------- */
  // Consecutive days with a saved entry, counting back from today.
  function loggingStreak(state) {
    var days = {};
    state.logs.forEach(function (log) {
      days[log.date] = true;
    });

    var cursor = window.Cycle.today();
    if (!days[cursor]) cursor = window.Cycle.addDays(cursor, -1);

    var streak = 0;
    while (days[cursor]) {
      streak += 1;
      cursor = window.Cycle.addDays(cursor, -1);
    }
    return streak;
  }

  function onChange(listener) {
    listeners.push(listener);
  }

  function reset() {
    window.localStorage.removeItem(KEY);
    save(defaults());
  }

  /* --------------------------- sample data -------------------------- */
  // A few cycles of realistic entries so every chart has something to show.
  function seedDemo() {
    var today = window.Cycle.today();
    var starts = [
      window.Cycle.addDays(today, -96),
      window.Cycle.addDays(today, -68),
      window.Cycle.addDays(today, -39),
      window.Cycle.addDays(today, -12)
    ];
    var flows = ["heavy", "heavy", "medium", "light", "light"];
    var logs = [];

    starts.forEach(function (start, cycleIndex) {
      flows.forEach(function (flow, dayIndex) {
        var day = window.Cycle.addDays(start, dayIndex);
        if (day > today) return;
        var symptoms = [];
        if (dayIndex <= 1) symptoms.push("cramps");
        if (dayIndex >= 2) symptoms.push("bloating");
        if (dayIndex === 0) symptoms.push("fatigue");
        if (cycleIndex === 2 && dayIndex === 0) symptoms.push("headache");
        logs.push({
          date: day,
          flow: flow,
          symptoms: symptoms,
          mood: dayIndex <= 1 ? "sensitive" : "calm",
          energy: dayIndex <= 1 ? 2 : 3,
          notes: ""
        });
      });

      [21, 24, 26].forEach(function (offset) {
        var day = window.Cycle.addDays(start, offset);
        if (day > today) return;
        if (logs.some(function (log) { return log.date === day; })) return;
        var symptoms = offset >= 24 ? ["bloating", "moodSwings"] : ["acne"];
        if (cycleIndex % 2 === 0 && offset === 26) symptoms.push("breastTenderness");
        logs.push({
          date: day,
          flow: "none",
          symptoms: symptoms,
          mood: offset === 26 ? "irritable" : "sensitive",
          energy: 3,
          notes: offset === 26 && cycleIndex === 1 ? "Felt low after a short night." : ""
        });
      });
    });

    logs.sort(function (a, b) {
      return a.date < b.date ? -1 : 1;
    });

    var state = defaults();
    state.profile = {
      name: "",
      lastPeriodStart: starts[starts.length - 1],
      cycleLength: 28,
      periodDuration: 5
    };
    state.logs = logs;
    state.exerciseDone = {};
    state.periodStarts = [];
    save(state);
    return state;
  }

  return {
    key: KEY,
    load: load,
    save: save,
    update: update,
    onChange: onChange,
    setProfile: setProfile,
    getLog: getLog,
    upsertLog: upsertLog,
    deleteLog: deleteLog,
    exerciseList: exerciseList,
    toggleExercise: toggleExercise,
    loggingStreak: loggingStreak,
    reset: reset,
    seedDemo: seedDemo
  };
})();
