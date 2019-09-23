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

        document.getElementById("table").innerHTML =  JSON.stringify(response, undefined, 2);

      }
    )
}