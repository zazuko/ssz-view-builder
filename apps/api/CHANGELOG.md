# @view-builder/api

## 1.1.3

### Patch Changes

- 738e1e4: When publishing views, there was an invalid query being generated

## 1.1.2

### Patch Changes

- f389f80: Remove the restriction on searching for `ssz:Objekte`. Fixes the issue where the dropdown would load empty when creating a new view
- Updated dependencies [043c26d]
- Updated dependencies [14ef900]
  - @view-builder/publish-views@0.0.4

## 1.1.1

### Patch Changes

- 10d66f1: `dcat:keyword` were missing from published views (re StatistikStadtZuerich/APD#203)
- Updated dependencies [10d66f1]
  - @view-builder/publish-views@0.0.3

## 1.1.0

### Patch Changes

- 77ed34d: Allow missing metadata creator
- bc78bf2: View search now includes metadata creator (re StatistikStadtZuerich/APD#184)
  - @view-builder/publish-views@0.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [37ae0de]
  - @view-builder/publish-views@0.0.1

## 1.0.0

### Major Changes

- e3ba0ee: First production version of view builder

### Patch Changes

- e3ba0ee: Adjust queries for metadata to use `ssz:Objekte` type
- 00a7536: Remove the hardocoded query endpoint from UI code
