var dispatch = d3.dispatch("dataLoaded","stationHovered","nodesUpdated") // initialize dispatch commands dataLoaded and stationHovered. Referenced in nodelink.js and piechart.js

d3.json("stations.json", function(error, stations) // reads in the data from a json file
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

                        dispatch.call('dataLoaded', null, data);
                    }
                });
            }
        });
    }
});
