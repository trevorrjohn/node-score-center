/* Error handling */

var write = function (error, req) {
  output(error)
  output(req.route)
  if (req.query.game_title)
    output(req.query)
  if (req.body.game_title || req.body.username || req.body.score)
    output(req.body)
}

var output = function (msg) {
  if (process.env.ENV == 'production') {
    process.stderr.write(msg)
  } else {
    console.log(msg)
  }
}

exports.write = write;
exports.output = output;
