var mongo = require('mongodb');

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/scorecenter';
var db = mongo.Db.connect(mongoUri, function (err, dbConnection) {
  if (err) process.stderr.write("Error: No database connection")
  else db = dbConnection;
})

exports.create = function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var game_title = req.body.game_title,
      username = req.body.username,
      score = parseInt(req.body.score);

  if ( game_title && username && score ) {
    db.collection('highscores', function (err, collection) {
      var new_score = { game_title: game_title, username: username, score: score, created_at: new Date };

      collection.insert( new_score, { safe: true }, function (err, result) {
        if (err) {
          res.send({ error: 'An error has occurred' })
        } else {
          console.log( "Success: " + JSON.stringify(result[0]))
          res.send( result[0] )
        }
      })
    })
  } else {
    res.send({ error: 'Not all of the required params were sent' })
  }
}

exports.index = function (req, res) {
  db.collection('highscores', function(err, collection) {
    collection.find().toArray( function (err, items) {
      res.render('index', { title: 'Scores', scores: items })
    })
  })
};

exports.all = function (req, res) {
  var game_title = req.query.game_title
  if (game_title) {
  db.collection('highscores', function(err, collection) {
    collection.find({ game_title: game_title }).sort({ score: -1 }).limit(10).toArray( function (err, items) {
      if (err) process.stdout.write(err)
      else res.send(items)
    })
  })
  } else {
    res.send( {} )
  }
}

exports.usersearch = function (req, res) {
  res.render('usersearch', { title: 'Search' })
}

exports.search = function (req, res) {
  var username = req.body.username
  if (username) {
    db.collection('highscores', function(err, collection) {
      collection.find({ username: username }).toArray( function (err, items) {
        res.send({ status: "Query preformed", scores: items })
      })
    })
  } else {
    res.send({scores: [], status: "No 'username' found in body."})
  }
}
