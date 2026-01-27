import React from 'react'

export default function InstallmentContract({ data = {} }) {
  const LOGO_PATH = '/logo/logo-word.jpg'
  const BANK_QR_PATH = '/logo/qr-bank-word.jpg'

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

  const formatDateString = (value) => {
    const d = parseDate(value)
    if (!d) return '...-...-...'
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear())}`
  }

  // ================== DEFAULT DATA ==================
  const defaultCompany = {
    name: 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG',
    nameEn: 'DIAMOND JEWELRY',
    address: '47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam',
    phone: '0984490249',
    logo: LOGO_PATH,
    qrBank: BANK_QR_PATH
  }

  const defaultContract = {
    title: 'HỢP ĐỒNG BÁN HÀNG TRẢ CHẬM',
    subtitle: 'KIÊM XÁC NHẬN THU TIỀN',
    no: '',
    date: new Date().toISOString(),
  }

  const defaultCustomer = {
    name: '',
    phone: '',
    address: '',
    identityCard: '',
    identityDate: '',
    identityPlace: '',
  }

  const defaultItems = []

  const defaultTerms = {
    deliveryTime: {
      weekday: 'Thứ 2 đến thứ 7:',
      morning: '08:30 đến 12:00',
      afternoon: '13:00 đến 17:00'
    },
    commitments: [
      'Bên A chỉ trả hàng cho Bên B khi Bên B xuất trình CCCD/hộ chiếu có thông tin ghi đúng như trong hợp đồng này.',
      'Bên A chỉ trả hàng cho chính chủ của hợp đồng này. Miễn mọi trường hợp lấy hàng hộ.'
    ],
    ownership: [
      'Trong thời gian hợp đồng còn hiệu lực hoặc tại thời điểm giao dịch, Bên B có quyền bán lại sản phẩm cho Bên A.',
      'Giá bán lại được áp dụng theo giá mua vào do Công ty CP Đầu Tư Vàng Phú Quý (sản phẩm của Phú Quý) và Công ty CP Ancarat VN (sản phẩm của Ancarat) niêm yết tại thời điểm giao dịch thực tế.',
      'Khách phải đem theo hợp đồng để chốt cắt giá tại cửa hàng vào giờ làm việc (trừ ngày Chủ nhật). Không chốt giá online (vì giá liên tục dao động không ổn định).',
      'Khi bên B có nhu cầu bán lại phải đem hợp đồng này giao lại cho bên A và ký hợp đồng mua bán mới.'
    ],
    latePayment: 'Thời hạn thanh toán khi khách hàng bán lại chậm nhất 05(năm) đến 07(bảy) ngày làm việc kể từ ngày ký hợp đồng mới.',
    effectiveness: [
      'Hợp đồng có giá trị kể từ ngày ký.',
      'Hợp đồng sẽ hết hiệu lực ngay sau khi Bên B giao đủ tiền và nhận đủ hàng hoặc khi hết hạn thanh toán.',
      'Hợp đồng này được lập thành 02(hai) bản, mỗi bên giữ 01(một) bản có giá trị pháp lý như nhau.'
    ]
  }

  // ================== MERGE PROP DATA ==================
  const defaultSeller = {
    name: 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG',
    representative: '',
    address: '47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam',
    phone: '0984490249',
  }

  const company = { ...defaultCompany, ...(data?.company || {}) }
  const seller = { ...defaultSeller, ...(data?.seller || {}) }
  const contract = { ...defaultContract, ...(data?.contract || {}) }
  const contractDate = formatDate(contract.date)
  const customer = { ...defaultCustomer, ...(data?.customer || {}) }
  const items = data?.items ?? defaultItems
  const terms = { ...defaultTerms, ...(data?.terms || {}) }

  return (
    <div
      style={{
        backgroundColor: 'white',
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 20mm',
        fontFamily: 'Times New Roman, Times, serif',
        fontSize: '13pt',
        lineHeight: '1.26',
        color: '#000'
      }}
    >
      {/* HEADER - Table Layout giống docx */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '0'
      }}>
        <tbody>
          <tr>
            <td style={{
              width: '23.35%',
              textAlign: 'center',
              verticalAlign: 'top',
              padding: '0',
              paddingRight: '10px',
            }}>
              {/* Logo - khoảng 39x37px theo docx */}
              {company.logo && (
                <div style={{ marginBottom: '6px', marginTop: '2px', marginLeft: '35%' }}>
                  <img
                    src={company.logo}
                    alt="Kim Đặng Logo"
                    style={{
                      width: '39px',
                      height: '37px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
              <div style={{ fontWeight: 'bold', fontSize: '8pt', lineHeight: '1.26', marginBottom: '2px' }}>KIM ĐẶNG</div>
              <div style={{ fontWeight: 'bold', fontSize: '8pt', lineHeight: '1.26' }}>DIAMOND JEWELRY</div>
              {company.qrBank && (
                <div style={{ marginBottom: '6px', marginTop: '2px', marginLeft: '15%' }}>
                  <img
                    src={company.qrBank}
                    alt="QR Bank"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </td>
            <td style={{
              width: '76.65%',
              textAlign: 'center',
              verticalAlign: 'top',
              padding: '0',
              paddingLeft: '10px'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13pt', lineHeight: '1', marginBottom: '0' }}>
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div style={{ fontSize: '13pt', fontStyle: 'italic', lineHeight: '1', marginBottom: '0' }}>
                Độc lập – Tự do – Hạnh phúc
              </div>
              <div style={{ fontSize: '13pt', fontWeight: 'bold', margin: '6px 0 0 0', lineHeight: '1.26' }}>
                **************
              </div>

              {/* Empty space matching docx */}
              <div style={{ height: '6px' }}></div>

              {/* TITLE - Trong cột 2 như docx */}
              <div style={{
                fontSize: '14pt',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '0',
                lineHeight: '1'
              }}>
                {safe(contract.title)}
              </div>
              <div style={{
                fontSize: '14pt',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '0',
                lineHeight: '1'
              }}>
                {safe(contract.subtitle)}
              </div>
              <div style={{ fontSize: '13pt', marginTop: '0', lineHeight: '1.26' }}>
                Số: {safe(contract.no, '{contract_no}')}
              </div>

              {/* QR Code placeholder */}
              {data?.qrCode && (
                <div style={{ marginTop: '6px', marginLeft: '42%' }}>
                  <img
                    src={data.qrCode}
                    alt="QR Code"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* NỘI DUNG */}
      <div style={{ marginBottom: '0', marginTop: '30px' }}>
        <p style={{ textAlign: 'justify', margin: '0', lineHeight: '1.26' }}>
          Hôm nay, ngày {safe(contractDate.day, '{day}')} tháng {safe(contractDate.month, '{month}')} năm {safe(contractDate.year, '{year}')}. Tại địa chỉ: 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam. Chúng tôi gồm có:
        </p>
      </div>

      {/* EMPTY PARAGRAPH */}
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>

      {/* BÊN A */}
      <div style={{ marginBottom: '0', textAlign: 'justify', lineHeight: '1.26' }}>
        <span style={{ fontWeight: 'normal' }}>BÊN A (Bên bán): </span>
        <span style={{ fontWeight: 'bold', fontSize: '14pt' }}>{safe(seller.name)}</span>
      </div>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Đại diện: {safe(seller.representative, '…………………………………………………………………………………………')}
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Địa chỉ: {safe(seller.address)}
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Điện thoại: {safe(seller.phone)}
      </p>

      {/* EMPTY PARAGRAPH */}
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>

      {/* BÊN B */}
      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        BÊN B (Bên mua): {safe(customer.name, '{customer_name}')}
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Số điện thoại: {safe(customer.phone, '{customer_phone}')}
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        CCCD/Hộ chiếu số: {safe(customer.identityCard, '{id_number}')}
        {'\t\t'}Ngày cấp: {safe(customer.identityDate, '{id_date}')}
        {'\t'}Nơi cấp: {safe(customer.identityPlace, '{id_place}')}
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Địa chỉ thường trú: {safe(customer.address, '{customer_address}')}
      </p>

      <p style={{ textAlign: 'justify', margin: '0', fontWeight: 'bold', lineHeight: '1.26' }}>
        Sau khi thỏa thuận cùng nhau ký kết hợp đồng mua hàng với các điều khoản sau:
      </p>

      {/* ĐIỀU 1: SỐ LƯỢNG GIAO DỊCH */}
      <p style={{ textAlign: 'justify', margin: '0', lineHeight: '1.26' }}>
        <span style={{ fontWeight: 'bold' }}>Điều 1. Số lượng giao dịch: </span>
        Bên B đồng ý mua và Bên A  đồng ý bán chi tiết như sau:
      </p>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #000',
        fontSize: '12pt',
        marginBottom: '0',
        marginTop: '0'
      }}>
        <thead>
          <tr>
            <th style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
              width: '40px',
              lineHeight: '1.26'
            }}>STT</th>
            <th style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
              lineHeight: '1.26'
            }}>TÊN HÀNG</th>
            <th style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
              width: '70px',
              lineHeight: '1.26'
            }}>SL(ĐVT)</th>
            <th style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
              width: '100px',
              lineHeight: '1.26'
            }}>ĐƠN GIÁ</th>
            <th style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
              width: '110px',
              lineHeight: '1.26'
            }}>THÀNH TIỀN</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, index) => (
            <tr key={index}>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{safe(item.index || (index + 1), '{#items}{index}{/items}')}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{safe(item.name || item.description, '{#items}{name}{/items}')}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{safe(item.quantity || item.qty, '{#items}{quantity}{/items}')}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{safe(item.price ? vnd(item.price) : '', '{#items}{price}{/items}')}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{safe(item.total ? vnd(item.total) : '', '{#items}{total}{/items}')}</td>
            </tr>
          )) : (
            <tr>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{'#items}{index}{/items}'}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{'#items}{name}{/items}'}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{'#items}{quantity}{/items}'}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{'#items}{price}{/items}'}</td>
              <td style={{
                border: '1px solid #000',
                padding: '4px',
                textAlign: 'justify',
                fontSize: '12pt',
                lineHeight: '1.26'
              }}>{'#items}{total}{/items}'}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'right',
              fontSize: '12pt',
              fontWeight: 'bold',
              lineHeight: '1.26'
            }}>TỔNG CỘNG</td>
            <td style={{
              border: '1px solid #000',
              padding: '4px',
              textAlign: 'justify',
              fontSize: '12pt',
              fontWeight: 'bold',
              lineHeight: '1.26'
            }}>{safe(data?.totals?.grandTotal ? vnd(data.totals.grandTotal) : '', '{total}')}</td>
          </tr>
        </tfoot>
      </table>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Thành tiền (bằng chữ): {safe(data?.amountText, '{total_words}')}
      </p>

      {/* EMPTY PARAGRAPH */}
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>

      {/* ĐIỀU 2: THỜI HẠN GIAO HÀNG VÀ PHƯƠNG THỨC THANH TOÁN */}
      <p style={{ textAlign: 'justify', margin: '0', fontWeight: 'bold', lineHeight: '1.26' }}>
        Điều 2. Thời hạn giao hàng và phương thức thanh toán
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Phương thức thanh toán: Bên B giao cho Bên A 100% tổng số tiền của hợp đồng khi hợp đồng này được lập.
      </p>

      <p style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
        Thời hạn giao hàng: Bên A trả hàng cho Bên B vào ngày {safe(formatDateString(data?.payment?.deliveryDate), '{delivery_date}')}. (Quý khách phải mang theo CCCD)
      </p>

      {/* EMPTY PARAGRAPH */}
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>

      {/* ĐIỀU 3: THỜI GIAN GIAO DỊCH */}
      <p style={{ textAlign: 'justify', margin: '0', fontWeight: 'bold', lineHeight: '1.26' }}>
        Điều 3. Thời gian giao dịch:
      </p>

      <p style={{ textAlign: 'justify', margin: 0, fontStyle: 'italic', lineHeight: '1.26' }}>
        {terms.deliveryTime.weekday} Buổi sáng: {terms.deliveryTime.morning}
      </p>

      <p style={{ textAlign: 'justify', margin: 0, fontStyle: 'italic', paddingLeft: '120px', lineHeight: '1.26' }}>
        Buổi chiều: {terms.deliveryTime.afternoon}
      </p>

      {/* ĐIỀU 4: NHỮNG CAM KẾT CHUNG */}
      <p style={{ textAlign: 'justify', margin: '0', fontWeight: 'bold', lineHeight: '1.26' }}>
        Điều 4. Những cam kết chung
      </p>

      {terms.commitments.map((item, idx) => (
        <p key={idx} style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
          {item}
        </p>
      ))}

      {/* ĐIỀU 5: QUYỀN BÁN LẠI VÀ GIÁ BÁN LẠI */}
      <p style={{ textAlign: 'justify', margin: '0', fontWeight: 'bold', lineHeight: '1.26' }}>
        Điều 5. Quyền bán lại và giá bán lại
      </p>

      {terms.ownership.map((item, idx) => (
        <p key={idx} style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
          {item}
        </p>
      ))}

      <p style={{ textAlign: 'justify', margin: 0, fontWeight: 'bold', lineHeight: '1.26' }}>
        {terms.latePayment}
      </p>

      {/* ĐIỀU 6: HIỆU LỰC THỎA THUẬN */}
      <p style={{ textAlign: 'justify', margin: '0', fontWeight: 'bold', lineHeight: '1.26' }}>
        Điều 6 Hiệu lực thỏa thuận
      </p>

      {terms.effectiveness.map((item, idx) => (
        <p key={idx} style={{ textAlign: 'justify', margin: 0, lineHeight: '1.26' }}>
          {item}
        </p>
      ))}

      {/* EMPTY PARAGRAPHS */}
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>
      <p style={{ margin: 0, minHeight: '13pt', lineHeight: '1.26' }}>&nbsp;</p>

      {/* CHỮ KÝ - Table Layout */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '0'
      }}>
        <tbody>
          <tr>
            <td style={{
              width: '50%',
              textAlign: 'justify',
              verticalAlign: 'top',
              padding: '0 10px 0 0'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0', lineHeight: '1.26' }}>
                BÊN MUA
              </div>
              <div style={{ fontStyle: 'italic', fontSize: '11pt', marginBottom: '70px', lineHeight: '1.26' }}>
                (Ký, ghi rõ họ tên)
              </div>
            </td>
            <td style={{
              width: '50%',
              textAlign: 'justify',
              verticalAlign: 'top',
              padding: '0 0 0 10px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0', lineHeight: '1.26' }}>
                BÊN BÁN
              </div>
              <div style={{ fontStyle: 'italic', fontSize: '11pt', marginBottom: '70px', lineHeight: '1.26' }}>
                (Ký, ghi rõ họ tên)
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <style>{`
        @page {
          size: A4 portrait;
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