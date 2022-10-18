export function dedupeOperations() {
  return (req, res, next) => {
    req.hydra.operations = req.hydra.operations.filter(removePropertyOperationDuplicates)

    next()
  }
}

function removePropertyOperationDuplicates({ resource, operation }, _, all) {
  if (!('property' in resource)) {
    return true
  }

  const foundClassOperation = all.some(other => 'property' in other.resource && other.operation.term.equals(operation.term))
  return !foundClassOperation
}
