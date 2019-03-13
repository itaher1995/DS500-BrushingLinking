var nodelinkSvg = d3.select("#nodelink"),
    nodelinkWidth = +nodelinkSvg.attr("width"),
    nodelinkHeight = +nodelinkSvg.attr("height");

var brush = d3.brush().on("end", brushended);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(5))
    .force("charge", d3.forceManyBody().strength(-45))
    .force("center", d3.forceCenter(nodelinkWidth / 2, nodelinkHeight / 2));

function setupNodelink(graph)
{
    var link = nodelinkSvg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", function(d) { return '#' + d.color; });

    var node = nodelinkSvg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", function(d) { return Math.sqrt(d.entrances / 100) })
        .attr("fill", function(d) { return '#' + d.color; })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        
        
    node.append("title")
        .text(function(d) { return d.name; });

    node.on("mouseover", function(d) {
      dispatch.call("stationHovered", null, d.id);
    }).on("mouseout", function(d) {
      dispatch.call("stationHovered", null, null);
    });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}


function toggleBrush()
{
    var toggle = d3.select('#brushToggle');
    if(toggle.html() === 'Brushing is Off')
    {
        toggle.html('Brushing is On');
        appendBrush();
    }
    else
    {
        toggle.html('Brushing is Off');
        removeBrush();
    }
}

function appendBrush()
{
    nodelinkSvg.append("g")
        .attr("class", "brush")
        .call(brush);
}

function removeBrush()
{
    nodelinkSvg.select('g.brush').remove();
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function brushended() {
    var s = d3.event.selection;

    if(!s)
    {
        dispatch.call("nodesUpdated",null,null);
        return;
    }
    var x = [s[0][0], s[1][0]];
    var y = [s[0][1], s[1][1]];
    x.sort(function(a,b) { return a - b; });
    y.sort(function(a,b) { return a - b; });

    var nodes = nodelinkSvg
        .selectAll("circle");

    var selectedNodes = [];
    nodes.each(function(node)
    {
        if(node.x >= x[0] && node.x <= x[1] && node.y >= y[0] && node.y <= y[1])
        {
            selectedNodes.push(node);
        }
    });
    console.log('selecting')
    dispatch.call("nodesUpdated",null,selectedNodes);
}



d3.json("stations.json", function(error, stations)
{
    var data = {};
    data.nodes = stations.nodes;
    data.links = stations.links;

    for(var i = 0; i < data.nodes.length; i++)
    {
        var links = stations.links.filter(function(link)
        {
            return link.source === i || link.target === i;
        });

        var linksColors = links.map(function(link) { return link.color; });
        var allEqual = linksColors.filter(function(color) { return color !== linksColors[0]; }).length === 0;

        data.nodes[i].color = allEqual ? linksColors[0] : '000';
    }

    if (error) throw error;
    else
    {
        d3.json("turnstile-gtfs-mapping.json", function(error, mapping)
        {
            if (error) throw error;
            else
            {
                d3.json("turnstile-heatmap.json", function(error, entrances)
                {
                    if (error) throw error;
                    else
                    {
                        entrances.stops.forEach(function(stop)
                        {
                            var stationId = mapping[stop.name];

                            data.nodes.filter(function(station)
                            {
                                return station.id === stationId;
                            })[0]['entrances'] = stop.entrancesByType.all;
                        });

                        setupNodelink(data);
                    }
                });
            }
        });
    }
});



dispatch.on("dataLoaded.nodelink", function(data) {
setupNodelink(data);
});

dispatch.on("stationHovered.nodelink", function(station) {
    var n = nodelinkSvg.selectAll("circle"); 
if (station) {
    n.attr("fill-opacity", 0.7); // since we select the circle mark we don't need to do a select statement here like we do in piechart.js
    n.filter(function(d) {return d.id === station;
}).attr("fill-opacity", 1);
    } else {
        n.attr("fill-opacity", 1);
    }
});