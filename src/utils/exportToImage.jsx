
import html2canvas from 'html2canvas'

export async function exportDomToImage(
  element,
  filename = 'thoa_thuan.png',
  options = {}
) {
  if (!element) return

  const { scale = 3, format = 'png', quality = 0.95 } = options

  // 1. Clone node để xử lý (tránh ảnh hưởng giao diện thật)
  const clone = element.cloneNode(true)

  // 2. Tạo container ẩn
  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    background: '#fff',
    pointerEvents: 'none',
    zIndex: '-1',
    width: 'fit-content',
    height: 'fit-content',
    overflow: 'visible'
  })
  document.body.appendChild(container)
  container.appendChild(clone)

  // 3. Helper to convert any color to standard Hex/RGB
  const ctx = document.createElement('canvas').getContext('2d')
  const toStandardColor = (color) => {
    if (!color || color === 'none' || color === 'transparent') return color
    ctx.fillStyle = color
    return ctx.fillStyle // Browser converts to Hex or RGBA
  }

  // Helper check
  const isSafeColor = (colorValue) => {
    if (!colorValue || colorValue === 'transparent' || colorValue === 'none') {
      return false
    }
    return colorValue.startsWith('rgb') || colorValue.startsWith('#')
  }

  // 4. Pre-process CLONE: Sanitize Colors & Remove Styles

  // Step 1: Remove style tags
  const styles = clone.querySelectorAll('style, link[rel="stylesheet"]')
  styles.forEach(s => s.remove())

  // Step 2: Traverse all elements and inline safe colors
  const allElements = clone.querySelectorAll('*') // Does not include Pseudo-elements but getting computed style might reflect them if we were lucky (we aren't)

  // Note: html2canvas parses pseudo elements separately. We can't easily inline styles into pseudo elements of a clone.
  // HOWEVER, by removing classes (Step 3), we kill the pseudo elements defined by those classes.
  // Unless... the pseudo elements are defined in a way that survives? No, removing class kills ::before/::after from utility classes.

  allElements.forEach(el => {
    const computedStyle = window.getComputedStyle(el)

    const safeColors = {}

    // 2.1 Basic Colors
    const colorProps = [
      'color',
      'backgroundColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'fill',
      'stroke'
    ]

    colorProps.forEach(prop => {
      const value = computedStyle[prop]
      if (isSafeColor(value)) {
        safeColors[prop] = value
      } else {
        const converted = toStandardColor(value)
        if (converted && isSafeColor(converted)) {
          safeColors[prop] = converted
        } else {
          // If completely failed (still oklch), set to transparent to avoid crash
          if (value && (value.includes('oklch') || value.includes('oklab'))) {
            safeColors[prop] = 'transparent'
          }
        }
      }
    })

    // 2.2 Shadows (Box & Text) - These are complex strings
    const shadowProps = ['boxShadow', 'textShadow']
    shadowProps.forEach(prop => {
      const value = computedStyle[prop]
      if (value && (value.includes('oklch') || value.includes('oklab'))) {
        // Nuke shadows with modern colors to prevent crash
        safeColors[prop] = 'none'
      }
    })

    // 2.3 Background Image (Gradients)
    if (computedStyle.backgroundImage && (computedStyle.backgroundImage.includes('oklch') || computedStyle.backgroundImage.includes('oklab'))) {
      safeColors.backgroundImage = 'none'
    }

    // Step 3: Remove classes to detach from CSS variables
    try {
      if (el.className && typeof el.className === 'string') {
        el.className = ''
      } else if (el.className && el.className.baseVal !== undefined) {
        el.setAttribute('class', '')
      }
    } catch (e) { }

    // Step 4: Apply safe inline styles
    Object.keys(safeColors).forEach(prop => {
      el.style[prop] = safeColors[prop]
    })
  })

  // Reset transform/margin on root
  if (clone.style) {
    clone.style.transform = 'none'
    clone.style.margin = '0'
  }

  await new Promise(r => setTimeout(r, 200))

  try {
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const blob = await new Promise(resolve => {
      if (format === 'jpeg') {
        canvas.toBlob(resolve, 'image/jpeg', quality)
      } else {
        canvas.toBlob(resolve, 'image/png')
      }
    })

    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('Export error:', err)
    alert('Lỗi xuất ảnh: ' + err.message)
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }

  return { success: true }
}
