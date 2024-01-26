# @view-builder/ui

## 1.1.4

### Patch Changes

- Updated dependencies [6bac13e]
  - @view-builder/core@0.0.1
  - @view-builder/view-util@0.0.2

## 1.1.1

### Patch Changes

- daf4454: Point to the `zazuko.com` Cube Viewer instance

## 1.1.0

### Minor Changes

- 368ad50: Display a "bug" icon which opens SHACL Playground to inspect the view validation results

### Patch Changes

- 5ee398d: Automatically create and open the first view Source (re StatistikStadtZuerich/APD#144)
- b822519: Added version information to UI
- b822519: Improve styling and positioning
- d1407e1: Remove "name" fields from view form. Instead, source will be labeled using cube's `schema:name` and filters
  will be labeled based on the selection, similarly to "Zeit >= 10-10-1950"

  fixes StatistikStadtZuerich/APD#147
  fixes StatistikStadtZuerich/APD#145

- 368ad50: Disable menu links we still active. Now they will display SHACL report summary
- Updated dependencies [08a5cac]
  - @view-builder/view-util@0.0.1

## 1.0.2

### Patch Changes

- 0142990: Adding a new Source, Dimension, etc will show its sub-form expanded by default
- 365d2e4: Direct links to "Publish views" form or "Create new view" form failed to load
- 02a4dee: Set a default limit to 100 for every view. It will be removed when publishing

## 1.0.1

### Patch Changes

- 2981686: Query for filter properties would timeout on PROD

## 1.0.0

### Major Changes

- e3ba0ee: First production version of view builder

### Patch Changes

- 00a7536: Remove the hardocoded query endpoint from UI code
