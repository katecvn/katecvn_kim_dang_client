import React from 'react'

export default function ExportInstallmentV2({ data = {} }) {
  const vnd = (n) => {
    if (typeof n === 'number') return n.toLocaleString('vi-VN') + ' Đ'
    return n || ''
  }

  const safe = (v, fallback = '…') => (v === 0 || v ? String(v) : fallback)

  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const formatDateLabel = (value) => {
    const d = parseDate(value)
    if (!d) return '... tháng ... năm ...'
    return `${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')} năm ${d.getFullYear()}`
  }

  const formatDate = (value) => {
    const d = parseDate(value)
    if (!d) return ''
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  const formatPhone = (phone) => {
    if (!phone) return ''
    const cleaned = ('' + phone).replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    }
    return phone
  }

  // default mock fields
  const contract = data?.contract || {}
  const customer = data?.customer || {}
  const items = data?.items || []
  const totals = data?.totals || {}
  const payment = data?.payment || {}

  return (
    <div
      style={{
        backgroundColor: 'white',
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 20mm',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '13pt',
        lineHeight: '1.26',
        color: '#000',
        boxSizing: 'border-box'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={{ width: '70%', verticalAlign: 'top', lineHeight: '1.26' }}>
              <div style={{ fontWeight: 'bold' }}>CÔNG TY TNHH MTV VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG</div>
              <div>Địa chỉ: 47 Ngô Văn Sở, Phường Ninh Kiều, Cần Thơ, Việt Nam</div>
              <div>Mã số thuế: 1801755621</div>
              <div>Số điện thoại: 098.449.0249</div>
              <div>Số tài khoản: 110603458080</div>
              <div>Ngân hàng: VietinBank CN Cần Thơ</div>
            </td>
            <td style={{ width: '30%', verticalAlign: 'top', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <img
                  src={data.qrCode || "/QR.png"}
                  alt="QR Code"
                  style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Dashed line matching Docx */}
      <div style={{ borderTop: '1px dashed #A0A0A0', marginBottom: '10px' }}></div>

      <div style={{ textAlign: 'right', fontStyle: 'italic', marginBottom: '15px' }}>
        Cần Thơ, ngày {formatDateLabel(contract.date)}
      </div>

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15pt', marginBottom: '5px' }}>
        HỢP ĐỒNG BÁN HÀNG KIÊM GIẤY ĐẢM BẢO
      </div>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        Số: {safe(contract.no, '{contract_no}')}
      </div>

      {/* Dashed line matching Docx */}
      <div style={{ borderTop: '1px dashed #A0A0A0', marginBottom: '10px' }}></div>

      <div style={{ marginBottom: '10px', lineHeight: '1.26' }}>
        Họ và tên khách hàng: Ông/bà <span style={{ fontWeight: 'bold' }}>{safe(customer.name, '{customer_name}')}</span>{' '}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Năm Sinh: {safe(formatDate(customer.dateOfBirth), '{customer_dob}')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Số điện thoại: {safe(formatPhone(customer.phone), '{customer_phone}')}
        <br />
        CCCD/Hộ chiếu số: <span style={{ fontWeight: 'bold' }}>{safe(customer.identityCard, '{id_number}')}</span>{' '}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ngày cấp: {safe(formatDate(customer.identityDate), '{id_date}')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Nơi Cấp: {safe(customer.identityPlace, '{id_place}')}
        <br />
        Địa chỉ thường trú: {safe(customer.address, '{customer_address}')}.
        <br />
        Gửi về địa chỉ: {safe(customer.returnAddress, '{return_address}')}.
      </div>

      {/* Dashed line matching Docx */}
      <div style={{ borderTop: '1px dashed #A0A0A0', marginBottom: '10px' }}></div>

      <div style={{ marginBottom: '10px', lineHeight: '1.26' }}>
        <span style={{ fontWeight: 'bold' }}>1. Số lượng giao dịch:</span> Khách hàng đồng ý mua của công ty với các sản phẩm chi tiết như sau:
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '10px', fontSize: '12pt' }}>
        <thead>
          <tr style={{ backgroundColor: '#DBDBDB' }}>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>STT</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Tên Hàng</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>ĐVT</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>SL</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Đơn Giá</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.index}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{item.name}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(item.price)}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(item.total)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Không có sản phẩm</td>
            </tr>
          )}
          <tr>
            <td colSpan="4" rowSpan="4" style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
              <span style={{ fontWeight: 'bold' }}>GHI CHÚ:</span> {data?.notes}
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Tiền hàng</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.subtotalAmount)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Tổng Thanh Toán</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.totalAmount)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Khách Đã Thanh Toán</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.amountPaid)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Còn Phải Thu</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.amountDue)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginBottom: '10px', lineHeight: '1.26' }}>Thành tiền khách đã thanh toán (bằng chữ): <span style={{ fontStyle: 'italic' }}>{data?.amountText}</span>.</div>
      <div style={{ marginBottom: '5px', lineHeight: '1.26' }}><span style={{ fontWeight: 'bold' }}>2. Thanh toán:</span> Khách hàng thanh toán 100% số tiền Tổng Thanh Toán khi hợp đồng được lập.</div>
      <div style={{ marginBottom: '5px', lineHeight: '1.26' }}><span style={{ fontWeight: 'bold' }}>3. Giao hàng:</span> Quý khách cần xuất trình CCCD và Hợp đồng này khi nhận hàng, miễn mọi trường hợp lấy hàng hộ.<br />Công Ty TNHH MTV Vàng Bạc Đá Quý Kim Đặng hẹn giao hàng vào ngày {safe(formatDate(payment.deliveryDate), '{delivery_date}')}.</div>
      <div style={{ marginBottom: '10px', lineHeight: '1.26' }}><span style={{ fontWeight: 'bold' }}>4. Cam kết chung và Hiệu lục:</span></div>

      <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', textAlign: 'justify', lineHeight: '1.26' }}>
        <li>Hợp đồng bán hàng này được lập và có hiệu lực sau khi Công Ty MTV Vàng Bạc Đá Quý Kim Đặng nhận được tiền Đặt Cọc của khách hàng và Cầm kết giao hàng đúng thời hạn.</li>
        <li>Trong trường hợp Công Ty trả hàng cho khách hàng chậm hơn 05 ngày kể từ ngày hẹn giao hàng đã cam kết (không tính ngày thứ bảy, chủ nhật và ngày lễ), bên phía Công Ty phải trả hàng ngay và bồi thường cho khách hàng 2% giá trị của Tổng Tiền Thanh Toán theo phiếu chốt giá (Trừ trường hợp hai bên có thỏa thuận khác).</li>
        <li>Nếu khách hàng xác nhận đặt cọc và chốt giá trên Hợp đồng này mà không tiến hành mua tiếp và yêu cầu hoàn tiền lại thì phải chịu mất 10% của tổng giá trị tiền Tổng Thanh Toán.</li>
        <li>Trong thời gian chờ nhận hàng, Công Ty chỉ hỗ trợ mua lại đổi với đơn hàng đã Thanh toán đủ 100% từ ngày đầu đặt hàng khi đơn hàng chưa tới hạn trả hàng. KHÔNG hỗ trợ mua lại trước ngày lấy hàng đổi với các đơn hàng chỉ đặt cọc. Nhận thu lại tất cả các sản phẩm đã bán khi khách hàng thanh toán 100% số tiền Tổng Thanh Toán.</li>
        <li>Hợp Đồng này hết hiệu lực khi khách hàng giao đủ tiền và nhận đủ hàng.</li>
        <li>Hợp Đồng này được lập thành 02 bản, có giá trị pháp lý như nhau.</li>
      </ul>

      <table style={{ width: '100%', marginTop: '30px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>
              Khách hàng<br /><br /><br /><br /><br />
            </td>
            <td style={{ width: '50%', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>
              Người lập phiếu
              <br />
              <div style={{ marginTop: '5px' }}>Giám Đốc</div>
              <br /><br /><br /><br />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '30px' }}>
        <div style={{ borderTop: '1px dashed #A0A0A0', paddingTop: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Ghi chú:</span> {data?.transferNote}
        </div>
      </div>
    </div>
  )
}
