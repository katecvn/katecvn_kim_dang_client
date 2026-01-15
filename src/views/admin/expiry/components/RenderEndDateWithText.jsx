import { dateFormat } from '@/utils/date-format'
import { isValid, startOfDay } from 'date-fns'

const RenderEndDateWithText = ({ endDateFromApi, stepDate }) => {
  if (!endDateFromApi || !isValid(endDateFromApi)) {
    return <p className="text-muted-foreground">Không có</p>
  }

  const now = startOfDay(new Date())
  const endDate = startOfDay(new Date(endDateFromApi))

  const diffInDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )

  const formattedDate = dateFormat(endDate)

  if (diffInDays === 0) {
    return (
      <p className="text-orange-600">
        {formattedDate}
        <br />
        <span className="text-xs">(Còn lại hôm nay)</span>
      </p>
    )
  }

  if (diffInDays < 0) {
    return (
      <p className="text-red-600">
        {formattedDate}
        <br />
        <span className="text-xs"> (Hết hạn)</span>
      </p>
    )
  }

  if (diffInDays <= stepDate && diffInDays <= 15) {
    return (
      <p className="text-red-600">
        {formattedDate}
        <br />
        <span className="text-xs">(Còn lại {diffInDays} ngày)</span>
      </p>
    )
  }

  if (diffInDays <= stepDate && diffInDays > 15) {
    return (
      <p className="text-yellow-600">
        {formattedDate}
        <br />
        <span className="text-xs">(Còn lại {diffInDays} ngày)</span>
      </p>
    )
  }

  return <p>{formattedDate}</p>
}

export default RenderEndDateWithText
