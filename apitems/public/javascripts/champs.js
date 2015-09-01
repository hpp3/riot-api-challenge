(function() {
  var module = {};
  var data_version = 'v7';
  function load_data(callback) {
    var loaded = 0;
    var total_loads = 4;
    d3.json('/data/'+data_version+'/champion14.json', function(err, champion_data) {
      module.champion_data = champion_data;
      d3.csv('/data/'+data_version+'/champ_11.csv', process, function(err, champs_11) {
        module.champs_11 = champs_11;
        loaded += 1;
        if (loaded == total_loads) callback();
      });
      d3.csv('/data/'+data_version+'/champ_14.csv', process, function(err, champs_14) {
        module.champs_14 = champs_14;
        loaded += 1;
        if (loaded == total_loads) callback();
      });
      d3.csv('/data/'+data_version+'/ap_champ_14.csv', process, function(err, ap_champs_14) {
        module.ap_champs_14 = ap_champs_14;
        loaded += 1;
        if (loaded == total_loads) callback();
      });
      d3.csv('/data/'+data_version+'/ap_champ_11.csv', process, function(err, ap_champs_11) {
        module.ap_champs_11 = ap_champs_11;
        loaded += 1;
        if (loaded == total_loads) callback();
      });
    });
  }

  function process(data) {
    data.id = +data.id;
    data.key = data.name;
    data.name = real_name(data);
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
  function pp(num) {
    return num=='-'?'-':(num * 100).toFixed(2) + ' percentage points';
  }
  function round3(num) {
    return num=='-'?'-':+num.toFixed(3);
  }

  function get_data() {
    if ($('#type').val() == 'ap') {
      console.log('ap');
      if ($('#patch').val() == '5.11') {
        console.log('using patch 11');
        var champs = module.ap_champs_11;
      } else {
        console.log('using patch 14');
        var champs = module.ap_champs_14; 
      }
    } else {
      if ($('#patch').val() == '5.11') {
        console.log('using patch 11');
        var champs = module.champs_11;
      } else {
        console.log('using patch 14');
        var champs = module.champs_14; 
      }
    }
    champs = champs.filter(function(d) {
      return d.popularity > $('#threshold').val()/100.0;
    });
    return champs;
  }

  function get_table_data() {
    var champs = [];
    var champs11 = module.champs_11.concat(module.ap_champs_11);
    var champs14 = module.champs_14.concat(module.ap_champs_14);
    var map11 = champs11.reduce(function(o, v, i) {
      o[v.id] = v;
      return o;
    }, {});
    var map14 = champs14.reduce(function(o, v, i) {
      o[v.id] = v;
      return o;
    }, {});
    champs14.forEach(function (champ) {
      var processed = {}
      if (champ.name.split(" ")[0] == "AP") {
        processed.name = "<a href='/champ/"+champ.id+"?ap=1'>"+champ.name+'</a>';
      } else {
        processed.name = "<a href='/champ/"+champ.id+"'>"+champ.name+'</a>';
      }
      processed.winrate14 = champ.winrate;
      processed.popularity14 = champ.popularity;
      if (map11[champ.id]) {
        processed.winrate11 = map11[champ.id].winrate;
        processed.popularity11 = map11[champ.id].popularity;
      } else {
        processed.winrate11 = "-";
        processed.popularity11 = "-";
      } 
      champs.push(processed);
    });
    champs.sort(function(a,b) {return a.name.localeCompare(b.name)});
    return champs;
  }

  function real_name(champ) {
    var split = champ.name.split(" ");
    if (split[0] == 'AP') {
      var champ_dict = module.champion_data['data'][split[1]];
      return 'AP '+champ_dict['name'];
    } else {
      var champ_dict = module.champion_data['data'][split[0]];
      return champ_dict['name'];
    }
  }
  function get_image(champ) {
    var split = champ.key.split(" ");
    if (split[0] == 'AP') {
      var name = split[1];
    } else {
      var name = split[0];
    }
    var champ_dict = module.champion_data['data'][name];
    var version = champ_dict['version'];
    var image = champ_dict['image']['full']; 
    return "https://ddragon.leagueoflegends.com/cdn/"+version+"/img/champion/"+image;
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
      .ticks(10, "%")
      .outerTickSize(2)
      .innerTickSize(6);
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%")
      .outerTickSize(2)
      .innerTickSize(6);

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
            .attr('id', 'small_champ_'+d.id)
            .attr('x',0)
            .attr('y',0)
            .attr('height', smallSize * 2)
            .attr('width', smallSize * 2)
            .append('image')
            .attr('height', smallSize * 2)
            .attr('width', smallSize * 2)
            .attr('xlink:href', get_image(d))
          defs
            .append('pattern')
            .attr('id', 'large_champ_'+d.id)
            .attr('x',0)
            .attr('y',0)
            .attr('height', largeSize * 2)
            .attr('width', largeSize * 2)
            .append('image')
            .attr('height', largeSize * 2)
            .attr('width', largeSize * 2)
            .attr('xlink:href', get_image(d))
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
            .text("Pick Rate");
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
            .style('fill', function(d) {return 'url(#small_champ_'+d.id+')'});
                dots.on('mouseover', function(d) {
                  d3.select(this).attr('r', largeSize)
                  .style('fill', function(d) {return 'url(#large_champ_'+d.id+')'});
                    infobox.select('.name').html(d.name);
                    infobox.select('.popularity').html("Pick Rate: " + percent(d.popularity));
                    infobox.select('.winrate').html("Win Rate: " + percent(d.winrate));
                    infobox.style('display', 'block');
                    });
                  dots.on('mouseout', function(d) {
                    d3.select(this).attr('r', smallSize)
                    .style('fill', function(d) {return 'url(#small_champ_'+d.id+')'});
                      infobox.style('display', 'none');
                      });
                    dots.on('mousemove', function(d) {
                      infobox.style('top', (margin.top+d3.mouse(this)[1] + 2) + 'px')
                      .style('left', (margin.left+d3.mouse(this)[0] + 2) + 'px');
                    });
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
            .style('fill', function(d) {return 'url(#small_champ_'+d.id+')'});
              dots.on('mouseover', function(d) {
                d3.select(this).attr('r', largeSize)
                .style('fill', function(d) {return 'url(#large_champ_'+d.id+')'});
                  infobox.select('.name').html(d.name);
                  infobox.select('.popularity').html("Pick Rate: " + percent(d.popularity));
                  infobox.select('.winrate').html("Win Rate: " + percent(d.winrate));
                  infobox.style('display', 'block');
                  });
        dots.on('mouseout', function(d) {
          d3.select(this).attr('r', smallSize)
            .style('fill', function(d) {return 'url(#small_champ_'+d.id+')'});
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
        var table = $('#champ-table');
        table.append('<thead><tr><th>Name</th><th>Popularity in 5.11</th><th>Popularity in 5.14</th><th>Win Rate in 5.11</th><th>Win Rate in 5.14</th><th>Popularity Change</th><th>Win Rate Change</th></tr></thead><tbody>');
        table_data.forEach(function(d) {
          var row = [d.name, percent(d.popularity11), percent(d.popularity14), percent(d.winrate11), percent(d.winrate14)];
          if (d.popularity11 != '-' && d.popularity14 != '-') {
            row.push(pp(d.popularity14 - d.popularity11));
          } else row.push('-');
          if (d.winrate11 != '-' && d.winrate14 != '-') {
            row.push(pp(d.winrate14 - d.winrate11));
          } else row.push('-');
          table.append('<tr><td>'+row.join('</td><td>')+'</td></tr>');
        });
        table.append('</tbody>');
          jQuery.extend( jQuery.fn.dataTableExt.oSort, {
            "percent-pre": function ( a ) {
              var x = (a == "-") ? Number.NEGATIVE_INFINITY : a.replace( /[a-zA-Z%]/, "" );
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
        $('#type').html('All Champions');
      } else {
        $('#type').val('ap'); 
        $('#type').html('AP Champions');
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
    $('#threshold').on('change', function() {
      module.change_data(get_data());
    });
  });
})()
