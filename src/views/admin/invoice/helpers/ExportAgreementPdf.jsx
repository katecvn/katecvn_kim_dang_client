import React from 'react'
import ReactDOM from 'react-dom/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ExportAgreement from '../components/ExportAgreement'

export async function exportAgreementPdf(
  data,
  filename = 'thoa_thuan_mua_ban.pdf',
  scale = 2,
) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '210mm', // A5 landscape width
    background: '#fff',
    opacity: '1',
    pointerEvents: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(container)

  const root = ReactDOM.createRoot(container)
  root.render(<ExportAgreement data={data} />)

  // Chờ render 2 frame
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  )

  // ===== 1. Đo tất cả bảng cần tránh cắt (TermsTable) trên DOM (px) =====
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
    // Bỏ qua các elements có thể gây lỗi
    ignoreElements: (element) => {
      // Bỏ qua các elements ẩn hoặc có opacity = 0
      const style = window.getComputedStyle(element)
      return style.display === 'none' || style.opacity === '0'
    },
    onclone: (clonedDoc) => {
      // Force tất cả colors về RGB/HEX để tránh lỗi oklch
      const allElements = clonedDoc.querySelectorAll('*')
      allElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el)
        // Reset các thuộc tính color về giá trị an toàn
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

  // A5 landscape: 210mm x 148mm
  const pdf = new jsPDF('l', 'mm', 'a5') // 'l' = landscape
  const pageWidth = pdf.internal.pageSize.getWidth() // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight() // 148mm
  const margin = 0 // No margin for full bleed
  const printableWidth = pageWidth - margin * 2
  const printableHeight = pageHeight - margin * 2

  const imgWidthPx = canvas.width
  const imgHeightPx = canvas.height

  // tỉ lệ DOM px -> canvas px
  const domToCanvasScale = imgWidthPx / containerRect.width

  // chiều cao 1 trang trên canvas (px)
  const pageHeightPx = printableHeight * (imgWidthPx / printableWidth)

  // Quy đổi vị trí bảng sang canvas px
  const avoidTables = avoidTablesDomInfo.map((t) => ({
    topPx: t.topDom * domToCanvasScale,
    bottomPx: t.bottomDom * domToCanvasScale,
  }))

  let renderedHeightPx = 0
  let pageIndex = 0

  while (renderedHeightPx < imgHeightPx) {
    const isFirstPage = pageIndex === 0

    // điểm cắt mặc định
    let target = renderedHeightPx + pageHeightPx
    if (target > imgHeightPx) target = imgHeightPx

    // ===== 3. Nếu điểm cắt rơi giữa một bảng avoid-split thì đẩy lên trước bảng đó =====
    avoidTables.forEach((tbl) => {
      const { topPx, bottomPx } = tbl

      // bảng nằm hoàn toàn trên/trong/ngoài đoạn hiện tại?
      const intersects =
        topPx < target && bottomPx > target && topPx >= renderedHeightPx

      if (intersects) {
        const tableHeight = bottomPx - topPx

        // Chỉ xử lý khi bảng nhỏ hơn 1 trang => có thể nhảy nguyên bảng sang trang sau
        if (tableHeight <= pageHeightPx) {
          // không để trang hiện tại thành trang trắng
          if (topPx - renderedHeightPx > 30) {
            // cắt trang trước khi vào bảng
            target = Math.min(target, topPx)
          }
        }
      }
    })

    const segmentHeightPx = target - renderedHeightPx
    if (segmentHeightPx <= 0) break

    const segmentHeightMm = (segmentHeightPx * printableWidth) / imgWidthPx

    // canvas cho từng trang
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
