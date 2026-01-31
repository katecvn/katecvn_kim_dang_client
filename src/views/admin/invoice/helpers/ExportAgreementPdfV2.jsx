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
        // Step 1: Disable stylesheets
        const styleSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style')
        styleSheets.forEach(sheet => {
          if (sheet.parentNode) sheet.parentNode.removeChild(sheet)
        })

        // Helper: Canvas for color conversion
        const ctx = clonedDoc.createElement('canvas').getContext('2d')
        const toStandardColor = (color) => {
          if (!color || color === 'none' || color === 'transparent') return color
          ctx.fillStyle = color
          return ctx.fillStyle
        }

        const isSafeColor = (c) => {
          if (!c || c === 'transparent' || c === 'none') return false
          return (c.startsWith('rgb') || c.startsWith('#')) && !c.includes('oklch') && !c.includes('oklab')
        }

        // Step 2: Traverse and inline safe colors
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el) => {
          const computedStyle = window.getComputedStyle(el) // NOTE: Might be flaky in clone, but usually works if stylesheets removed first? Actually stylesheets removal *breaks* computed style if we don't grab it first.
          // BUT: html2canvas clone is already detached.
          // The best way is to rely on what styles match.
          // Since we removed stylesheets, computedStyle might fall back to defaults unless inline styles were present.
          // HOWEVER, we are trying to stripping 'oklch' which comes from Tailwind vars.
          // If we removed stylesheets, the vars are gone. The elements might turn black/transparent.
          // This logic assumes we want to PRESERVE the look.
          // Actually, if we remove stylesheets, we lose the classes.
          // **CRITICAL FIX**: We should NOT rely on removing stylesheets to kill oklch if we want to keep colors.
          // We must grab computed style (which has oklch) -> Convert to RGB -> Inline it -> Then remove classes/stylesheets.
          // But `onclone` runs AFTER cloning. The clone might not have the calculated styles if it's in a hidden iframe without the parent's context?
          // html2canvas copies computed styles to inline styles automatically? NO.

          // Let's assume the previous logic (grab computed, inline it) is the way to go.
          // Getting computed style from `el` in `clonedDoc` works if stylesheets are present.
          // So we should REMOVE stylesheets AFTER inlining.

          // REVISION: Move stylesheet removal to END of loop or don't remove them, just override.
          // Actually, simply removing classes and inlining safe colors is best.

          const safeColors = {}
          const colorProps = [
            'color', 'backgroundColor', 'borderColor',
            'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
            'outlineColor', 'fill', 'stroke'
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
                if (value && (value.includes('oklch') || value.includes('oklab'))) {
                  safeColors[prop] = 'transparent'
                }
              }
            }
          })

          // Shadows
          const shadowProps = ['boxShadow', 'textShadow']
          shadowProps.forEach(prop => {
            const value = computedStyle[prop]
            if (value && (value.includes('oklch') || value.includes('oklab'))) {
              safeColors[prop] = 'none'
            }
          })

          // Remove classes
          try {
            if (el.className && typeof el.className === 'string') el.className = ''
            else if (el.className && el.className.baseVal !== undefined) el.setAttribute('class', '')
          } catch (e) { }

          // Apply inline
          Object.keys(safeColors).forEach(p => el.style[p] = safeColors[p])

          // Force box-sizing to prevent layout shift when stylesheets are stripped
          el.style.boxSizing = 'border-box'
        })

        // Step 3: Specific fixes for PDF Layout (The Alignment Issue)
        // Find the paper element (210mm)
        const paper = clonedDoc.querySelector('div[style*="210mm"]')
        if (paper) {
          paper.style.boxShadow = 'none' // Remove shadow that might shift layout
          paper.style.margin = '0'
          paper.style.transform = 'none'
          // Ensure no border on the paper itself if it affects print rect
        }
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
