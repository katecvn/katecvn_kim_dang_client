import { callbackGoogle, getAuthUserRolePermissions } from '@/stores/AuthSlice'
import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

const CallbackGoogle = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleCallbackGoogle = useCallback(async () => {
    try {
      const searchParams = new URLSearchParams(location.search)
      await dispatch(callbackGoogle(searchParams)).unwrap()
      await dispatch(getAuthUserRolePermissions()).unwrap()
      navigate('/dashboard')
    } catch (error) {
      navigate('/')
      console.log('Submit error: ', error)
    }
  }, [dispatch, location.search, navigate])

  useEffect(() => {
    handleCallbackGoogle()
  }, [handleCallbackGoogle])

  return null
}

export default CallbackGoogle
