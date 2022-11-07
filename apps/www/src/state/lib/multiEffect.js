export function multiEffect(...effects) {
  return function combined(...args) {
    effects.forEach(effect => effect.call(this, ...args))
  }
}
