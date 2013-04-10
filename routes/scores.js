var mongo = require('mongodb');

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/scorecenter';

var db = mongo.Db.connect(mongoUri, function (err, dbConnection) {
  if (err) { outputError("Error connecting to database: " + err + "\n") }
  else db = dbConnection;
})

exports.create = function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var game_title = req.body.game_title,
  username = req.body.username,
  score = parseInt(req.body.score);

  if ( game_title && username && score ) {
    db.collection('highscores', function (err, highscores) {
      if (err) {
        writeError(err, req)
      } else {
        var new_score = { game_title: game_title, username: username, score: score, created_at: new Date };

        highscores.insert( new_score, { safe: true }, function (err, result) {
          if (err) {
            writeError(err, req)
            res.send({ error: 'An error has occurred' })
          } else {
            res.send( result[0] )
          }
        })
      }
    })
  } else {
    res.send({ error: 'Not all of the required params were sent' })
  }
}

exports.index = function (req, res) {
  db.collection('highscores', function(err, highscores) {
    if (err) {
      writeError(err, req)
    } else {
      highscores.find().sort({ created_at: -1 }).toArray( function (err, items) {
        if (err) {
          writeError(err, req)
        } else {
          res.render('index', { title: 'Scores', scores: items })
        }
      })
    }
  })
};

exports.highscores = function (req, res) {
  var game_title = req.query.game_title
  if (game_title) {
    db.collection('highscores', function(err, highscores) {
      if (err) {
        writeError(err, req)
      } else {
        highscores.find({ game_title: game_title }).
                   sort({ score: -1 }).
                   limit(10).
                   toArray( function (err, items) {
                     if (err) {
                       writeError(err, req)
                     } else {
                       res.send(items)
                     }
        })
      }
    })
  } else {
    res.send( [] )
  }
}

exports.usersearch = function (req, res) {
  res.render('usersearch', { title: 'Search' })
}

exports.search = function (req, res) {
  var username = req.body.username
  if (username) {
    db.collection('highscores', function(err, highscores) {
      if (err) {
        writeError(err, req)
      } else {
        highscores.find({ username: username }).toArray( function (err, items) {
          if (err) {
            writeError(err, req)
          } else {
            res.send({ status: "Complete", scores: items })
          }
        })
      }
    })
  } else {
    res.send({scores: [], status: "No 'username' found in body."})
  }
}

/* Error handling */

var writeError = function (error, req) {
  outputError(error + "\n")
  outputError(req.route + "\n")
  if (req.query.game_title)
    outputError(req.query + "\n")
  if (req.body.game_title || req.body.username || req.body.score)
    outputError(req.body + "\n")
}

var outputError = function (msg) {
  if (process.env.ENV == 'production') {
    process.stderr.write(msg)
  } else {
    console.log(msg)
  }
}
