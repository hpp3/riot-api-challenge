(function() {
  var module = {};
  var data_version = 'v7';
  function load_data(callback) {
    var forbidden_items = [
      3599, //The Black Spear
      3200, //Prototype Hex core
      3340, //Warding Totem (Trinket)
      3341, //Sweeping Lens (Trinket)
      3342, //Scrying Orb (Trinket)
      2137, //Elixir of Ruin
      2138, //Elixir of Iron
      2139, //Elixir of Sorcery
      2140, //Elixir of Wrath
    ];
    var loaded = 0;
    d3.csv('/data/'+data_version+'/ap_items.csv', itemToInt, function(err, ap_items) {
      module.ap_items = ap_items;
      loaded += 1;
      if (loaded == 5) callback();
    });
    d3.csv('/data/'+data_version+'/big_items.csv', itemToInt, function(err, big_items) {
      module.big_items = big_items;
      loaded += 1;
      if (loaded == 5) callback();
    });
    d3.csv('/data/'+data_version+'/full_items.csv', itemToInt, function(err, full_items) {
      module.full_items = full_items;
      loaded += 1;
      if (loaded == 5) callback();
    });
    d3.csv('/data/'+data_version+'/item_14.csv', process, function(err, items_14) {
      //filter out undefined rows
      items_14 = items_14.filter(function(d) {return d.id && $.inArray(d.id, forbidden_items) == -1 });
      module.items_14 = items_14;
      loaded += 1;
      if (loaded == 5) callback();
    });
    d3.csv('/data/'+data_version+'/item_11.csv', process, function(err, items_11) {
      //filter out undefined rows
      items_11 = items_11.filter(function(d) {return d.id && $.inArray(d.id, forbidden_items) == -1 });
      module.items_11 = items_11;
      loaded += 1;
      if (loaded == 5) callback();
    });
  }

  function itemToInt(data) {
    return +data.item;
  }

  function process(data) {
    data.id = +data.id;
    data.popularity = +data.popularity;
    data.winrate = +data.winrate;
    return data;
  }
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
    return num=='-'?'-':(num * 100).toFixed(2) + '%';
  }
  function round3(num) {
    return num=='-'?'-':+num.toFixed(3);
  }

  function ap_only(d){
    return d.id 
      && $.inArray(d.id, module.ap_items) != -1;
  }
  function full_only(d){
    return d.id 
      && $.inArray(d.id, module.full_items) != -1;
  }
  function big_only(d){
    return d.id 
      && $.inArray(d.id, module.big_items) != -1;
  }

  function get_data() {
    if ($('#patch').val() == '5.11') {
      console.log('using patch 11');
      var items = module.items_11;
    } else {
      console.log('using patch 14');
      var items = module.items_14; 
    }

    if ($('#type').val() == 'ap') {
      items = items.filter(ap_only); 
    }

    if ($('#cost').val() == 'full') {
      items = items.filter(full_only);
      items = items.filter(big_only);
    } else if ($('#cost').val() == 'big') {
      items = items.filter(big_only);
    } 
    return items;
  }

  function get_table_data() {
    var items = [];
    var map11 = module.items_11.reduce(function(o, v, i) {
      o[v.id] = v;
      return o;
    }, {});
    var map14 = module.items_14.reduce(function(o, v, i) {
      o[v.id] = v;
      return o;
    }, {});
    module.items_11.forEach(function (item) {
      var processed = {}
      processed.name = item.name;
      if (item.name != map14[item.id].name) {
        processed.name += ' / ' + map14[item.id].name;
      }
      processed.winrate11 = item.winrate;
      processed.popularity11 = item.popularity;
      if (map14[item.id]) {
        processed.winrate14 = map14[item.id].winrate;
        processed.popularity14 = map14[item.id].popularity;
      } else {
        processed.winrate14 = "-";
        processed.popularity14 = "-";
      } 
      items.push(processed);
    });
    module.items_14.forEach(function (item) {
      if (map11[item.id] === undefined) {
        var processed = {}
        processed.name = item.name;
        processed.winrate14 = item.winrate;
        processed.popularity14 = item.popularity;
        processed.winrate11 = "-";
        processed.popularity11 = "-";
        items.push(processed);
      } 
    });
    items.sort(function(a,b) {return a.name.localeCompare(b.name)});
    return items;
  }

  window.addEventListener('load', function(){
    load_data(function() {
      var data = get_data();
      var patch = $('#patch').val();
      var margin = {top: 20, right: 20, bottom: 30, left: 40};
      width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    var smallSize = 7;
    var largeSize = 15;
    var y = d3.scale.linear()
      .range([height, 0])
      .nice()
      var x = d3.scale.sqrt()
      .range([0, width])
      .nice()
      var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(10, ".2g")
      .outerTickSize(2)
      .innerTickSize(6);
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%")
      .outerTickSize(2)
      .innerTickSize(6);
    var color = d3.scale.category20();


    var svg = d3.select('#chart').append('svg');

    var defs = svg.append('defs');

    svg = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top+')');
          var infobox = d3.select('#chart').append('div')
          .attr('class', 'infobox');

          infobox.append('div').attr('class', 'name');
          infobox.append('div').attr('class', 'popularity');
          infobox.append('div').attr('class', 'winrate');
          data.forEach(function(d) {
            defs
            .append('pattern')
            .attr('id', 'small_item_5.11_'+d.id)
            .attr('x',0)
            .attr('y',0)
            .attr('height', smallSize * 2)
            .attr('width', smallSize * 2)
            .append('image')
            .attr('height', smallSize * 2)
            .attr('width', smallSize * 2)
            .attr('xlink:href', 'https://ddragon.leagueoflegends.com/cdn/5.11.1/img/item/'+d.id+'.png');
          defs
            .append('pattern')
            .attr('id', 'large_item_5.11_'+d.id)
            .attr('x',0)
            .attr('y',0)
            .attr('height', largeSize * 2)
            .attr('width', largeSize * 2)
            .append('image')
            .attr('height', largeSize * 2)
            .attr('width', largeSize * 2)
            .attr('xlink:href', 'https://ddragon.leagueoflegends.com/cdn/5.11.1/img/item/'+d.id+'.png');
          defs
            .append('pattern')
            .attr('id', 'small_item_5.14_'+d.id)
            .attr('x',0)
            .attr('y',0)
            .attr('height', smallSize * 2)
            .attr('width', smallSize * 2)
            .append('image')
            .attr('height', smallSize * 2)
            .attr('width', smallSize * 2)
            .attr('xlink:href', 'https://ddragon.leagueoflegends.com/cdn/5.14.1/img/item/'+d.id+'.png');
          defs
            .append('pattern')
            .attr('id', 'large_item_5.14_'+d.id)
            .attr('x',0)
            .attr('y',0)
            .attr('height', largeSize * 2)
            .attr('width', largeSize * 2)
            .append('image')
            .attr('height', largeSize * 2)
            .attr('width', largeSize * 2)
            .attr('xlink:href', 'https://ddragon.leagueoflegends.com/cdn/5.14.1/img/item/'+d.id+'.png');
          });
          x.domain(d3.extent(data, popularity));
          y.domain(d3.extent(data, winrate));
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Number Bought Per Game");
          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Win Rate");
          module.lineg = svg.append('g');
          module.lineg.selectAll("line.verticalGrid").data(x.ticks(10).map(function(d,i){return {i:i,d:d}})).enter()
            .append("line")
            .attr(
                {
                  "class":"verticalGrid",
              "y1" : 0,
              "y2" : height,
              "x1" : function(d){ return x(d.d);},
              "x2" : function(d){ return x(d.d);},
              "fill" : "none",
              "shape-rendering" : "crispEdges",
              "stroke" : "black",
              "stroke-width" : "1px"
                });
          module.lineg.selectAll("line.horizontalGrid").data(y.ticks(10).map(function(d,i){return {i:i,d:d}})).enter()
            .append("line")
            .attr(
                {
                  "class":"horizontalGrid",
              "x1" : 0,
              "x2" : width,
              "y1" : function(d){ return y(d.d);},
              "y2" : function(d){ return y(d.d);},
              "fill" : "none",
              "shape-rendering" : "crispEdges",
              "stroke" : "black",
              "stroke-width" : "1px"
                });
          
          module.dotg = svg.append('g');
          var dots = module.dotg.selectAll(".dot")
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', smallSize)
            .attr('cx', function(d) { return x(d.popularity) })
            .attr('cy', function(d) { return y(d.winrate) })
            .style('fill', function(d) {return 'url(#small_item_'+patch+'_'+d.id+')'});
                dots.on('mouseover', function(d) {
                  d3.select(this).attr('r', largeSize)
                  .style('fill', function(d) {return 'url(#large_item_'+patch+'_'+d.id+')'});
                    infobox.select('.name').html(d.name);
                    infobox.select('.popularity').html("# per game: " + +(d.popularity).toFixed(3));
                    infobox.select('.winrate').html("Win rate: " + percent(d.winrate));
                    infobox.style('display', 'block');
                    });
                  dots.on('mouseout', function(d) {
                    d3.select(this).attr('r', smallSize)
                    .style('fill', function(d) {return 'url(#small_item_'+patch+'_'+d.id+')'});
                      infobox.style('display', 'none');
                      });
                    dots.on('mousemove', function(d) {
                      infobox.style('top', (margin.top+d3.mouse(this)[1] + 2) + 'px')
                      .style('left', (margin.left+d3.mouse(this)[0] + 2) + 'px');
                    });
                    console.log('hello');
          module.change_data = function(data) {
            x.domain(d3.extent(data, popularity));
            y.domain(d3.extent(data, winrate));
            var patch = $('#patch').val();
        var lines = module.lineg.selectAll("line.verticalGrid").data(x.ticks(10).map(function(d,i){return {i:i,d:d}}), function(d){ return d.i})

        lines
        .transition()
        .duration(1000)
          .attr({ "class":"verticalGrid",
            "y1" : 0,
            "y2" : height,
            "x1" : function(d){ return x(d.d);},
            "x2" : function(d){ return x(d.d);},
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px" });
        lines.exit().remove();
        lines
          .enter()
          .append("line")
          .style('opacity',0)
          .transition().duration(1200)
          .style('opacity',1)
          .attr({ "class":"verticalGrid",
            "y1" : 0,
            "y2" : height,
            "x1" : function(d){ return x(d.d);},
            "x2" : function(d){ return x(d.d);},
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px" });
        lines = module.lineg.selectAll("line.horizontalGrid").data(y.ticks(10).map(function(d,i){return {i:i,d:d}}), function(d){ return d.i})
        lines
          .transition()
          .duration(1000)
          .attr({ "class":"horizontalGrid",
            "x1" : 0,
            "x2" : width,
            "y1" : function(d){ return y(d.d);},
            "y2" : function(d){ return y(d.d);},
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px" });
        lines.exit().remove();
        lines
          .enter()
          .append("line")
          .style('opacity',0)
          .transition().duration(1200)
          .style('opacity',1)
          .attr({ "class":"horizontalGrid",
            "x1" : 0,
            "x2" : width,
            "y1" : function(d){ return y(d.d);},
            "y2" : function(d){ return y(d.d);},
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px" });
  
            var dots = module.dotg.selectAll(".dot")
              .data(data, id);
            dots
              .transition()
            .duration(1000)
            .delay(function(d,i) {
              return 200; 
            })
            // .ease('linear')
            .attr('cx', function(d){
              return x(d.popularity)
            })
            .attr('cy', function(d){
              return y(d.winrate)
            })

            
            dots
            .enter()
            .append('circle')
            .style('opacity',0)
            .transition().duration(1200)
            .style('opacity',1)
            .attr('class', 'dot')
            .attr('r', smallSize)
            .attr('cx', function(d) { return x(d.popularity) })
            .attr('cy', function(d) { return y(d.winrate) })
            .style('fill', function(d) {return 'url(#small_item_'+patch+'_'+d.id+')'});
              dots.on('mouseover', function(d) {
                d3.select(this).attr('r', largeSize)
                .style('fill', function(d) {return 'url(#large_item_'+patch+'_'+d.id+')'});
                  infobox.select('.name').html(d.name);
                  infobox.select('.popularity').html("# per game: " + +(d.popularity).toFixed(3));
                  infobox.select('.winrate').html("Win rate: " + percent(d.winrate));
                  infobox.style('display', 'block');
                  });
        dots.on('mouseout', function(d) {
          d3.select(this).attr('r', smallSize)
            .style('fill', function(d) {return 'url(#small_item_'+patch+'_'+d.id+')'});
            infobox.style('display', 'none');
        });
        dots.on('mousemove', function(d) {
            infobox.style('top', (margin.top+d3.mouse(this)[1] + 2) + 'px')
            .style('left', (margin.left+d3.mouse(this)[0] + 2) + 'px');
        });

        dots.exit().remove();

        svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);
        svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(yAxis);
      }


        //THE TABLE
        var table_data = get_table_data();
        var table = $('#item-table');
        table.append('<thead><tr><th>Name</th><th>Popularity in 5.11</th><th>Popularity in 5.14</th><th>Win Rate in 5.11</th><th>Win Rate in 5.14</th><th>Popularity Change</th><th>Win Rate Change</th></tr></thead><tbody>');
        table_data.forEach(function(d) {
          var row = [d.name, round3(d.popularity11), round3(d.popularity14), percent(d.winrate11), percent(d.winrate14)];
          if (d.popularity11 != '-' && d.popularity14 != '-') {
            row.push(round3(d.popularity14 - d.popularity11));
          } else row.push('-');
          if (d.winrate11 != '-' && d.winrate14 != '-') {
            row.push(percent(d.winrate14 - d.winrate11));
          } else row.push('-');
          table.append('<tr><td>'+row.join('</td><td>')+'</td></tr>');
        });
        table.append('</tbody>');
          jQuery.extend( jQuery.fn.dataTableExt.oSort, {
            "percent-pre": function ( a ) {
              var x = (a == "-") ? Number.NEGATIVE_INFINITY : a.replace( /%/, "" );
              return parseFloat( x );
            },

            "percent-asc": function ( a, b ) {
              return ((a < b) ? -1 : ((a > b) ? 1 : 0));
            },

            "percent-desc": function ( a, b ) {
              return ((a < b) ? 1 : ((a > b) ? -1 : 0));
            }
          } );
        table.DataTable({'columnDefs': [
          {'type':'percent', 'targets':[1,2,3,4,5,6]}
          ]});
    });
    
    
    $('#type').on('click', function() {
      if ($('#type').val() == 'ap') {
        $('#type').val('all'); 
        $('#type').html('All Item Types');
      } else {
        $('#type').val('ap'); 
        $('#type').html('AP Items Only');
      }
      module.change_data(get_data());
    });
    $('#patch').on('click', function() {
      if ($('#patch').val() == '5.11') {
        $('#patch').val('5.14'); 
      } else {
        $('#patch').val('5.11'); 
      }
      $('#patch').html('Displayed Patch: '+$('#patch').val()); 
      module.change_data(get_data());
    });
    $('#cost').on('change', function() {
      module.change_data(get_data());
    });
  });
})()
