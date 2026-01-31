import html2canvas from 'html2canvas'

/**
 * NUCLEAR APPROACH: Remove all styles, only keep essential inline styles
 * Use this if the main export function still fails with oklch errors
 */
export async function exportDomToImage(
  element,
  filename = 'thoa_thuan.png',
  options = {}
) {
  if (!element) return

  const { scale = 3, format = 'png', quality = 0.95 } = options

  // Clone the element
  const clone = element.cloneNode(true)

  // Create hidden container
  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    background: '#fff',
    pointerEvents: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(container)
  container.appendChild(clone)

  // STEP 1: Remove ALL stylesheets
  const sheets = clone.querySelectorAll('style, link[rel="stylesheet"]')
  sheets.forEach(s => s.remove())

  // STEP 2: Remove ALL classes
  const allElements = clone.querySelectorAll('*')
  Array.from(allElements).forEach(el => {
    try {
      if (el.className && typeof el.className === 'string') {
        el.className = ''
      } else if (el.className && el.className.baseVal !== undefined) {
        el.setAttribute('class', '')
      }
    } catch (e) { }
  })

  // STEP 3: Apply ONLY safe basic styles from inline styles attribute
  // We don't read computedStyle at all to avoid oklch
  Array.from(allElements).forEach(el => {
    // Clear any existing style
    const oldStyle = el.getAttribute('style') || ''

    // Only keep safe properties
    const safeProps = {
      // Layout
      'width': true,
      'height': true,
      'padding': true,
      'margin': true,
      'display': true,
      'flex': true,
      'flex-direction': true,
      'align-items': true,
      'justify-content': true,
      'position': true,
      'top': true,
      'left': true,
      'right': true,
      'bottom': true,

      // Text
      'font-size': true,
      'font-family': true,
      'font-weight': true,
      'text-align': true,
      'line-height': true,
      'letter-spacing': true,

      // Border
      'border': true,
      'border-width': true,
      'border-style': true,
      'border-collapse': true,

      // Transform
      'transform': true,
      'transform-origin': true,

      // Other
      'overflow': true,
      'vertical-align': true,
      'z-index': true,
    }

    // Parse existing inline style
    const newStyle = []
    if (oldStyle) {
      oldStyle.split(';').forEach(rule => {
        const [prop, value] = rule.split(':').map(s => s.trim())
        if (prop && value && safeProps[prop]) {
          // Skip if value contains oklch
          if (!value.includes('oklch') && !value.includes('oklab')) {
            newStyle.push(`${prop}: ${value}`)
          }
        }
      })
    }

    // Force safe colors (hardcoded)
    // Black text
    newStyle.push('color: rgb(0, 0, 0)')

    el.setAttribute('style', newStyle.join('; '))
  })

  // Wait for settle
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

    return { success: true }
  } catch (err) {
    console.error('Export error:', err)
    alert('Lỗi xuất ảnh: ' + err.message)
    throw err
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }
}