var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/scorecenter';
var db = mongo.Db.connect(mongoUri, function (err, dbConnection) {
  if (err)
    console.log("Error: No database connection")
  else
    db = dbConnection;
    db.collection('highscores', function (err, collection) {
      collection.insert({game_title: "Pacman", username: "Trevor", score: 45}, {safe: true}, function (err, result) {
        if (err) {
          console.log( "error: 'Nothing was inserted'" )
          console.log(err)
        } else {
          console.log( "Success: " + JSON.stringify(result[0]))
        }
      })
    })
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
