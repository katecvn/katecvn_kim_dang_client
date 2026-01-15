const convertSizeToBytes = (sizeType, sizeValue, round = 'nearest') => {
  const units = { B: 0, KB: 1, MB: 2, GB: 3, TB: 4 }
  const power = units[sizeType] ?? 0
  const factor = Math.pow(1024, power)

  const v =
    typeof sizeValue === 'string' ? parseFloat(sizeValue) : Number(sizeValue)
  const bytes = v * factor

  if (!Number.isFinite(bytes) || bytes < 0) return 0
  if (round === 'up') return Math.ceil(bytes)
  if (round === 'down') return Math.floor(bytes)
  return Math.round(bytes)
}

export default convertSizeToBytes
