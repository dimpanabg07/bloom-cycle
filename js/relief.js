/* =====================================================================
   Bloom Cycle — PMS relief page
   Renders the remedy cards from BloomData.remedies.
   ===================================================================== */

(function () {
  var mount = document.getElementById("remedyGrid");
  if (!mount) return;

  mount.innerHTML = window.BloomData.remedies
    .map(function (remedy) {
      var howTo = remedy.howTo
        .map(function (step) {
          return "<li>" + step + "</li>";
        })
        .join("");
      var benefits = remedy.benefits
        .map(function (benefit) {
          return "<li>" + benefit + "</li>";
        })
        .join("");

      return (
        "<article class=\"remedy\">" +
        '<div class="remedy-head">' +
        '<span class="remedy-emoji" aria-hidden="true">' + remedy.emoji + "</span>" +
        "<h3>" + remedy.name + "</h3>" +
        "</div>" +
        '<div class="remedy-block"><h4>How to try it</h4><ul>' + howTo + "</ul></div>" +
        '<div class="remedy-block"><h4>Potential benefits</h4><ul>' + benefits + "</ul></div>" +
        '<p class="precautions"><strong>Keep in mind:</strong> ' + remedy.precautions + "</p>" +
        "</article>"
      );
    })
    .join("");
})();
