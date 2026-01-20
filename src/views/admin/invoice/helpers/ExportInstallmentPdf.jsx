import React from 'react'
import ReactDOM from 'react-dom/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ExportInstallment from '../components/ExportInstallment'

export async function exportInstallmentPdf(
  data,
  filename = 'hop_dong_tra_cham.pdf',
  scale = 2,
) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '210mm', // A4 width
    background: '#fff',
    opacity: '1',
    pointerEvents: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(container)

  const root = ReactDOM.createRoot(container)
  root.render(<ExportInstallment data={data} />)

  // Chờ render 2 frame
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  )

  // ===== 1. Đo tất cả bảng cần tránh cắt trên DOM (px) =====
  const containerRect = container.getBoundingClientRect()
  const avoidTablesDom = Array.from(
    container.querySelectorAll('table.avoid-split-table'),
  )

  const avoidTablesDomInfo = avoidTablesDom.map((table) => {
    const rect = table.getBoundingClientRect()
    const topDom = rect.top - containerRect.top
    const bottomDom = rect.bottom - containerRect.top
    return { topDom, bottomDom }
  })

  // ===== 2. Chụp canvas =====
  const canvas = await html2canvas(container, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    ignoreElements: (element) => {
      const style = window.getComputedStyle(element)
      return style.display === 'none' || style.opacity === '0'
    },
    onclone: (clonedDoc) => {
      // Force tất cả colors về RGB/HEX để tránh lỗi oklch
      const allElements = clonedDoc.querySelectorAll('*')
      allElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el)
        if (computedStyle.color) {
          el.style.color = computedStyle.color
        }
        if (computedStyle.backgroundColor) {
          el.style.backgroundColor = computedStyle.backgroundColor
        }
        if (computedStyle.borderColor) {
          el.style.borderColor = computedStyle.borderColor
        }
      })
    },
  })

  // A4 portrait
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 12
  const printableWidth = pageWidth - margin * 2
  const printableHeight = pageHeight - margin * 2

  const imgWidthPx = canvas.width
  const imgHeightPx = canvas.height

  const domToCanvasScale = imgWidthPx / containerRect.width
  const pageHeightPx = printableHeight * (imgWidthPx / printableWidth)

  const avoidTables = avoidTablesDomInfo.map((t) => ({
    topPx: t.topDom * domToCanvasScale,
    bottomPx: t.bottomDom * domToCanvasScale,
  }))

  let renderedHeightPx = 0
  let pageIndex = 0

  while (renderedHeightPx < imgHeightPx) {
    const isFirstPage = pageIndex === 0

    let target = renderedHeightPx + pageHeightPx
    if (target > imgHeightPx) target = imgHeightPx

    avoidTables.forEach((tbl) => {
      const { topPx, bottomPx } = tbl
      const intersects =
        topPx < target && bottomPx > target && topPx >= renderedHeightPx

      if (intersects) {
        const tableHeight = bottomPx - topPx
        if (tableHeight <= pageHeightPx) {
          if (topPx - renderedHeightPx > 30) {
            target = Math.min(target, topPx)
          }
        }
      }
    })

    const segmentHeightPx = target - renderedHeightPx
    if (segmentHeightPx <= 0) break

    const segmentHeightMm = (segmentHeightPx * printableWidth) / imgWidthPx

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = imgWidthPx
    pageCanvas.height = segmentHeightPx

    const ctx = pageCanvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

    ctx.drawImage(
      canvas,
      0,
      renderedHeightPx,
      imgWidthPx,
      segmentHeightPx,
      0,
      0,
      imgWidthPx,
      segmentHeightPx,
    )

    const pageData = pageCanvas.toDataURL('image/png')

    if (!isFirstPage) {
      pdf.addPage()
    }

    pdf.addImage(
      pageData,
      'PNG',
      margin,
      margin,
      printableWidth,
      segmentHeightMm,
    )

    renderedHeightPx = target
    pageIndex += 1
  }

  pdf.save(filename)

  root.unmount()
  document.body.removeChild(container)
}
