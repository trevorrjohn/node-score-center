var mongo = require('mongodb')
  , error = require('../helpers/errors')

/* Database configurationg */
var mongoUri = process.env.DATABASE_URL || 'mongodb://localhost/scorecenter';

var db = mongo.Db.connect(mongoUri, function (err, dbConnection) {
  if (err) { error.output("Error connecting to database: " + err + "\n") }
  else db = dbConnection;
})


/* GET '/index' */
exports.index = function (req, res) {
  db.collection('highscores', function(err, highscores) {
    if (err) {
      error.write(err, req)
    } else {
      highscores.find().sort({ created_at: -1 }).toArray( function (err, items) {
        if (err) {
          error.write(err, req)
        } else {
          res.render('index', { title: 'Scores', scores: items })
        }
      })
    }
  })
}

/* POST '/submit.json' */
exports.create = function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var new_score = {
        game_title: req.body.game_title,
        username: req.body.username,
        score: parseInt(req.body.score),
        created_at: new Date }

  if ( new_score.game_title && new_score.username && new_score.score ) {
    db.collection('highscores', function (err, highscores) {
      if (err) {
        error.write(err, req)
      } else {
        highscores.insert( new_score, { safe: true }, function (err, result) {
          if (err) {
            error.write(err, req)
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

/* GET '/highscores.json' */
exports.highscores = function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var game_title = req.query.game_title
  if (game_title) {
    db.collection('highscores', function(err, highscores) {
      if (err) {
        error.write(err, req)
      } else {
        highscores.find({ game_title: game_title }).
                   sort({ score: -1 }).
                   limit(10).
                   toArray( function (err, items) {
                     if (err) {
                       error.write(err, req)
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

/* GET '/usersearch' */
exports.usersearch = function (req, res) {
  res.render('usersearch', { title: 'Search' })
}

/* POST '/usersearch' */
exports.search = function (req, res) {
  var username = req.body.username
  if (username) {
    db.collection('highscores', function(err, highscores) {
      if (err) {
        error.write(err, req)
      } else {
        highscores.find({ username: username }).toArray( function (err, items) {
          if (err) {
            error.write(err, req)
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
