var mongo = require('mongodb');

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/scorecenter';
var db = mongo.Db.connect(mongoUri, function (err, dbConnection) {
  if (err) { process.stderr.write("Error connecting to database: " + err + "\n") }
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
      if (err) { process.stderr.write("Error creating highscore" + err + "\n") }
      else {
        var new_score = { game_title: game_title, username: username, score: score, created_at: new Date };

        collection.insert( new_score, { safe: true }, function (err, result) {
          if (err) {
            process.stderr.write("Error inserting new highscore: " + err + "\n")
            res.send({ error: 'An error has occurred' })
          } else res.send( result[0] )
        })
      }
    })
  } else {
    res.send({ error: 'Not all of the required params were sent' })
  }
}

exports.index = function (req, res) {
  db.collection('highscores', function(err, collection) {
    if (err) { process.stderr.write( "Error in collection in index: " + err + "\n") }
    else {
      collection.find().toArray( function (err, items) {
        if (err) { process.stderr.write("Error in find in index: " + err + "\n") }
        else res.render('index', { title: 'Scores', scores: items })
      })
    }
  })
};

exports.highscores = function (req, res) {
  var game_title = req.query.game_title
  if (game_title) {
    db.collection('highscores', function(err, collection) {
      if (err) { process.stderr.write( "Error in collection in all: " + err + "\n") }
      else {
        highscores.find({ game_title: game_title }).sort({ score: -1 }).limit(10).toArray( function (err, items) {
          if (err) { process.stderr.write("Error in highscores in find: " + err + "\n") }
          else res.send(items)
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
    db.collection('highscores', function(err, collection) {
      if (err) { process.stderr.write("Error in search in collection: " + err + "\n") }
      else {
        collection.find({ username: username }).toArray( function (err, items) {
          if (err) { process.stderr.write("Error in search in find: " + err + "\n") }
          else res.send({ status: "Complete", scores: items })
        })
      }
    })
  } else {
    res.send({scores: [], status: "No 'username' found in body."})
  }
}
