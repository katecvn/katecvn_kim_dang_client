import React from 'react'
import ReactDOM from 'react-dom/client'
import html2pdf from 'html2pdf.js'
import ExportAgreement from '../components/ExportAgreement'

export async function exportAgreementPdf(
  data,
  filename = 'thoa_thuan_mua_ban.pdf',
) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    background: '#fff',
    opacity: '1',
    pointerEvents: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(container)

  const root = ReactDOM.createRoot(container)
  root.render(<ExportAgreement data={data} />)

  // Chờ render xong
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  )

  // Config html2pdf
  const options = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Step 1: Disable all external stylesheets to prevent oklch from CSS variables
        const styleSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style')
        styleSheets.forEach(sheet => {
          if (sheet.parentNode) {
            sheet.parentNode.removeChild(sheet)
          }
        })

        // Step 2: Remove all Tailwind classes and force inline styles only
        const allElements = clonedDoc.querySelectorAll('*')

        allElements.forEach((el) => {
          // Get computed style BEFORE removing classes
          const computedStyle = window.getComputedStyle(el)

          // Helper to check if color is safe (not oklch)
          const isSafeColor = (colorValue) => {
            if (!colorValue || colorValue === 'transparent' || colorValue === 'none') {
              return false
            }
            // Only allow rgb, rgba, hex colors
            return colorValue.startsWith('rgb') || colorValue.startsWith('#')
          }

          // Store safe colors before removing classes
          const safeColors = {}
          const colorProps = [
            'color',
            'backgroundColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor'
          ]

          colorProps.forEach(prop => {
            const value = computedStyle[prop]
            if (isSafeColor(value)) {
              safeColors[prop] = value
            }
          })

          // Remove all classes (this removes Tailwind oklch colors)
          // Use try-catch as className is read-only for SVG elements
          try {
            if (el.className && typeof el.className === 'string') {
              el.className = ''
            } else if (el.className && el.className.baseVal !== undefined) {
              // SVG element - use setAttribute instead
              el.setAttribute('class', '')
            }
          } catch (e) {
            // Ignore read-only errors
          }

          // Apply only safe colors as inline styles
          Object.keys(safeColors).forEach(prop => {
            el.style[prop] = safeColors[prop]
          })
        })
      }
    },
    jsPDF: {
      format: 'a5',
      orientation: 'landscape',
      unit: 'mm',
      precision: 2,
      hotfixes: ['px_scaling']
    }
  }

  // Tìm element chính (innermost div với width 210mm)
  const pageElement = container.querySelector('div[style*="210mm"]')

  if (pageElement) {
    try {
      await html2pdf().set(options).from(pageElement).save()
    } catch (error) {
      console.error('Export PDF error:', error)
      throw error
    }
  }

  root.unmount()
  document.body.removeChild(container)
}
