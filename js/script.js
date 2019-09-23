function renderSparqlQueryResults(query) {

    // Use the fetch API to execute a query against a SPARQL endpoint and wait for results (Asyncronous)
    fetch(
      wdk.sparqlQuery(query)
    ).then( response => response.json()
    ).then( wdk.simplify.sparqlResults
    ).then(
      // When results
      function (response) {

		dataset = response;

        // Call the function responsable of the creation and output the HTML table of the results
        renderHtmlTable(dataset);

        // Call the function responsable of the creation and output the simple visulaization
        renderSimpleVisualization(dataset)

        // Call the function responsable of the creation and output the advanced visulaization
        renderAdvancedVisualization(dataset);
      }
    )
}

function renderHtmlTable(dataset) {

    var html = "<table>";
    html += "<tr>"
    html += "<th>Protein entity ID</th>";
    html += "<th>Protein Name</th>"
    html += "<th>PDB Structures Count</th>"
    html += "<th>Protein Structure Image</th>"
    html += "</tr>"

    //Loop through the results of the SPARQL query and create the rows of the HTML table
    for(var i = 0; i < dataset.length; i++){

        html += "<tr>";
        html += "<td>";

        // Construct the Wikidata URL from the protein entity ID
        html += "<a href=\"http://www.wikidata.org/entity/" +
                    dataset[i].protein.value +
                    "\">"+
                    dataset[i].protein.value +
                    "</a></td>";
        html += "</td>";
        html += "<td>" + dataset[i].protein.label + "</td>";
        html += "<td class=\"center\">" + dataset[i].count + "</td>";
        html += "<td class=\"center\">";

        // Construct the PDB Image URL from the protein structure ID
        html += "<img width=\"100px\" src=\"https://cdn.rcsb.org/images/rutgers/" +
                    dataset[i].struct.toLowerCase().substring(1,3) +
                    "/" +
                    dataset[i].struct.toLowerCase() +
                    "/" +
                    dataset[i].struct.toLowerCase() +
                    ".pdb1-500.jpg\" />";
        html += "</td>";
        html += "</tr>";

        document.getElementById("table").innerHTML = html;
    }
}

function renderSimpleVisualization(dataset) {

    data = {};
    // restructure the asyncrounos response by creating a map of protein names and PDB counts
    data.children = dataset.map(function(item) { return { "Name": item.protein.label , "Count": item.count } });

    // Get the width of the SVG holder (div) to use it in creating the visualization
    var diameter = document.getElementById('chart').offsetWidth;

    // Remove the loader since we got the results and we want to output them
    d3.select('#chart').select('#loader').remove();

    // Create the main SVG element
    var svg = d3.select('#chart').append('svg')
              .attr('width', "100%")
              .attr('height', diameter)
              .attr('transform', 'translate(0,0)');

	var color = d3.scaleOrdinal(d3.schemeCategory20);

    // Create a new structure from the data where each element has coordinates corresponds
    // to the size of the holding SVG
    var bubble = d3.pack(data)
              .size([diameter, diameter])
              .padding(5);

	var nodes = d3.hierarchy(data)
              .sum(function(d) { return d.Count; });

    // Create the bubbles
	circles = svg.selectAll("g")
			.data(bubble(nodes).descendants())
			.enter()
			.filter(function(d){
              return  !d.children
			})
			.append("g")
			.attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
			})

	circles.append("circle")
			.attr("r", function(d) {
				  return d.r;
			})
			.style("fill", function(d,i) {
				  return color(i);
			})

    // Add the text to the bubbles
	circles.append("text")
			.style("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/8;
            })
			.text(function(d) {
				return d.data.Name.substring(0, d.r / 3);
			});

    // Add the text to the bubbles
    circles.append("text")
          .attr("dy", "1.3em")
          .style("text-anchor", "middle")
          .text(function(d) {
              return "PDB count: " + d.data.Count;
          })
          .attr("font-family", "sans-serif")
          .attr("font-size", function(d){
              return d.r/8;
          })
}

function renderAdvancedVisualization(dataset) {

    // Get the width of the SVG holder (div) to use it in creating the visualization
    var diameter = document.getElementById('chart2').offsetWidth;

    //Create a simulation object to use it later
    var simulation = d3.forceSimulation()
                	.force("x", d3.forceX(diameter / 2).strength(0.25))
                	.force("y", d3.forceY(800 / 2).strength(0.25))
                	.force("collide", d3.forceCollide(function(d){
                		return  circlaScale(d.count)+10;
                	}));

    // Create a linear scale to calculate the sizes of the bubbles depending on the PDB count
    var circlaScale = d3.scaleLinear()
        			.domain([0, d3.max(dataset, el => el).count])
        			.range([0,150])
        			.clamp(true);

    // Remove the loader since we got the results and we want to output them
    d3.select('#chart2').select('#loader2').remove();

    // Add the button to the visulaization div
    document.getElementById('chart2').innerHTML = "<button onclick=\"renderAdvancedVisualizationAgain()\" >Run Again</button>";

    // Create the main SVG element
    var svg = d3.select('#chart2').append('svg')
              .attr('width', "100%")
              .attr('height', "800")
              .attr('transform', 'translate(0,0)');

	var color = d3.scaleOrdinal(d3.schemeCategory20);

    // Create the bubbles
    var circles = svg.selectAll("g")
    	.data(dataset)
    	.enter()
    	.append("g")
    	.append("circle")
        .attr("r", function(d) {
                  return circlaScale(d.count);
              })
              .attr("fill", function(d,i) {
                  return color(i);
              })
        .style("fill", function(d) { return ("url(#"+"icon-img-"+d.protein.value+")");})
        .attr("stroke", "black")
        .attr("stroke-width",3)
        // Register mouse hover actions using javascript functions
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);


    // Create the protein image backgrounds for the bubbles
    var images = svg.selectAll("g")
		.append('defs')
        .append('pattern')
        .attr('id', function(d) { return ("icon-img-"+d.protein.value);}) // just create a unique id (id comes from the json)
        .attr('patternContentUnits', 'objectBoundingBox')
        .attr('width', 1)
        .attr('height', 1)
        .append("svg:image")
        .attr("xlink:href", function(d) {
		    return ("https://cdn.rcsb.org/images/rutgers/" +
                    d.struct.toLowerCase().substring(1,3) +
                    "/" +
                    d.struct.toLowerCase() +
                    "/" +
                    d.struct.toLowerCase() +
                    ".pdb1-500.jpg"
            );
		})
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "xMinYMin slice");


    // specify the element to run the simulation on (the bubbles)
    simulation.nodes(dataset).on('tick',ticked);

    function ticked() {
        circles
    		.attr("cx", function(d) {
    			return d.x
    		})
    		.attr("cy", function(d) {
    			return d.y
    		});
    }
}

function handleMouseOver(d, i) {  // Add interactivity
    // Use D3 to select element, change opacity and add text
	d3.select(this).style("fill-opacity", function(d) { return "0.2";})

	d3.select(this.parentNode).append("text")
	  .attr("dx", d.x)
	  .attr("dy", d.y)
	  .style("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", function(d){
            return d.r/9;
      })
	  .text(function(d) {
		  return "Uniprot: "+ d.uniprot;
	  })
}

function handleMouseOut(d, i) {  // Add interactivity
    // Use D3 to select element, restore opacity and hide text
	d3.select(this).style("fill-opacity", function(d) { return "1.0";});
	d3.select(this.parentNode).selectAll("text").remove();
}

function renderAdvancedVisualizationAgain() {
    var svg = d3.select('#chart2').select('svg').remove();
    renderAdvancedVisualization(dataset);
}