import { Button } from '@/components/custom/Button'
import { useNavigate } from 'react-router-dom'

const ErrorPage = ({
  code = 404,
  message = 'Opps! Không tìm thấy trang',
  description = 'Có vẻ như trang bạn đang tìm kiếm không tồn tại',
}) => {
  const navigate = useNavigate()

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">{code}</h1>
        <span className="font-medium">{message}</span>
        <p className="text-center text-muted-foreground">{description}</p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Trở về
          </Button>
          <Button onClick={() => navigate('/dashboard')}>Về trang chủ</Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
