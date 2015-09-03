
/*
 * GET home page.
 */
var data = {}

exports.index = function(req, res){
  res.render('index', { title: 'APItems' })
};
exports.items = function(req, res){
  res.render('items', { title: 'APItems' })
};
exports.champ_chart = function(req, res){
  res.render('champ_chart', { title: 'APItems' })
};
exports.champ_page = function(req, res){
  res.render('champ_page', {id: req.param.id, ap: req.query.ap})
};
exports.about = function(req, res){
  res.render('about', { title: 'APItems' })
};
