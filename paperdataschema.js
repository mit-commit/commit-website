{
    types: {
        'Person': {
            pluralLabel: 'People'
        },
        'Publication': {
            pluralLabel: 'Publications'
        }
    },
    properties: {
        'ps': {
            valueType: "url"
        },
        'pdf': {
            valueType: "url"
        },
        'psgz': {
            valueType: "url"
        },
        'download': {
            valueType: "url"
        },
        'author': {
            label:                  "author",
            pluralLabel:            "authors",    
            reverseLabel:           "author of",
            reversePluralLabel:     "authors of",
            groupingLabel:          "their authors",
            reverseGroupingLabel:   "their work"
        },
        'venue': {
            valueType:              "item"
        },
	'cat': {
	    label: "category",
	    pluralLabel: "categories"
	    },
        'pub-type': {
            label:   "type",
            valueType: "item"
        }
    },
    items: [
           {
	   id: 'incollection',
       	   label: "In a Book/Collection"
	   },
           {
	   id: 'inproceedings',
       	   label: "Conference Publication"
	   },
           {
	   id: 'article',
       	   label: "Journal Article"
	   },
           {
	   id: 'phdthesis',
       	   label: "PhD Thesis"
	   },
           {
	   id: 'techreport',
       	   label: "Technical Report"
	   },
           {
	   id: 'unpublished',
       	   label: "Manuscript"
	   }
	]
}
