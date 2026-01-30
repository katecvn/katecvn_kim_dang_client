import React from 'react'

export default function ExportPurchaseContract({ data = {} }) {
  const LOGO_PATH = '/logo/logo-kim-dang.png'

  const vnd = (n) => {
    if (typeof n === 'number') {
      return n.toLocaleString('vi-VN')
    }
    return n || ''
  }

  const safe = (v, fallback = '…') => (v === 0 || v ? String(v) : fallback)

  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  const formatDate = (value) => {
    const d = parseDate(value)
    if (!d) {
      return { day: '...', month: '...', year: '...' }
    }
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
    }
  }

  // ================== DEFAULT DATA ==================
  const defaultCompany = {
    name: 'DNTN KIM ĐANG',
    address: '47 NGÔ VĂN SỞ, NINH KIỀU, CẦN THƠ',
    phone: '0984490249',
    logo: LOGO_PATH,
  }

  const defaultContract = {
    title: 'HỢP ĐỒNG MUA BÁN',
    no: '...',
    date: new Date().toISOString(),
  }

  const defaultSupplier = {
    name: '',
    phone: '',
    address: '',
    taxCode: '',
  }

  const defaultItems = []

  const defaultNotes = [
    'Hai bên cam kết thực hiện đúng các điều khoản trong hợp đồng.',
    'Hàng hóa đảm bảo đúng chất lượng, quy cách như đã thỏa thuận.',
    'Thanh toán đủ sau khi nhận đủ hàng và hóa đơn chứng từ hợp lệ.',
  ]

  // ================== MERGE PROP DATA ==================
  const company = { ...defaultCompany, ...(data?.company || {}) }
  const contract = { ...defaultContract, ...(data?.contract || {}) }
  const contractDate = formatDate(contract.date)
  const supplier = { ...defaultSupplier, ...(data?.supplier || {}) }
  const items = data?.items ?? defaultItems
  const amountText = data?.amountText || ''
  const noteContent = data?.note || ''
  const notes = data?.notes ?? defaultNotes

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '16px',
    }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          width: '210mm',
          minHeight: '297mm', // A4
          padding: '20mm',
          fontFamily: 'Times New Roman, Times, serif',
          fontSize: '13pt',
          lineHeight: '1.5',
          color: '#000000',
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ width: '100px', flexShrink: 0 }}>
            {company.logo && (
              <img
                src={company.logo}
                alt="Logo"
                style={{
                  width: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid black', display: 'inline-block', paddingBottom: '2px', marginBottom: '10px' }}>Độc lập - Tự do - Hạnh phúc</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{safe(contract.title)}</div>
          <div style={{ fontStyle: 'italic' }}>Số: {safe(contract.no)}</div>
          <div style={{ fontStyle: 'italic' }}>{`Cần Thơ, ngày ${contractDate.day} tháng ${contractDate.month} năm ${contractDate.year}`}</div>
        </div>

        {/* PARTIES */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold' }}>BÊN MUA (BÊN A): {company.name}</div>
          <div>Địa chỉ: {company.address}</div>
          <div>Điện thoại: {company.phone}</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold' }}>BÊN BÁN (BÊN B): {safe(supplier.name)}</div>
          <div>Địa chỉ: {safe(supplier.address)}</div>
          <div>Điện thoại: {safe(supplier.phone)}</div>
          {supplier.taxCode && <div>Mã số thuế: {safe(supplier.taxCode)}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          Hai bên thống nhất ký kết hợp đồng mua bán với các điều khoản sau:
        </div>

        {/* ARTICLE 1 */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold' }}>Điều 1: Nội dung hàng hóa</div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '5px',
            }}
          >
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '5px', width: '50px', textAlign: 'center' }}>STT</th>
                <th style={{ border: '1px solid black', padding: '5px', textAlign: 'left' }}>Tên hàng hóa</th>
                <th style={{ border: '1px solid black', padding: '5px', width: '80px', textAlign: 'center' }}>ĐVT</th>
                <th style={{ border: '1px solid black', padding: '5px', width: '80px', textAlign: 'right' }}>Số lượng</th>
                <th style={{ border: '1px solid black', padding: '5px', width: '110px', textAlign: 'right' }}>Đơn giá</th>
                <th style={{ border: '1px solid black', padding: '5px', width: '120px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>
                    {safe(item.name)}
                    {item.description && <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>({item.description})</div>}
                  </td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{safe(item.unitName)}</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>{safe(item.quantity)}</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>{vnd(item.price)}</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>{vnd(item.total)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} style={{ border: '1px solid black', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng</td>
                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>{vnd(data.totals?.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
            (Bằng chữ: {amountText})
          </div>
        </div>

        {/* OTHER ARTICLES */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold' }}>Điều 2: Thời gian và địa điểm giao hàng</div>
          <div>- Thời gian giao hàng: {noteContent ? noteContent : 'Theo thỏa thuận'}</div>
          <div>- Địa điểm giao hàng: Tại kho của Bên A</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold' }}>Điều 3: Cam kết chung</div>
          {notes.map((note, idx) => (
            <div key={idx}>- {note}</div>
          ))}
        </div>

        {/* SIGNATURES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', width: '40%' }}>
            <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN BÊN A</div>
            <div style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '80px' }}></div>
            <div style={{ fontWeight: 'bold' }}>{company.name}</div>
          </div>
          <div style={{ textAlign: 'center', width: '40%' }}>
            <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN BÊN B</div>
            <div style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '80px' }}></div>
            <div style={{ fontWeight: 'bold' }}>{safe(supplier.name)}</div>
          </div>
        </div>

      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
