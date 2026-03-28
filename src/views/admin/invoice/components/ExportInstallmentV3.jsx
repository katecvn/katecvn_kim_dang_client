import React from 'react'

export default function ExportInstallmentV3({ data = {} }) {
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

  const formatDateField = (value, type) => {
    const d = parseDate(value)
    if (!d) return '...'
    if (type === 'day') return String(d.getDate()).padStart(2, '0')
    if (type === 'month') return String(d.getMonth() + 1).padStart(2, '0')
    if (type === 'year') return String(d.getFullYear())
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
        fontSize: '12pt',
        lineHeight: '1.26',
        color: '#000',
        boxSizing: 'border-box'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={{ width: '40%', verticalAlign: 'top', textAlign: 'center' }}>
              <img
                src="/logo/logo-word.jpg"
                alt="Logo Kim Đặng"
                style={{ display: 'block', margin: '0 auto', height: '60px', objectFit: 'contain', marginBottom: '5px' }}
              />
              <img
                src="/QR-bank.png"
                alt="Ngân hàng KIM ĐẶNG"
                style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '140px', objectFit: 'contain' }}
              />
            </td>
            <td style={{ width: '60%', verticalAlign: 'top', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div style={{ fontStyle: 'italic', fontSize: '13pt' }}>Độc lập – Tự do – Hạnh phúc</div>
              <div style={{ fontWeight: 'bold', fontSize: '12pt', margin: '5px 0 15px 0' }}>***************</div>

              <div style={{ fontWeight: 'bold', fontSize: '14pt' }}>HỢP ĐỒNG BÁN HÀNG TRẢ CHẬM</div>
              <div style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '5px' }}>KIÊM XÁC NHẬN THU TIỀN</div>
              <div>Số: {safe(contract.no, '{contract_no}')}</div>
              <img
                src={data.qrCode || "/QR.png"}
                alt="Link QR Code"
                style={{ display: 'block', margin: '5px auto 0', width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Content wrapper with dotted border */}
      <div style={{ borderTop: '1px dotted #888', paddingTop: '10px', marginTop: '10px' }}>
        <div style={{ marginBottom: '5px', textAlign: 'justify' }}>
          Hôm nay, ngày {formatDateField(contract.date, 'day')} tháng {formatDateField(contract.date, 'month')} năm {formatDateField(contract.date, 'year')}. Tại địa chỉ: 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam. Chúng tôi gồm có:
        </div>
        <div style={{ fontWeight: 'bold' }}>BÊN BÁN: CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG</div>
        <div>Địa chỉ: 47 Ngô Văn Sở, Phường Ninh Kiều, Cần Thơ, Việt Nam</div>
        <div>Mã số thuế: 1801755621</div>
        <div>Điện thoại: 0984490249</div>

        <div style={{ marginTop: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>BÊN MUA: {safe(customer.name, '{customer_name}')}</span>;
          Số điện thoại: {safe(formatPhone(customer.phone), '{customer_phone}')}
        </div>
        <div>CCCD/Hộ chiếu số: {safe(customer.identityCard, '{id_number}')}</div>
        <div>Địa chỉ thường trú: {safe(customer.address, '{customer_address}')}</div>

        <div style={{ fontWeight: 'bold', marginTop: '5px' }}>Sau khi thỏa thuận cùng nhau ký kết hợp đồng mua hàng với các điều khoản sau:</div>
        <div><span style={{ fontWeight: 'bold' }}>Điều 1. Số lượng giao dịch:</span> Bên B đồng ý mua và Bên A đồng ý bán chi tiết như sau:</div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', margin: '10px 0', fontSize: '11pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>STT</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>TÊN HÀNG</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>ĐVT</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>SL</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>ĐƠN GIÁ</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>THÀNH TIỀN</th>
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
              <td colSpan="4" rowSpan="3" style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'middle' }}>
                <span style={{ fontWeight: 'bold' }}>Ghi chú: Hẹn giao hàng ngày {safe(formatDateField(payment.deliveryDate, 'full'), '{delivery_date}')}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Tổng Thanh Toán</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.totalAmount)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Đã Thanh Toán</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.amountPaid)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Còn Phải Thu</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{vnd(totals.amountDue)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '5px' }}>Thành tiền (bằng chữ): <span style={{ fontWeight: 'bold' }}>{safe(data?.amountText, '{total_words}')}</span></div>

        <div><span style={{ fontWeight: 'bold' }}>Điều 2. Giao hàng và phương thức thanh toán</span></div>
        <div style={{ textAlign: 'justify' }}>Phương thức thanh toán: Bên B giao cho Bên A 100% tổng số tiền của hợp đồng khi hợp đồng này được lập.</div>
        <div style={{ textAlign: 'justify' }}>Quý khách phải mang theo CCCD và hợp đồng này khi đến nhận hàng vào ngày {safe(formatDateField(payment.deliveryDate, 'full'), '{delivery_date}')}</div>

        <div><span style={{ fontWeight: 'bold' }}>Điều 3. Thời gian giao dịch:</span> <span style={{ fontStyle: 'italic' }}>Thứ 2 đến thứ 7; Sáng: 08:30 đến 12:00; Chiều: 13:00 đến 17:00</span></div>

        <div><span style={{ fontWeight: 'bold' }}>Điều 4. Những cam kết chung</span></div>
        <div style={{ textAlign: 'justify' }}>Bên A chỉ trả hàng cho Bên B khi Bên B xuất trình CCCD/hộ chiếu có thông tin ghi đúng như trong hợp đồng này. Bên A chỉ trả hàng cho chính chủ của hợp đồng này. Miễn mọi trường hợp lấy hàng hộ.</div>

        <div><span style={{ fontWeight: 'bold' }}>Điều 5. Quyền bán lại và giá bán lại</span></div>
        <div style={{ textAlign: 'justify' }}>Trong thời gian hợp đồng còn hiệu lực hoặc tại thời điểm giao dịch, Bên B có quyền bán lại sản phẩm cho Bên A; Giá bán lại được áp dụng theo giá mua vào do Công ty CP Đầu Tư Vàng Phú Quý (sản phẩm của Phú Quý) và Công ty CP Ancarat VN (sản phẩm của Ancarat) niêm yết tại thời điểm giao dịch thực tế; Khách phải đem theo hợp đồng để chốt cắt giá tại cửa hàng vào giờ làm việc (trừ ngày Chủ nhật). Không chốt cắt giá online (vì giá lên xuống không ổn định).</div>
        <div style={{ textAlign: 'justify', fontWeight: 'bold' }}>Khi bên B có nhu cầu bán lại phải đem hợp đồng này giao lại cho bên A và ký hợp đồng mua bán mới.</div>
        <div style={{ textAlign: 'justify', fontWeight: 'bold' }}>Thời hạn thanh toán khi khách hàng bán lại chậm nhất 05 (năm) đến 07 (bảy) ngày làm việc kể từ ngày ký hợp đồng mới.</div>

        <div><span style={{ fontWeight: 'bold' }}>Điều 6. Hiệu lực thỏa thuận</span></div>
        <div style={{ textAlign: 'justify', marginBottom: '20px' }}>
          Hợp đồng có giá trị kể từ ngày ký. Hợp đồng sẽ hết hiệu lực ngay sau khi Bên B giao đủ tiền và nhận đủ hàng hoặc khi hết hạn thanh toán. Hợp đồng này được lập thành 02 (hai) bản, mỗi bên giữ 01 (một) bản có giá trị pháp lý như nhau.
        </div>

        <table style={{ width: '100%', marginTop: '30px' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>KHÁCH HÀNG</span><br />
                <span style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</span>
                <br /><br /><br /><br /><br />
              </td>
              <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13pt' }}>NGƯỜI LẬP PHIẾU</span><br />
                <span style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</span>
                <br /><br /><br /><br /><br />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
