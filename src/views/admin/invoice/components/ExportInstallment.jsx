import React from 'react'

export default function InstallmentContract({ data = {} }) {
  const LOGO_PATH = '/logo/logo-kim-dang-square.png'

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
    name: 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM DANG',
    nameEn: 'DIAMOND JEWELRY',
    address: '47 NGÔ VĂN SỞ, PHƯỜNG NINH KIỀU, THÀNH PHỐ CẦN THƠ, VIỆT NAM',
    phone: '0984490249',
    logo: LOGO_PATH,
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
    idCard: '',
    idIssueDate: '',
    idIssuePlace: '',
  }

  const defaultItems = []

  const defaultTerms = {
    deliveryTime: {
      morning: '08:30 đến 12:00',
      afternoon: '13:00 đến 17:00'
    },
    commitments: [
      'Bên A chỉ trả hàng cho Bên B khi Bên B xuất trình CCCD/hộ chiếu có thông tin ghi đúng như trong hợp đồng này.',
      'Bên A chỉ trả hàng cho chính chủ của hợp đồng này. Miễn mọi trường hợp lấy hộ.'
    ],
    ownership: [
      'Trong thời gian hợp đồng còn hiệu lực hoặc tại thời điểm giao dịch, Bên B có quyền bán lại sản phẩm cho Bên A.',
      'Giá bán lại được áp dụng theo giá mua vào của Công ty CP Đầu Tư Vàng Phú Quý (sản phẩm của Phú Quý) và Công ty CP Ancarat VN (sản phẩm của Ancarat) niêm yết tại thời điểm giao dịch thực tế.',
      'Khách phải đem theo hợp đồng để chốt giá tại của hàng vào giờ làm việc (trừ ngày Chủ nhật). Không chốt giá online (vì giá liên tục dao động không ổn định).',
      'Khi bên B có nhu cầu bán lại phải đem hợp đồng này giao lại cho bên A và ký hợp đồng mua bán mới.'
    ],
    latePayment: [
      'Thời hạn thanh toán khi khách hàng bán lại chậm nhất 05(năm) đến 07(bảy) ngày làm việc kể từ ngày ký hợp đồng mới.'
    ],
    effectiveness: [
      'Hợp đồng có giá trị kể từ ngày ký.',
      'Hợp đồng sẽ hết hiệu lực ngay sau khi Bên B giao đủ tiền và nhận đủ hàng hoặc khi hết hạn thanh toán.',
      'Hợp đồng này được lập thành 02(hai) bản, mỗi bên giữ 01(một) bản có giá trị pháp lý như nhau.'
    ]
  }

  // ================== MERGE PROP DATA ==================
  const company = { ...defaultCompany, ...(data?.company || {}) }
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
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#000'
      }}
    >
      {/* HEADER - New Layout with Vietnam Header and Title Combined */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #000'
      }}>
        {/* Left side - Logo and company info */}
        <div style={{
          flex: '0 0 40%',
          borderRight: '1px dashed #999',
          paddingRight: '15px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {company.logo && (
            <img
              src={company.logo}
              alt="Logo"
              style={{
                height: '60px',
                objectFit: 'contain',
                marginBottom: '8px'
              }}
            />
          )}
          <div style={{
            fontWeight: 'bold',
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '3px'
          }}>
            KIM DANG
          </div>
          <div style={{
            fontWeight: 'bold',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            DIAMOND JEWELRY
          </div>
        </div>

        {/* Right side - Vietnam header + Contract Title */}
        <div style={{ flex: '0 0 55%', textAlign: 'center' }}>
          {/* Vietnam Header */}
          <div style={{
            fontSize: '13px',
            fontWeight: 'bold',
            marginBottom: '3px'
          }}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </div>
          <div style={{
            fontSize: '12px',
            fontStyle: 'italic',
            marginBottom: '8px'
          }}>
            Độc lập – Tự do – Hạnh phúc
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            marginBottom: '15px'
          }}>
            **************
          </div>

          {/* Contract Title - inside same box */}
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '3px'
          }}>
            {safe(contract.title)}
          </div>
          <div style={{
            fontSize: '15px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            {safe(contract.subtitle)}
          </div>
          <div style={{ fontSize: '13px' }}>
            Số: {safe(contract.no, '{contract_no}')}
          </div>
        </div>
      </div>

      {/* NỘI DUNG */}
      <div style={{ marginBottom: '15px' }}>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Hôm nay, ngày {safe(contractDate.day, '{day}')} tháng {safe(contractDate.month, '{month}')} năm {safe(contractDate.year, '{year}')}. Tại địa chỉ: 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam. Chúng tôi gồm có:
        </p>

        {/* BÊN A */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
            BÊN A (Bên bán): {safe(company.name)}
          </div>
          <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
            <div>Đại diện: .........................................................................</div>
            <div>Địa chỉ: {safe(company.address)}</div>
            <div>Điện thoại: {safe(company.phone)}</div>
          </div>
        </div>

        {/* BÊN B */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
            BÊN B (Bên mua): {safe(customer.name, '{customer_name}')}
          </div>
          <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
            <div>Số điện thoại: {safe(customer.phone, '{customer_phone}')}</div>
            <div>
              CCCD/Hộ chiếu số: {safe(customer.idCard, '{id_number}')} Ngày cấp: {safe(customer.idIssueDate, '{id_date}')} Nơi cấp: {safe(customer.idIssuePlace, '{id_place}')}
            </div>
            <div>Địa chỉ thường trú: {safe(customer.address, '{customer_address}')}</div>
          </div>
        </div>

        <p style={{ textAlign: 'justify', marginBottom: '12px' }}>
          Sau khi thỏa thuận cùng nhau ký kết hợp đồng mua bán hàng với các điều khoản sau:
        </p>
      </div>

      {/* ĐIỀU 1: SỐ LƯỢNG GIAO DỊCH */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Điều 1. Số lượng giao dịch: Bên B đồng ý mua và Bên A đồng ý bán chi tiết như sau:
        </div>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
          fontSize: '12px'
        }}>
          <thead>
            <tr>
              <th style={{
                border: '1px solid #000',
                padding: '6px 4px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '40px'
              }}>STT</th>
              <th style={{
                border: '1px solid #000',
                padding: '6px 4px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>TÊN HÀNG</th>
              <th style={{
                border: '1px solid #000',
                padding: '6px 4px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '70px'
              }}>SL/ĐVT</th>
              <th style={{
                border: '1px solid #000',
                padding: '6px 4px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '100px'
              }}>ĐƠN GIÁ</th>
              <th style={{
                border: '1px solid #000',
                padding: '6px 4px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '110px'
              }}>THÀNH TIỀN</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item, index) => (
              <tr key={index}>
                <td style={{
                  border: '1px solid #000',
                  padding: '6px 4px',
                  textAlign: 'center'
                }}>{safe(item.index || (index + 1), `{#items}{index}{/items}`)}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '6px 4px'
                }}>{safe(item.name || item.description, '{#items}{name}{/items}')}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '6px 4px',
                  textAlign: 'center'
                }}>{safe(item.quantity || item.qty, '{#items}{quantity}{/items}')}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '6px 4px',
                  textAlign: 'right'
                }}>{safe(item.price, '{#items}{price}{/items}')}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '6px 4px',
                  textAlign: 'right'
                }}>{safe(item.total, '{#items}{total}{/items}')}</td>
              </tr>
            )) : (
              // Empty row showing placeholder format
              <tr>
                <td style={{
                  border: '1px solid #000',
                  padding: '12px 4px',
                  textAlign: 'center',
                  color: '#999'
                }}>{'#'}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '12px 4px',
                  color: '#999'
                }}>{'...'}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '12px 4px',
                  textAlign: 'center',
                  color: '#999'
                }}>{'...'}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '12px 4px',
                  textAlign: 'right',
                  color: '#999'
                }}>{'...'}</td>
                <td style={{
                  border: '1px solid #000',
                  padding: '12px 4px',
                  textAlign: 'right',
                  color: '#999'
                }}>{'...'}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{
          textAlign: 'left',
          marginTop: '8px'
        }}>
          Thành tiền (bằng chữ): {safe(data?.totalWords, '{total_words}')}
        </div>
      </div>

      {/* ĐIỀU 2: THỜI HẠN GIAO HÀNG VÀ PHƯƠNG THỨC THANH TOÁN */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Điều 2. Thời hạn giao hàng và phương thức thanh toán
        </div>
        <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
          <div style={{ marginBottom: '5px' }}>
            1. Phương thức thanh toán: Bên B giao cho Bên A 100% tổng số tiền của hợp đồng khi hợp đồng này được lập.
          </div>
          <div>
            2. Thời hạn giao hàng: Bên A trả hàng cho Bên B vào ngày {safe(data?.deliveryDate, '{delivery_date}')} (Quý khách phải mang theo CCCD)
          </div>
        </div>
      </div>

      {/* ĐIỀU 3: THỜI GIAN GIAO DỊCH */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Điều 3. Thời gian giao dịch:
        </div>
        <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
          <div style={{ fontStyle: 'italic', marginBottom: '3px' }}>
            Buổi sáng: {terms.deliveryTime.morning}
          </div>
          <div style={{ fontStyle: 'italic' }}>
            Buổi chiều: {terms.deliveryTime.afternoon}
          </div>
        </div>
      </div>

      {/* ĐIỀU 4: NHỮNG CAM KẾT CHUNG */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Điều 4. Những cam kết chung
        </div>
        <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
          {terms.commitments.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '5px' }}>
              {idx + 1}. {item}
            </div>
          ))}
        </div>
      </div>

      {/* ĐIỀU 5: QUYỀN BÁN LẠI VÀ GIÁ BÁN LẠI */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Điều 5. Quyền bán lại và giá bán lại
        </div>
        <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
          {terms.ownership.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '5px' }}>
              {idx + 1}. {item}
            </div>
          ))}
          {terms.latePayment.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '5px' }}>
              {idx + terms.ownership.length + 1}. {item}
            </div>
          ))}
        </div>
      </div>

      {/* ĐIỀU 6: HIỆU LỰC THỎA THUẬN */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Điều 6 Hiệu lực thỏa thuận
        </div>
        <div style={{ paddingLeft: '20px', fontSize: '13px' }}>
          {terms.effectiveness.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '5px' }}>
              {idx + 1}. {item}
            </div>
          ))}
        </div>
      </div>

      {/* CHỮ KÝ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px'
      }}>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
            BÊN MUA
          </div>
          <div style={{ fontStyle: 'italic', fontSize: '11px', marginBottom: '70px' }}>
            (Ký, ghi rõ họ tên)
          </div>
        </div>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
            BÊN BÁN
          </div>
          <div style={{ fontStyle: 'italic', fontSize: '11px', marginBottom: '70px' }}>
            (Ký, ghi rõ họ tên)
          </div>
        </div>
      </div>

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