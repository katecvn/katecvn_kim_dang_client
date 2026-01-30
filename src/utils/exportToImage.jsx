
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

  // 4. Pre-process CLONE: Sanitize Colors & Remove Styles
  // We do this BEFORE html2canvas sees it

  // Remove conflicting styles
  const styles = clone.querySelectorAll('style, link[rel="stylesheet"]')
  styles.forEach(s => s.remove())

  // Walk all elements and inline resolved colors
  const allElements = clone.querySelectorAll('*')
  allElements.forEach(el => {
    const style = window.getComputedStyle(el)
    const styleToCopy = {}

    // Explicitly copy standard color props to ensure they are inline
    // This locks in the RGB values regardless of what stylesheets say
    const simpleColorProps = [
      'color', 'backgroundColor', 'borderColor',
      'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
      'outlineColor', 'textDecorationColor', 'fill', 'stroke'
    ]

    simpleColorProps.forEach(p => {
      const val = style[p]
      if (val && val !== 'none' && val !== 'transparent') {
        // Browser computed style is typically rgb(...) unless variable
        styleToCopy[p] = toStandardColor(val)
      }
    })

    // Now check ALL properties for 'oklch' to avoid crashes in complex props
    for (let i = 0; i < style.length; i++) {
      const propName = style[i]
      const val = style.getPropertyValue(propName)

      if (val && (val.includes('oklch') || val.includes('oklab'))) {
        const converted = toStandardColor(val)

        // If conversion worked and is simple RGB/Hex, use it
        if (converted !== val && !converted.includes('oklch')) {
          styleToCopy[propName] = converted
        } else {
          // Complex string (like box-shadow). DELETE to avoid crash.
          el.style.setProperty(propName, 'none', 'important')
        }
      }
    }

    // Apply simple copies
    Object.entries(styleToCopy).forEach(([k, v]) => {
      if (v) el.style[k] = v
    })
  })

  // Reset transform
  if (clone.style) {
    clone.style.transform = 'none'
    clone.style.margin = '0'
  }

  // Wait for fonts/images
  await new Promise(r => setTimeout(r, 200))

  // 5. Build
  try {
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // No onclone needed anymore
    })

    // 6. Download
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
    // 6. Cleanup
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }

  return { success: true }
}
