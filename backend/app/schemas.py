default_item_types = [
    {
        "slug": "book",
        "name": "Book",
        "name_schema": "{{title}}",
        "auto_complete_config": {},
        "item_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "Title"},
                "author": {"type": "string", "title": "Author"},
                "series": {"type": "string", "title": "Series"},
                "series_num": {"type": "number", "title": "Series #"},
            },
            "additionalProperties": False,
            "required": ["title", "author"],
        },
        "activity_schema": False,
    },
    {
        "slug": "movie",
        "name": "Movie",
        "name_schema": "{{title}}",
        "auto_complete_config": {},
        "item_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "title": "Title"},
                "series": {"type": "string", "title": "Series"},
                "series_num": {"type": "number", "title": "Series #"},
            },
            "additionalProperties": False,
            "required": ["title"],
        },
        "activity_schema": False,
    },
]
