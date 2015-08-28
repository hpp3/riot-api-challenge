window.addEventListener('load', function(){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var y = d3.scale.linear().range([height, 0]);
  var x = d3.scale.linear().range([0, width]);
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(10, "%");
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");
  var color = d3.scale.category20();


  var svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top+')');
  var infobox = d3.select('#chart').append('div')
    .attr('class', 'infobox');

  infobox.append('div').attr('class', 'name');
  infobox.append('div').attr('class', 'popularity');
  infobox.append('div').attr('class', 'winrate');
  function popularity(d) {
    return d.popularity;  
  }
  function winrate(d) {
    return d.winrate;  
  }
  function id(d) {
    return d.id;
  }
  function name(d) {
    return d.name;
  }
  function percent(num) {
    return (num * 100).toFixed(2) + '%';
  }
  d3.csv('data/item_11.csv', process, function(err, data) {
    if (err) throw err;
    //filter out undefined rows
    data = data.filter(id); 
    x.domain(d3.extent(data, popularity));
    y.domain(d3.extent(data, winrate));
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    var dots = svg.selectAll(".dot")
      .data(data)
      .enter()
      .append('circle')
        .attr('class', 'dot')
        .attr('r', 3)
        .attr('cx', function(d) { return d.popularity * width})
        .attr('cy', function(d) { return (1-d.winrate) * height})
        .style('fill', function(d) { return color(d.id)});
    
    dots.on('mouseover', function(d) {
      d3.select(this).attr('r', 7);
      infobox.select('.name').html(d.name);
      infobox.select('.popularity').html("Popularity: " + percent(d.popularity));
      infobox.select('.winrate').html("Win rate: " + percent(d.winrate));
      infobox.style('display', 'block');
    });
    dots.on('mouseout', function(d) {
      d3.select(this).attr('r', 3);
      infobox.style('display', 'none');
    });
    dots.on('mousemove', function(d) {
      infobox.style('top', (margin.top+d3.mouse(this)[1] + 2) + 'px')
        .style('left', (margin.left+d3.mouse(this)[0] + 2) + 'px');
    });
  
  });

  function process(data) {
    data.id = +data.id;
    data.popularity = +data.popularity;
    data.winrate = +data.winrate;
    return data;
  }

  




  console.log('hello');
});
