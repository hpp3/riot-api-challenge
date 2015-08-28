
/*
 * GET home page.
 */
var data = {}

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};
exports.items = function(req, res){
  console.log(data);
  res.render('items', { title: 'Express' })
};
exports.passData = function(key,value) {
   data[key] = value; 
}
