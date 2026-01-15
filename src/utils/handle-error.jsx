const handleError = (error) => {
  if (!error.response) {
    return { message: 'Opps!! Đã có vài lỗi xảy ra' }
  }

  const { status, data } = error.response

  switch (status) {
    case 400:
      return {
        message:
          data.message ||
          'Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu đầu vào.',
      }
    case 401:
      return { message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.' }
    case 403:
      return { message: 'Bị cấm. Bạn không có quyền truy cập tài nguyên này.' }
    case 404:
      return { message: 'Không tìm thấy tài nguyên.' }

    case 422: {
      const errorData = data.message
      if (
        errorData &&
        typeof errorData === 'object' &&
        !Array.isArray(errorData)
      ) {
        const firstKey = Object.keys(errorData)[0]
        const firstMessage = errorData[firstKey]
        return {
          message: firstMessage || 'Dữ liệu không hợp lệ.',
        }
      }
      return {
        message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      }
    }

    case 500:
      return { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' }
    default:
      return { message: data.message || 'Đã xảy ra lỗi không xác định.' }
  }
}

export { handleError }
