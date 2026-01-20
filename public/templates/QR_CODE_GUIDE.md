# Hướng dẫn thêm QR Code vào Word Template

## Placeholder cho QR Code

Trong Word template, thêm placeholder cho QR code:

```
{%qr_code}
```

**Lưu ý:** Sử dụng `{%qr_code}` (có dấu `%`) thay vì `{qr_code}` để docxtemplater biết đây là image placeholder.

## Vị trí đặt QR Code

Bạn có thể đặt QR code ở bất kỳ đâu trong template, ví dụ:

### Option 1: Góc trên bên phải (header)
```
KIM ĐẶNG                                    {%qr_code}
DIAMOND JEWELRY
```

### Option 2: Cuối trang (footer)
```
BÊN MUA                    BÊN BÁN
(Ký, ghi rõ họ tên)        (Ký, ghi rõ họ tên)

                {%qr_code}
```

### Option 3: Bên cạnh thông tin hợp đồng
```
Số: {contract_no}          {%qr_code}
```

## Thông tin trong QR Code

QR code sẽ chứa các thông tin sau (dạng JSON):

```json
{
  "contractNo": "HĐTC-2025-001",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0123456789",
  "customerId": "001234567890",
  "date": "2026-01-20",
  "itemCount": 3,
  "totalAmount": 50000000
}
```

## Kích thước QR Code

Mặc định: 150x150 pixels (khoảng 4cm x 4cm khi in)

Nếu muốn thay đổi kích thước, sửa trong file `ExportInstallmentWord.js`:

```javascript
getSize: () => {
  return [200, 200] // Thay đổi kích thước tại đây
}
```

## Test QR Code

Sau khi export Word document:
1. Mở file Word
2. QR code sẽ hiển thị tại vị trí placeholder
3. Scan QR code bằng điện thoại để kiểm tra thông tin

## Troubleshooting

**Lỗi: "QR code not showing"**
- Kiểm tra placeholder có đúng format `{%qr_code}` không
- Kiểm tra đã cài đặt `docxtemplater-image-module-free`

**Lỗi: "Image too large"**
- Giảm kích thước trong `getSize()`
- Hoặc giảm `width` trong `QRCode.toDataURL()`
