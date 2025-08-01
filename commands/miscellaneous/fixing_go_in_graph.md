## Project Overview

We're working on improving the Gene Ontology (GO) term handling in TorchCell,
specifically focusing on properly integrating GO annotations from multiple sources
within the graph representation module. The goal is to ensure that the G_go graph in
TorchCell correctly incorporates GO terms from both raw SGD (Saccharomyces Genome
Database) data and GAF (Gene Association File) data.

## Key Files

1. /Users/michaelvolk/Documents/projects/torchcell/torchcell/graph/graph.py - Core file
containing the graph representation classes and GO term handling
2. /Users/michaelvolk/Documents/projects/torchcell/experiments/005-kuzmin2018-tmi/script
s/go_vs_go_raw.py - Original script for comparing GO annotations (has issues)
3. /Users/michaelvolk/Documents/projects/torchcell/torchcell/sequence/genome/scerevisiae/s288c.py

## Main Issues Identified

1. GAF Data Loading Issue: The original implementation wasn't properly using the goatools library to parse GAF files. This resulted in missing GO terms and annotations.
2. Incorrect Data Structure Handling: The GAF data structure was being accessed incorrectly in the analysis scripts, leading to zero GAF annotations being extracted
despite the data being loaded.
3. Data Integration Gap: The extracted GO terms from the GAF file weren't properly being integrated into the G_go graph, resulting in the graph missing important annotations.

## Supporting Information

- We have 37,854 go annotations as previously evaluated whereas there are 120,735 reported by [geneontology.org](https://current.geneontology.org/products/pages/downloads.html) - This is a pretty big discrepancy that probably accounts for the differences we are seeing.

```python
sum([len(v) for k,v in graph.go_to_genes.items()])
67372
```

## Current Issues

Now filtering by evidence code IGI is not working. 


## sgd.gaf

```bash
!gaf-version: 2.2