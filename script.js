// The SVG container
var docHeight = $(document).height();
var docWidth = $(document).width();

function samuel(p1, p2){
  var p1 = p1;
  var p2 = p2;
  if($('#map').length)
  {
    $('#map').empty();
  }
  var width  = (docWidth * 960)/1920, height = (docHeight * 550)/955, active;
  $('#map').width(width);
  $('#map').height(height);
  var color = d3.scale.category10();
  var projection = d3.geo.mercator().translate([width/2, height*(300/550)]).scale(docWidth*150/1920);
  var path = d3.geo.path().projection(projection);
  var svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
  svg.append("rect").attr("width", width).attr("height", height).on("click", reset);
  var g = svg.append("g");

  function click(d) {
    if (active === d) return reset();
    g.selectAll(".active").classed("active", false);
    d3.select(this).classed("active", active = d);

    var b = path.bounds(d);
    g.transition().duration(750).attr("transform",
        "translate(" + projection.translate() + ")"
        + "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
        + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
  }

  function reset() {
    g.selectAll(".active").classed("active", active = false);
    g.transition().duration(750).attr("transform", "");
  }



  var tooltip = d3.select("#map").append("div").attr("class", "tooltip");
  queue().defer(d3.json, "data/world-50m.json").defer(d3.tsv, "data/world-country-names.tsv").await(ready);

  function ready(error, world, names) {
    var countries = topojson.object(world, world.objects.countries).geometries,
    neighbors = topojson.neighbors(world, countries),
    i = -1,
    n = countries.length;

    countries.forEach(function(d) { 
      var tryit = names.filter(function(n) { return d.id == n.id; })[0];
      if (typeof tryit === "undefined"){
        d.name = "Undefined";
      } else {
        d.name = tryit.name; 
      }
    });

    var country = g.selectAll(".country").data(countries);

    country
     .enter()
      .insert("path")
      .attr("class", "country")    
        .attr("title", function(d,i) { return d.name; })
        .attr("d", path)
        .on("click", click)
        .style("fill", function(d, i) { 
          //color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0)
          //console.log(d.name.split("|")[(p1 + 16)]);
          return eval(d.name.split("|")[(p1 + 16)]); 

        });

      //Show/hide tooltip
      
      country
        .on("mousemove", function(d,i) {
          var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
          // Transform
          tooltip
            .classed("hidden", false)
            .attr("style", "left:"+(mouse[0]+25)+"px;top:"+mouse[1]+"px")
            .html(d.name.split("|")[0] + ': ' + d.name.split("|")[(p1 + 1)] + ' patents filed by Residents in ' + p2 +'.')
          // Transform
        })
        .on("mouseout",  function(d,i) {
          tooltip.classed("hidden", true)
        });

  }

};

samuel(0, '2000');
$("#dates").on("change",function(){
  var index = document.getElementById('dates').selectedIndex;
  //alert();
  samuel(parseInt($("#dates").val()), document.getElementById('dates').options[index].text);
});