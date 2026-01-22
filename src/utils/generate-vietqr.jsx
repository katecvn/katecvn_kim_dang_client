import QRCode from 'qrcode'

// Generate VietQR code for bank transfer
export const generateVietQR = async (bankAccount, amount, content) => {
  try {
    // Create VietQR data object
    // Most Vietnamese banking apps support this JSON format
    const qrData = {
      bankCode: bankAccount.bankCode || '',
      accountNo: bankAccount.accountNumber || '',
      accountName: bankAccount.accountName || '',
      amount: amount || 0,
      addInfo: content || '',
      format: 'text',
      template: 'compact'
    }

    // Convert to JSON string
    const qrString = JSON.stringify(qrData)

    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })

    return dataUrl
  } catch (error) {
    console.error('VietQR generation error:', error)
    return null
  }
}

// Download QR code as PNG image
export const downloadQRCode = (dataUrl, filename = 'vietqr-payment.png') => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Copy payment information to clipboard
export const copyPaymentInfo = async (bankAccount, amount, content) => {
  const paymentInfo = `
Ngân hàng: ${bankAccount.bankName || ''}
Số tài khoản: ${bankAccount.accountNumber || ''}
Chủ tài khoản: ${bankAccount.accountName || ''}
Chi nhánh: ${bankAccount.bankBranch || ''}
Số tiền: ${amount.toLocaleString('vi-VN')} VNĐ
Nội dung: ${content || ''}
  `.trim()

  try {
    await navigator.clipboard.writeText(paymentInfo)
    return true
  } catch (error) {
    console.error('Copy to clipboard error:', error)
    return false
  }
}

// Format bank account number for display (mask middle digits)
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 6) return accountNumber
  const start = accountNumber.slice(0, 3)
  const end = accountNumber.slice(-3)
  const middle = '*'.repeat(accountNumber.length - 6)
  return `${start}${middle}${end}
`
}
