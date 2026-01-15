import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const nodeEnv = import.meta.env.VITE_NODE_ENV

  const serverURL =
    nodeEnv === 'development'
      ? import.meta.env.VITE_SERVER_URL_DEVELOPMENT
      : import.meta.env.VITE_SERVER_URL_PRODUCTION

  useEffect(() => {
    const socketIo = io(serverURL)
    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [serverURL])

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => {
  return useContext(SocketContext)
}
