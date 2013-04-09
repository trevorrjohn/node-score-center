var express = require('express')
  , routes = require('./routes')
  , scores = require('./routes/scores')
  , http = require('http')
  , path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', scores.index);
app.get('/highscores.json', scores.all);
app.get('/usersearch', scores.usersearch);
app.post('/usersearch', scores.search);
app.post('/submit.json', scores.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
