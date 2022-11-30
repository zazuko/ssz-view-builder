---
"@view-builder/ui": patch
---

Remove "name" fields from view form. Instead, source will be labeled using cube's `schema:name` and filters
will be labeled based on the selection, similarly to "Zeit >= 10-10-1950" 

fixes StatistikStadtZuerich/APD#147
fixes StatistikStadtZuerich/APD#145
