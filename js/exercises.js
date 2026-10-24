/* =====================================================================
   Bloom Cycle — exercises page
   - symptom pickers that generate a gentle routine
   - the exercise library with "done today" markers
   ===================================================================== */

(function () {
  var byId = function (id) {
    return document.getElementById(id);
  };

  var selected = [];
  var today = window.Cycle.today();

  /* --------------------------- symptom pickers -------------------------- */
  byId("generatorOptions").innerHTML = window.BloomData.generatorSymptoms
    .map(function (item) {
      return (
        '<button class="chip" type="button" data-symptom="' + item.id +
        '" aria-pressed="false"><span class="chip-emoji" aria-hidden="true">' + item.emoji +
        "</span>" + item.label + "</button>"
      );
    })
    .join("");

  function updateSelected() {
    var label = byId("selectedCount");
    if (!selected.length) {
      label.textContent = "Nothing selected";
      return;
    }
    var names = selected.map(function (id) {
      var found = window.BloomData.generatorSymptoms.find(function (item) {
        return item.id === id;
      });
      return found ? found.label.toLowerCase() : id;
    });
    label.textContent = names.join(" + ");
  }

  document.querySelectorAll("[data-symptom]").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-symptom");
      var index = selected.indexOf(id);
      if (index >= 0) selected.splice(index, 1);
      else selected.push(id);
      button.setAttribute("aria-pressed", String(selected.indexOf(id) >= 0));
      updateSelected();
    });
  });

  /* ------------------------- routine generation ------------------------- */
  function pickRoutine(symptoms) {
    var exercises = window.BloomData.exercises;
    var scores = exercises.map(function (exercise) {
      var matches = exercise.tags.filter(function (tag) {
        return symptoms.indexOf(tag) >= 0;
      }).length;
      return { exercise: exercise, matches: matches };
    });

    var picks = [];

    // Make sure every feeling the user mentioned is covered at least once.
    symptoms.forEach(function (symptom) {
      var covered = picks.some(function (exercise) {
        return exercise.tags.indexOf(symptom) >= 0;
      });
      if (covered) return;

      var candidate = scores
        .slice()
        .sort(function (a, b) {
          return b.matches - a.matches;
        })
        .map(function (entry) {
          return entry.exercise;
        })
        .find(function (exercise) {
          return exercise.tags.indexOf(symptom) >= 0 && picks.indexOf(exercise) === -1;
        });

      if (candidate) picks.push(candidate);
    });

    // Add one or two supportive extras, preferring shorter options.
    var limit = symptoms.length >= 3 ? 4 : 3;
    scores
      .slice()
      .sort(function (a, b) {
        if (b.matches !== a.matches) return b.matches - a.matches;
        return a.exercise.minutes - b.exercise.minutes;
      })
      .forEach(function (entry) {
        if (picks.length < limit && picks.indexOf(entry.exercise) === -1 && entry.matches > 0) {
          picks.push(entry.exercise);
        }
      });

    // Gentle fallback if nothing matched.
    if (!picks.length) {
      picks.push(
        window.BloomData.exercises.find(function (exercise) {
          return exercise.id === "breathing";
        })
      );
    }

    return picks
      .filter(Boolean)
      .sort(function (a, b) {
        return a.minutes - b.minutes;
      });
  }

  function renderRoutine() {
    var mount = byId("routineResult");

    if (!selected.length) {
      window.UI.toast("Pick how you are feeling first.");
      mount.innerHTML =
        '<div class="routine-box"><p class="small muted">Choose one or more feelings above ' +
        "and tap “Suggest a routine” for a short, gentle sequence.</p></div>";
      return;
    }

    var routine = pickRoutine(selected);
    var total = routine.reduce(function (sum, exercise) {
      return sum + exercise.minutes;
    }, 0);

    var names = selected.map(function (id) {
      var found = window.BloomData.generatorSymptoms.find(function (item) {
        return item.id === id;
      });
      return found ? found.label.toLowerCase() : id;
    });

    var restNote = selected.indexOf("fatigue") >= 0 || selected.indexOf("cramps") >= 0
      ? "If you are exhausted or in real pain today, skip the movement and rest instead — " +
        "breathing slowly for a few minutes is a complete routine."
      : "Go at your own pace and stop whenever you like. Even one minute is worthwhile.";

    mount.innerHTML =
      '<div class="routine-box">' +
      '<p class="small muted">A gentle routine for <strong>' + names.join(", ") + "</strong></p>" +
      '<ol class="routine-items">' +
      routine
        .map(function (exercise, index) {
          return (
            "<li><span>" + (index + 1) + ". " + exercise.emoji + " " + exercise.name +
            '</span><span class="muted">' + exercise.minutes + " min</span></li>"
          );
        })
        .join("") +
      "</ol>" +
      '<p class="routine-total">About ' + total + " minutes in total · beginner friendly</p>" +
      '<p class="small muted" style="margin-top: 8px">' + restNote + "</p>" +
      "</div>";
  }

  byId("generateButton").addEventListener("click", renderRoutine);

  byId("resetGenerator").addEventListener("click", function () {
    selected = [];
    document.querySelectorAll("[data-symptom]").forEach(function (button) {
      button.setAttribute("aria-pressed", "false");
    });
    updateSelected();
    byId("routineResult").innerHTML = "";
  });

  /* --------------------------- exercise library ------------------------- */
  function renderLibrary() {
    var done = window.Store.exerciseList(today);
    var mount = byId("exerciseGrid");

    mount.innerHTML = window.BloomData.exercises
      .map(function (exercise) {
        var isDone = done.indexOf(exercise.id) >= 0;
        var steps = exercise.steps
          .map(function (step, index) {
            return '<li><span class="num" aria-hidden="true">' + (index + 1) + "</span><span>" +
              step + "</span></li>";
          })
          .join("");

        return (
          '<article class="ex-card' + (isDone ? " is-done" : "") + '">' +
          '<div class="ex-top">' +
          '<span class="ex-emoji" aria-hidden="true">' + exercise.emoji + "</span>" +
          "<div>" +
          '<h3 class="ex-title">' + exercise.name + "</h3>" +
          '<div class="ex-meta">' +
          '<span class="badge badge-soft">' + exercise.difficulty + "</span>" +
          '<span class="badge badge-pink">' + exercise.duration + "</span>" +
          "</div></div></div>" +
          '<p class="ex-desc">' + exercise.description + "</p>" +
          '<ul class="ex-steps">' + steps + "</ul>" +
          '<p class="ex-benefit"><strong>Benefits:</strong> ' + exercise.benefits + "</p>" +
          '<div class="ex-foot">' +
          '<span class="small muted">' + (isDone ? "Completed today — well done" : "No equipment needed") + "</span>" +
          '<button class="btn ' + (isDone ? "btn-primary" : "btn-soft") + ' btn-sm" type="button" ' +
          'data-complete="' + exercise.id + '" aria-pressed="' + (isDone ? "true" : "false") + '">' +
          (isDone ? "Done ✓" : "Mark done") +
          "</button>" +
          "</div></article>"
        );
      })
      .join("");

    byId("doneBadge").textContent = done.length + " done today";
  }

  byId("exerciseGrid").addEventListener("click", function (event) {
    var button = event.target.closest("[data-complete]");
    if (!button) return;
    var id = button.getAttribute("data-complete");
    var done = window.Store.exerciseList(today);
    var wasDone = done.indexOf(id) >= 0;

    window.Store.toggleExercise(id, today);
    renderLibrary();
    window.UI.toast(wasDone ? "Marked as not done" : "Lovely — marked as done for today");
  });

  updateSelected();
  renderLibrary();
})();
