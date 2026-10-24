/* =====================================================================
   Bloom Cycle — cycle maths
   Pure helper functions: date handling, period detection, averages,
   phase estimation and per-cycle summaries. No DOM code lives here.
   ===================================================================== */

window.Cycle = (function () {
  var DAY_MS = 24 * 60 * 60 * 1000;
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  var DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* ---------------------------- dates ---------------------------- */
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function key(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  // Turns "2026-10-24" into a local Date at midnight.
  function parse(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    var parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return isNaN(date.getTime()) ? null : date;
  }

  function today() {
    return key(new Date());
  }

  function addDays(value, amount) {
    var date = parse(value);
    if (!date) return null;
    date.setDate(date.getDate() + amount);
    return key(date);
  }

  // Positive when `to` is later than `from`.
  function diffDays(from, to) {
    var a = parse(from);
    var b = parse(to);
    if (!a || !b) return NaN;
    return Math.round((b.getTime() - a.getTime()) / DAY_MS);
  }

  function pretty(value, style) {
    var date = parse(value);
    if (!date) return "—";
    if (style === "short") {
      return date.getDate() + " " + MONTHS_SHORT[date.getMonth()];
    }
    if (style === "long") {
      return date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();
    }
    if (style === "weekday") {
      return DAYS_SHORT[date.getDay()] + ", " + date.getDate() + " " + MONTHS_SHORT[date.getMonth()];
    }
    return MONTHS_SHORT[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  }

  function monthLabel(date) {
    return MONTHS[date.getMonth()] + " " + date.getFullYear();
  }

  /* ----------------------- period detection ---------------------- */
  // Groups logged flow days into period episodes. A gap of two days
  // (one missed log) still counts as the same period.
  function periodRuns(logs) {
    var flowDays = (logs || [])
      .filter(function (log) {
        return log.flow && log.flow !== "none";
      })
      .map(function (log) {
        return log.date;
      })
      .sort();

    var runs = [];
    flowDays.forEach(function (day) {
      var last = runs[runs.length - 1];
      if (last && diffDays(last.end, day) <= 2) {
        last.end = day;
      } else {
        runs.push({ start: day, end: day });
      }
    });
    return runs;
  }

  // Every date that looks like the first day of a cycle.
  function cycleStarts(state) {
    var keys = [];
    periodRuns(state.logs).forEach(function (run) {
      keys.push(run.start);
    });
    if (state.profile && state.profile.lastPeriodStart) {
      keys.push(state.profile.lastPeriodStart);
    }
    (state.periodStarts || []).forEach(function (day) {
      keys.push(day);
    });

    var sorted = keys
      .filter(function (day) {
        return !!parse(day);
      })
      .sort()
      .filter(function (day, index, list) {
        return list.indexOf(day) === index;
      });

    // Two starts closer than 10 days are almost certainly the same period.
    var merged = [];
    sorted.forEach(function (day) {
      var last = merged[merged.length - 1];
      if (!last || diffDays(last, day) >= 10) merged.push(day);
    });
    return merged;
  }

  function mean(numbers) {
    if (!numbers.length) return 0;
    var total = numbers.reduce(function (sum, n) {
      return sum + n;
    }, 0);
    return Math.round(total / numbers.length);
  }

  function avgCycleLength(state) {
    var starts = cycleStarts(state);
    var lengths = [];
    for (var i = 1; i < starts.length; i++) {
      var length = diffDays(starts[i - 1], starts[i]);
      if (length >= 15 && length <= 60) lengths.push(length);
    }
    var fallback = Number((state.profile || {}).cycleLength) || 28;
    if (!lengths.length) return Math.min(60, Math.max(15, fallback));
    return mean(lengths);
  }

  function avgPeriodLength(state) {
    var runs = periodRuns(state.logs);
    var lengths = runs
      .map(function (run) {
        return diffDays(run.start, run.end) + 1;
      })
      .filter(function (length) {
        return length >= 2 && length <= 10;
      });
    if (lengths.length >= 2) return mean(lengths);
    var fallback = Number((state.profile || {}).periodDuration) || 5;
    return Math.min(10, Math.max(2, fallback));
  }

  function cycleLengthSpread(state) {
    var starts = cycleStarts(state);
    var lengths = [];
    for (var i = 1; i < starts.length; i++) {
      var length = diffDays(starts[i - 1], starts[i]);
      if (length >= 15 && length <= 60) lengths.push(length);
    }
    if (lengths.length < 2) return null;
    return {
      shortest: Math.min.apply(null, lengths),
      longest: Math.max.apply(null, lengths)
    };
  }

  /* --------------------------- phases --------------------------- */
  function ovulationDay(cycleLength, periodLength) {
    var day = cycleLength - 14;
    return Math.max(periodLength + 3, Math.min(day, cycleLength - 2));
  }

  function phaseForDay(cycleDay, cycleLength, periodLength) {
    var ovulation = ovulationDay(cycleLength, periodLength);
    if (cycleDay <= periodLength) return "menstrual";
    if (Math.abs(cycleDay - ovulation) <= 1) return "ovulation";
    if (cycleDay < ovulation) return "follicular";
    return "luteal";
  }

  /* ------------------- today's cycle position ------------------- */
  function currentCycle(state, dayKey) {
    var ref = dayKey || today();
    var starts = cycleStarts(state);
    if (!starts.length) {
      return { hasData: false };
    }

    var length = avgCycleLength(state);
    var periodLength = avgPeriodLength(state);
    var past = starts.filter(function (start) {
      return start <= ref;
    });
    var seed = past.length ? past[past.length - 1] : starts[0];
    var elapsed = diffDays(seed, ref);
    var cycleDay = Math.max(1, elapsed + 1);
    var phaseDay = Math.min(cycleDay, length);
    var nextDate = addDays(seed, length);
    var daysUntil = diffDays(ref, nextDate);

    return {
      hasData: true,
      lastStart: seed,
      cycleDay: cycleDay,
      cycleLength: length,
      periodLength: periodLength,
      phase: phaseForDay(phaseDay, length, periodLength),
      ovulationDay: ovulationDay(length, periodLength),
      nextPeriod: nextDate,
      daysUntil: daysUntil,
      isLate: daysUntil < 0,
      progress: Math.min(1, cycleDay / length),
      cyclesTracked: Math.max(0, starts.length - 1),
      isEstimate: true
    };
  }

  /* ------------------ phase for any calendar day ------------------ */
  function dayInfo(state, dayKey) {
    var starts = cycleStarts(state);
    if (!starts.length) return null;

    var past = starts.filter(function (start) {
      return start <= dayKey;
    });
    if (!past.length) return null;

    var length = avgCycleLength(state);
    var periodLength = avgPeriodLength(state);
    var seed = past[past.length - 1];
    var elapsed = diffDays(seed, dayKey);
    var isFuture = dayKey > today();
    var predicted = false;

    if (elapsed >= length) {
      if (isFuture) {
        elapsed = elapsed % length;
        predicted = true;
      } else {
        // Keep late days in the luteal band rather than restarting the cycle.
        elapsed = length - 1;
      }
    }

    var cycleDay = elapsed + 1;
    return {
      cycleDay: cycleDay,
      phase: phaseForDay(cycleDay, length, periodLength),
      predicted: predicted,
      cycleLength: length
    };
  }

  /* --------------------- per-cycle summaries -------------------- */
  function countSymptoms(logs) {
    var counts = {};
    (logs || []).forEach(function (log) {
      (log.symptoms || []).forEach(function (id) {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  }

  function countMoods(logs) {
    var counts = {};
    (logs || []).forEach(function (log) {
      if (log.mood) counts[log.mood] = (counts[log.mood] || 0) + 1;
    });
    return counts;
  }

  function avgEnergy(logs) {
    var values = (logs || [])
      .map(function (log) {
        return Number(log.energy);
      })
      .filter(function (n) {
        return n >= 1 && n <= 5;
      });
    if (!values.length) return null;
    return values.reduce(function (a, b) {
      return a + b;
    }, 0) / values.length;
  }

  function buildCycles(state) {
    var starts = cycleStarts(state);
    var length = avgCycleLength(state);

    return starts.map(function (start, index) {
      var next = starts[index + 1] || null;
      var end = next ? addDays(next, -1) : addDays(start, length - 1);
      var logs = state.logs
        .filter(function (log) {
          return log.date >= start && log.date <= end;
        })
        .sort(function (a, b) {
          return a.date < b.date ? -1 : 1;
        });
      var flowDays = logs.filter(function (log) {
        return log.flow && log.flow !== "none";
      });
      var lastFlow = flowDays.length ? flowDays[flowDays.length - 1].date : null;

      return {
        start: start,
        end: end,
        isCurrent: !next,
        length: next ? diffDays(start, next) : null,
        periodLength: lastFlow ? diffDays(start, lastFlow) + 1 : null,
        logs: logs,
        trackedDays: logs.length,
        symptoms: countSymptoms(logs),
        moods: countMoods(logs),
        energy: avgEnergy(logs)
      };
    });
  }

  return {
    parse: parse,
    key: key,
    today: today,
    addDays: addDays,
    diffDays: diffDays,
    pretty: pretty,
    monthLabel: monthLabel,
    periodRuns: periodRuns,
    cycleStarts: cycleStarts,
    avgCycleLength: avgCycleLength,
    avgPeriodLength: avgPeriodLength,
    cycleLengthSpread: cycleLengthSpread,
    ovulationDay: ovulationDay,
    phaseForDay: phaseForDay,
    currentCycle: currentCycle,
    dayInfo: dayInfo,
    buildCycles: buildCycles,
    countSymptoms: countSymptoms,
    countMoods: countMoods,
    avgEnergy: avgEnergy
  };
})();
