import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { Toaster } from 'sonner'
import { persistor, store } from './stores/index.jsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import NetworkStatus from '@/components/custom/NetworkStatus.jsx'
import { registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import { SocketProvider } from './contexts/socket-context.jsx'

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider defaultTheme="light" storageKey="katec-ui-theme">
            <Router>
              <App />
            </Router>

            <NetworkStatus />
            <Toaster
              closeButton
              expand={true}
              richColors
              position="top-right"
            />
          </ThemeProvider>
        </PersistGate>
      </SocketProvider>
    </Provider>
  </React.StrictMode>,
)
