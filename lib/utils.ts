/**
 * Type-safe version of Object#hasOwnProperty
 *
 * @param {T} obj - The object to check.
 * @param {Key} key - The property key to check.
 * @returns {obj is Record<Key, unknown> & T} - Returns `true` if the object has the property, `false` otherwise.
 *
 * @example
 * const obj = { name: 'John', age: 30 }
 * const hasName = has(obj, 'name') //=> true
 * const hasEmail = has(obj, 'email') //=> false
 */
export const has = <T extends object, Key extends PropertyKey>(
  obj: T,
  key: Key,
): obj is Record<Key, unknown> & T => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * Partition an array into two arrays based on a predicate function.
 *
 * @template T - The type of elements in the input array.
 * @template L - The type of elements in the left partition.
 * @template R - The type of elements in the right partition.
 * @param {T[]} list - The input array.
 * @param {(arg: T) => boolean} predicate - The function to determine which partition an element belongs to.
 * @returns {[L[], R[]]} - An array of two arrays, the left partition and the right partition.
 *
 * @example
 * const list = [1, 2, 3, 4, 5]
 * const [evens, odds] = partition(list, x => x % 2 === 0)
 * console.log(evens) //=> [2, 4]
 * console.log(odds) //=> [1, 3, 5]
 */
export const partition = <T, L extends T = T, R extends T = T>(
  list: T[],
  predicate: (arg: T) => boolean,
): [L[], R[]] => {
  const result: [L[], R[]] = [[], []]

  return list.reduce((acc, x) => {
    const [left, right] = acc

    if (predicate(x)) {
      left.push(x as L)
    } else {
      right.push(x as R)
    }

    return acc
  }, result)
}

/**
 * Pick specific properties from an object and preserve types.
 *
 * @template T - The type of the input object.
 * @template K - The type of the keys to pick.
 * @param {T} obj - The input object.
 * @param {K[]} keys - The keys to pick.
 * @returns {Pick<T, K>} - An object containing only the picked properties.
 *
 * @example
 * const user = { name: 'John', age: 30, address: '123 Main St' }
 * const picked = pick(user, ['name', 'age'])
 * console.log(picked) //=> { name: 'John', age: 30 }
 */
export const pick = <T extends Record<PropertyKey, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (has(obj, key)) {
      result[key] = obj[key]
    }
  }

  return result
}
