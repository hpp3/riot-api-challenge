
/*
 * GET home page.
 */
var data = {}

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};
exports.items = function(req, res){
  res.render('items', {})
};
exports.champ_chart = function(req, res){
  res.render('champ_chart', {})
};
