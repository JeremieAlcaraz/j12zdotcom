# Component Documentation Protocol

When creating, modifying, or deleting a component, **always** update the Notion component database:
**Database URL**: https://www.notion.so/jeremie-alcaraz/21345368aa31802fbfa9f9f535300403

## Create Component

Use `mcp__Notion__notion-create-pages` with parent `data_source_id: "21345368-aa31-8156-af81-000b49fcc035"`.

**Required fields**:

- `name`: Component name (e.g., "BaseButton")
- `source_path`: File path from project root (e.g., "src/ui/atoms/BaseButton.astro")
- `layer`: "ui" or "domain"
- `level`: "atom", "molecule", "organism", "section", or "layout"
- `domain`: "core", "blog", "formation", "home", "about", "dev", or "style-guide"
- `framework`: "Astro", "React", or "Vue"
- `status`: "planned", "In_progress", or "ready"
- `date:last_updated:start`: Current date (ISO format)
- `date:last_updated:is_datetime`: 0

**Important fields**:

- `purpose`: Brief description of what it does
- `props_api`: Document props/interface
- `category`: JSON array (e.g., `["Text"]`, `["Layout", "Engagement"]`)
- `if_shortcode`: "**YES**" or "**NO**"
- `shortcode_scope`: If shortcode, specify "Generic", "Blog", "Formation", "Home", or "About"
- `variants`: JSON array of available variants (e.g., `["Default", "Compact"]`)

**Optional fields**:

- `import_alias`: If using custom alias
- `mdx_tag`: If available as MDX component
- `use_cases`: JSON array of use cases
- `dependencies`: JSON array of component URLs it depends on
- `seo_impact`: "None", "Low", "Medium", or "High"
- `a11y_notes`: Accessibility considerations
- `performance`: Performance notes
- `design_link`: Figma/design URL
- `example_docs`: Links to examples

## Modify Component

Use `mcp__Notion__notion-search` to find the component by name, then `mcp__Notion__notion-update-page` with command `update_properties`.

**Always update**:

- `date:last_updated:start`: Current date
- `changelog`: Describe what changed

**Update other fields** as needed based on modifications.

## Delete Component

1. Search for the component
2. Update with:
   - `status`: "deprecated"
   - `date:deprecation_date:start`: Current date
   - `date:deprecation_date:is_datetime`: 0
   - `changelog`: Reason for deprecation

**Do NOT** delete the Notion page - mark as deprecated instead.

## Example: Create Component

```json
{
  "parent": { "data_source_id": "21345368-aa31-8156-af81-000b49fcc035" },
  "pages": [
    {
      "properties": {
        "name": "BaseButton",
        "source_path": "src/ui/atoms/BaseButton.astro",
        "layer": "ui",
        "level": "atom",
        "domain": "core",
        "framework": "Astro",
        "status": "ready",
        "purpose": "Primary button component with multiple variants",
        "props_api": "variant: 'primary' | 'secondary' | 'ghost'\nsize: 'sm' | 'md' | 'lg'\ndisabled?: boolean",
        "category": "[\"Engagement\"]",
        "variants": "[\"Default\", \"Compact\"]",
        "if_shortcode": "__NO__",
        "date:last_updated:start": "2025-12-04",
        "date:last_updated:is_datetime": 0
      }
    }
  ]
}
```

## Tips

- Search first to avoid duplicates: `mcp__Notion__notion-search` with query type "internal"
- Use exact option names from schema (e.g., "In_progress" not "in_progress")
- Multi-select fields use JSON arrays: `["Text", "Layout"]`
- Dates use expanded format: `date:field_name:start`, `date:field_name:is_datetime`
- Checkbox values: `"__YES__"` or `"__NO__"`
