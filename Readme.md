## Overview

This repository contains the first assignment for the Scientific Programming course MSB1015 in 2019. This assignment is supposed to cover the aspects of HTML, CSS, Javascript, SPARQL, JSON and D3 visualization by answering a biological question and using these technologies to create a visualization of the results.

## Installation

The assignment is implemented using the aforementioned web technologies which can run inside any modern web browser. No need to install any special software to run the assignment.

1.  Make sure you have one of modern web browsers (Firefox, Chrome, Edge).
2.  Download the repository from the releases tab.
3.  Unzip the zipped source file.
4.  Run index.html



## Browser Compatability

This implementation used the fetch API to execute asynchronous calls. This functionality `fetch()` allows you to make network requests similar to XMLHttpRequest (XHR). The main difference is that the Fetch API uses Promises, which enables a simpler and cleaner API, avoiding callback hell and having to remember the complex API of XMLHttpRequest. 

The assignment need one of the modern browsers with a minimum version as follows:

![Browser Compatability](https://user-images.githubusercontent.com/43293732/65397111-988d7980-ddad-11e9-8ac2-ca20f21227f1.png)


## The Biological Question

#### What are the 10 proteins that have the most PDB structures?



#### The SPARQL query:

```SPARQL
1> SELECT ?protein ?proteinLabel ?uniprot (SAMPLE(DISTINCT ?PDBID) as ?struct) (COUNT(DISTINCT ?PDBID) as ?count) WHERE {
2>		  ?protein wdt:P31 wd:Q8054.
3>		  ?protein wdt:P638 ?PDBID .
4>		  ?protein wdt:P352 ?uniprot .
5>		  
6>		  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
7>		} GROUP BY ?protein ?proteinLabel ?uniprot
8>		  ORDER BY DESC(?count)
9>		  LIMIT 10
```



#### Description:

In the first line we specified what we want to select from the SPARQL endpoint using the keyword SELECT, in our case we selected:

- ?protein: Protein entity ID
- ?proteinLabel: Protein name
- ?uniprot: Uniprot ID of the protein
- ?struct: one PDB ID for the protein
- ?count: the number of PDB structures for each protein

Since we want the number of PDB structures for each protein, we used the GROUP BY clause in SPARQL to aggregate the structures count for each protein.

The clause SAMPLE that we see in the first line is used in companion with GROUP BY and it is a set function which returns an arbitrary value from the multiset passed to it.

We need this selected sample for a PDB structure ID to construct the URL of the image of the corresponding protein form the Protein Data Bank Website

In line 2, we add a criteria for selecting only the entities of type protein (predicate P31 is "instance of", entity Q8054 is "Protein)

In line 3, we add a criteria for selecting the PDB structure of the selected proteins (predicate P638 is "PDB structure ID")

In line 4, we add a criteria for selecting the Uniprot ID of the selected proteins (predicate P352 is "Uniprot ID")

In line 6, it is specific to wikidata to retrieve the label of the selected entity with specifying the language of the label

In line 7, we use aggregation function to count the PDB structures for each protein

In line 8, we order the results by the count of the PDB structures in decending order

In line 10, we limit the number of returned results to 10



#### Constructing the HTML table

We loop through the response of the asyncronous request to wikidata (which is a JSON response composed of an array of the retrieved 10 objects, and for each iteration we add a row to the constructed HTML table. We do here two kinds of processing to the data:

- We construct a URL from the ID of the entity of the protein (so it is linked to the actual page of the protein on Wikidata) using the template: http://www.wikidata.org/entity/{entity_ID}
- We construct the URL of the 3D structure image of the protein which is hosted on the Protein Data Bank website using the template: https://cdn.rcsb.org/images/rutgers/{second_and_third_letter_from_structure_ID}/{structure_id}/{structure_id}.pdb1-500.jpg


## Github pages

You can access the assignment HTML page through Github pages on the following URL:

[https://a-ammar.github.io/MSB1015-Assignment1/](https://a-ammar.github.io/MSB1015-Assignment1/)


## Authors

Ammar Ammar 

Supervised By: Prof. Egon Willighagen
