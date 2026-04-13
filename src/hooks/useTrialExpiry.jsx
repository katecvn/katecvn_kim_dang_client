import { useState, useEffect } from 'react'
import { TRIAL_EXPIRY_DATE } from '@/config/trial'

/**
 * Tính thời gian còn lại từ thời điểm hiện tại đến cuối ngày hết hạn
 */
const calcTimeLeft = () => {
  const now = new Date()

  // Hết hạn vào cuối ngày TRIAL_EXPIRY_DATE (23:59:59)
  const expiry = new Date(TRIAL_EXPIRY_DATE)
  expiry.setHours(23, 59, 59, 999)

  const diffMs = expiry - now

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isExpired: false }
}

/**
 * Hook đếm ngược thời gian dùng thử theo giây
 * @returns {{ days, hours, minutes, seconds, isExpired }}
 */
const useTrialExpiry = () => {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return timeLeft
}

export default useTrialExpiry
