import React from 'react'

/**
 * Preview component for HopDongKhachBanLai (purchase contract)
 * Mirrors the Word template layout
 */
export default function ExportPurchaseContract({ data = {} }) {
  const vnd = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : n || '')
  const safe = (v, fallback = '…') => (v === 0 || v ? String(v) : fallback)

  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = String(today.getFullYear())

  const items = data?.items || []

  const cell = {
    border: '1px solid #000',
    padding: '4px',
    fontSize: '12pt',
    lineHeight: '1.26',
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 20mm',
        fontFamily: 'Times New Roman, Times, serif',
        fontSize: '13pt',
        lineHeight: '1.4',
        color: '#000',
      }}
    >
      {/* TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14pt' }}>HỢP ĐỒNG MUA HÀNG</div>
        <div style={{ fontSize: '13pt' }}>
          Số: {safe(data?.contract_no, '.......................')}
        </div>
      </div>

      {/* COMPANY INFO (Đơn vị mua hàng = Công ty) */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Căn cứ từ hợp đồng bán hàng số: <strong>{safe(data?.sale_contract_no, '.......................')}</strong>
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          <strong>Đơn vị mua hàng :</strong> Công ty TNHH MTV Vàng Bạc Đá Quý Kim Đặng
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Số tài khoản: 110603458080 &nbsp; Tại Ngân Hàng: Viettin Bank CN Cần Thơ
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Số điện thoại : 0973.79.43.46 – 098.449.0249
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Địa chỉ: 47 Ngô Văn Sở , Phường Ninh Kiều, Cần Thơ
        </p>
      </div>

      {/* CUSTOMER INFO (Người bán = khách hàng) */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: '0', fontWeight: 'bold', lineHeight: '1.4' }}>
          Thông tin người bán
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Họ tên: {safe(data?.customer_name, '............................................')}
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Địa chỉ: {safe(data?.customer_address, '............................................')}
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          CCCD: {safe(data?.customer_id_number, '............................................')}
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          SĐT: {safe(data?.customer_phone, '............................................')}
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Số tài khoản: {safe(data?.customer_bank_account, '............................................')}
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          Ngân hàng: {safe(data?.customer_bank_name, '............................................')}
        </p>
      </div>

      {/* ITEMS TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '8px' }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: 'center', fontWeight: 'bold', width: '40px' }}>STT</th>
            <th style={{ ...cell, textAlign: 'center', fontWeight: 'bold' }}>Tên hàng hoá, dịch vụ</th>
            <th style={{ ...cell, textAlign: 'center', fontWeight: 'bold', width: '55px' }}>ĐVT</th>
            <th style={{ ...cell, textAlign: 'center', fontWeight: 'bold', width: '70px' }}>Số Lượng</th>
            <th style={{ ...cell, textAlign: 'center', fontWeight: 'bold', width: '100px' }}>Đơn giá</th>
            <th style={{ ...cell, textAlign: 'center', fontWeight: 'bold', width: '110px' }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ ...cell, textAlign: 'center' }}>{item.index}</td>
                <td style={{ ...cell }}>{safe(item.name)}</td>
                <td style={{ ...cell, textAlign: 'center' }}>{safe(item.unit)}</td>
                <td style={{ ...cell, textAlign: 'center' }}>{safe(item.quantity)}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{vnd(item.price)}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{vnd(item.total)}</td>
              </tr>
            ))
          ) : null}
          {/* Empty padding rows */}
          {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ ...cell, height: '24px' }}></td>
              <td style={{ ...cell }}></td>
              <td style={{ ...cell }}></td>
              <td style={{ ...cell }}></td>
              <td style={{ ...cell }}></td>
              <td style={{ ...cell }}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <p style={{ margin: '0 0 16px', lineHeight: '1.4' }}>
        <strong>TỔNG TIỀN</strong>:{' '}
        {data?.total ? vnd(data.total) : '............................................'}
      </p>
      {data?.total_text && (
        <p style={{ margin: '0 0 16px', fontStyle: 'italic', fontSize: '11pt', lineHeight: '1.4' }}>
          ({data.total_text})
        </p>
      )}

      {/* TERMS (right side content from template) */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: '0', fontWeight: 'bold', lineHeight: '1.4' }}>Điều khoản :</p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          1. Thời hạn thanh toán khi khách hàng bán lại chậm nhất 05(năm) đến 07(bảy) ngày làm việc kể từ ngày ký hợp đồng mới.
        </p>
        <p style={{ margin: '4px 0 0', lineHeight: '1.4' }}>
          2. Chỉ nhận thu vào khi khách mang hợp đồng ra Công ty TNHH MTV Vàng Bạc Đá Quý Kim Đặng để chốt giá.
        </p>
        <p style={{ margin: '4px 0 0', lineHeight: '1.4' }}>
          3. Yêu cầu cung cấp đúng Căn cước công dân chính chủ khi giao dịch ( thông tin đơn hàng và chủ tài khoản chuyển tiền là cùng một người)
        </p>
        <p style={{ margin: '4px 0 0', lineHeight: '1.4' }}>4. Thời gian giao dịch:</p>
        <p style={{ margin: '0', lineHeight: '1.4', fontStyle: 'italic' }}>
          Thứ 2 đến thứ 7: Sáng: 8:30 đến 12:00
        </p>
        <p style={{ margin: '0', lineHeight: '1.4', fontStyle: 'italic', paddingLeft: '60px' }}>
          Chiều : 13:00 đến 17:00
        </p>
        <p style={{ margin: '4px 0 0', lineHeight: '1.4' }}>
          Quý khách vui lòng tuân thủ các điều khoản trên để thuận tiện trong việc mua bán.
        </p>
      </div>

      {/* SIGNATURE */}
      <p style={{ textAlign: 'center', margin: '0 0 24px', lineHeight: '1.4' }}>
        Cần Thơ, ngày {day} tháng {month} năm {year}
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', paddingRight: '10px' }}>
              <div style={{ fontWeight: 'bold', lineHeight: '1.4' }}>Người bán hàng</div>
              <div style={{ fontStyle: 'italic', fontSize: '11pt', marginBottom: '60px', lineHeight: '1.4' }}>
                (ký và ghi rõ họ tên)
              </div>
            </td>
            <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 'bold', lineHeight: '1.4' }}>Người mua hàng</div>
              <div style={{ fontStyle: 'italic', fontSize: '11pt', marginBottom: '60px', lineHeight: '1.4' }}>
                (ký và ghi rõ họ tên)
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
