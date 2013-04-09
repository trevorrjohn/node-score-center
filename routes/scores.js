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
      score = req.body.score;

  if ( game_title && username && score ) {
    db.collection('highscores', function (err, collection) {
      var new_score = { game_title: game_title, username: username, score: score };

      collection.insert( new_score, { safe: true }, function (err, result) {
        if (err) {
          res.send({ error: 'An error has occurred' })
        } else {
          process.stdout.write( "Success: " + JSON.stringify(result[0]))
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
