import api from '@/utils/axios'

// Lấy cấu hình allowed storage size
const handleGetStorageSizeSetting = async (school_id) => {
  try {
    const res = await api.get(
      `/setting/${school_id}/allowed-storage-size-settings`,
    )
    return res?.data
  } catch (error) {
    console.log('Get storage size setting error:', error)
    return null
  }
}

// Lấy dung lượng đã dùng Kcloud, Kafood cloud
const handleGetUsedStorageSize = async (school_id) => {
  try {
    const res = await api.get('/setting/get-used-storage-size', {
      params: { project: 'kafood', schoolId: school_id },
    })
    return res?.data
  } catch (error) {
    console.log('Get used storage size error:', error)
    return null
  }
}

const handleGetUsedGCStorageSize = async (school_id) => {
  try {
    const res = await api.get('/setting/get-gcs-used-storage-size', {
      params: { schoolId: school_id },
    })
    return res?.data
  } catch (error) {
    console.log('Get used storage size error:', error)
    return null
  }
}

const handleGetUsedDriveStorageSize = async (school_id) => {
  try {
    const res = await api.get('/setting/get-drive-used-storage-size', {
      params: { schoolId: school_id },
    })
    return res?.data
  } catch (error) {
    console.log('Get used storage size error:', error)
    return null
  }
}

export {
  handleGetStorageSizeSetting,
  handleGetUsedStorageSize,
  handleGetUsedGCStorageSize,
  handleGetUsedDriveStorageSize,
}
