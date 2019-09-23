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