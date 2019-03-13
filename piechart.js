var svg = d3.select("#piechart"),
    pieWidth = +svg.attr("width"),
    pieHeight = +svg.attr("height"),
    radius = Math.min(pieWidth, pieHeight) / 2,
    pieG = svg.append("g").attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

var pie = d3.pie()
    .sort(function(a,b) { return a.index - b.index; })
    .value(function(d) { return d.entrances; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

function visUpdated(groupsData) {
    var arc = pieG.selectAll(".arc")
        .data(pie(groupsData), function (d) {
            return d.data.id;
        });

    var arcEnterG = arc.enter().append("g");

    arcEnterG
        .attr("class", "arc")
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            return '#' + d.data.color;
        })
        .on('mouseover', function(d) { dispatch.call("stationHovered", null, d.data); }) 
        .on('mouseout', function(d) { dispatch.call("stationHovered", null, null); });

    arcEnterG.append("title")
        .text(function (d) {
            return d.data.name;
        });

    arc.select("path")
        .attr("d", path);

    arc.exit().remove();
}


var allNodes;
dispatch.on("dataLoaded.pie", function(data) { 
allNodes = data.nodes; 
visUpdated(data.nodes);
});

dispatch.on("stationHovered.pie", function(station) {
    var arcs = pieG.selectAll(".arc");
if (station) {
    arcs.select("path").attr("fill-opacity", 0.7);
    arcs.filter(function(d) {return d.data.id === station.id;
}).select("path").attr("fill-opacity", 1);
    } else {
        arcs.select("path").attr("fill-opacity", 1);
    }
});

dispatch.on("nodesUpdated.pie", function(nodesSelected) {

  if (nodesSelected && nodesSelected.length != 0) {
    visUpdated(nodesSelected);
  } else {
    visUpdated(nodesSelected);
  }

});
