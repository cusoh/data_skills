const noop = (e) => {d3.event.stopPropagation()};
const geographyDataLoc = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const worldTopologyDataLoc = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv";

// The svg
var svg = d3.select("svg#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .scale(70)
    .center([0,20])
    .translate([width / 2, height / 2]);

// just use a default projection
// projection = d3.geoEqualEarth();
projection = d3.geoNaturalEarth1();

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

const dataPromises = [
    d3.json(geographyDataLoc),
    d3.csv(worldTopologyDataLoc)
];

Promise.all(dataPromises).then(values => {
    values[1].map((value, index) => {
        data.set(value.code, +value.pop);
    });
    ready(values[0]);
}).catch(error => console.error(`Error in data fetching ${error}`));

var theMap = svg.append("g");

// Define the div for the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")				
    .style("opacity", 0);

const updateTooltip = (data) => {	
    tooltip.html(`<div>
        <div>${data.properties.name}</div>
        <br/>
        <span>Population: ${data.total}</span>
        </div>`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
};

function ready(worldTopology) {
    // Draw the map
    let mapGroup = theMap
        .selectAll("path")
        .data(worldTopology.features)
        .enter()
        .append("g");  
        
    mapGroup.append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", "Country")
        .style("opacity", .8);

    mapGroup.on("mouseover", function(data) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5);
        d3.select(this)
            .select("path")
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");

        // div way
        tooltip.transition()		
            .duration(200)		
            .style("opacity", .9);

        updateTooltip(data);
    })
    .on("mousemove", function (data) {
        updateTooltip(data);
    })
    .on("mouseleave", function(data) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8);

        d3.select(this)
            .select("path")
            .transition()
            .duration(200)
            .style("stroke", "transparent");

        tooltip.transition()		
            .duration(500)		
            .style("opacity", 0);
    });
}