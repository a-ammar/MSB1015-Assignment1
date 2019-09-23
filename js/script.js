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