(function ($) {
  function findScores () {
    var query = $("#input").val();

    if (query) {
      $("#results").remove()

      $.post("/usersearch", { username: query }, function(data) {
        var scores = data.scores
        var html = "<div id='results'><hr/><table><thead><tr><th>Username</th>" +
          "<th>Game Title</th><th>Score</th></tr></thead>"+
          "<tbody>";

        if (scores.length != 0) {
          for ( i in scores) {
            html += "<tr><td>" + scores[i].username + "</td>"
            html += "<td>" + scores[i].game_title + "</td>"
            html += "<td>" + scores[i].score + "</td></tr>"
          }
          html += "</tbody></table></div>"
        } else {
          html = "<div id='results'><hr/><p><strong>Whoops!</strong> No results found</p></div>"
        }
        $("#results-wrapper").append(html)
      })
    }
  }

  $( function () {
    $("#search").submit( function (e) {
      e.preventDefault()
      findScores()
    })
  })
})(jQuery)
