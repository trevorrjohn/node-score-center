var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('Scorecenter', server, {safe: true});

db.open( function (err, db) {
  if (!err) {
    console.log("Connected to 'scores' database")
    db.collection('highscores', { safe: true })
    db.collection('highscores', function (err, collection) {
      collection.insert( {game_title: 'Frogger', username: 'trevor', score: 4000}, {safe: true}, function (err, result) {
        if (err) {
          console.log("Error adding seed data")
        } else {
          console.log("Seed data added")
        }
      })
      collection.find().toArray( function (err, items) {
        console.log(items)
      })
    })
  }
})

exports.create = function (req, res) {
  var game_title = req.body.game_title,
      username = req.body.username,
      score = req.body.score;

  if ( game_title && username && score ) {
    db.collection('highscores', function (err, collection) {
      var new_score = { game_title: game_title, username: username, score: score };

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

exports.index = function(req, res){
  db.collection('highscores', function(err, collection) {
    collection.find().toArray( function (err, items) {
      res.render('index', { title: 'Scores', scores: items } )
    })
  })
};
