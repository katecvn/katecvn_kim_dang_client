import { useLocation } from 'react-router-dom'

const useCheckActiveNav = () => {
  const { pathname } = useLocation()

  const checkActiveNav = (nav) => {
    const pathArray = pathname.split('/').filter((item) => item !== '')

    if (nav === '/' && pathArray.length < 1) return true

    return pathArray.includes(nav.replace(/^\//, ''))
  }

  return { checkActiveNav }
}

export default useCheckActiveNav
