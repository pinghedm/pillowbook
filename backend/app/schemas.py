default_item_types = [
    {
        "slug": "book",
        "name": "Book",
        "item_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "author": {"type": "string"},
                "series": {"type": "string"},
                "series_num": {"type": "number"},
                "labelMap": {
                    "type": "object",
                    "patternProperties": {".*": "string"},
                },
                "autocompleteFields": {
                    "type": "array",
                    "const": ["title", "author", "series"],
                },
            },
            "additionalProperties": False,
            "required": ["title", "author"],
        },
        "activity_schema": False,
    },
    {
        "slug": "movie",
        "name": "Movie",
        "item_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "series": {"type": "string"},
                "series_num": {"type": "number"},
                "labelMap": {
                    "type": "object",
                    "patternProperties": {".*": "string"},
                },
                "autocompleteFields": {
                    "type": "array",
                    "const": ["title"],
                },
            },
            "additionalProperties": False,
            "required": ["title"],
        },
        "activity_schema": False,
    },
]
