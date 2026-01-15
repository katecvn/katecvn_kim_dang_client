export const cleanNumberString = (input, type = 'integer') => {
  // Convert input to string if it's a number, handle null or undefined as empty string
  const stringInput =
    input == null
      ? ''
      : typeof input === 'number'
        ? input.toString()
        : typeof input === 'string'
          ? input
          : ''

  // Remove all non-digit and non-decimal characters
  const cleanedString = stringInput.replace(/[^\d.]/g, '')

  // Define type-specific parsing functions using Map
  const typeMap = new Map([
    ['float', () => parseFloat(cleanedString)],
    ['integer', () => parseInt(cleanedString, 10)],
  ])

  // Select the appropriate parsing function or default to integer
  const parse = typeMap.get(type) || typeMap.get('integer')

  // Return 0 if parsing results in NaN or the cleaned string is empty
  const result = parse()
  return isNaN(result) || cleanedString === '' ? 0 : result
}
