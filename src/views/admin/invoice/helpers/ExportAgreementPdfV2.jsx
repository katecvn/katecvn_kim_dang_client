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
    html2canvas: { scale: 2 },
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
