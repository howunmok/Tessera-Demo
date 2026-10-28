import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { missingFirebaseEnv } from '@/lib/firebase/config'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')
const root = createRoot(container)

if (missingFirebaseEnv.length > 0) {
  // Firebase isn't configured yet — show setup instructions instead of crashing.
  void import('@/pages/SetupRequiredPage').then(({ SetupRequiredPage }) => {
    root.render(
      <StrictMode>
        <SetupRequiredPage missing={missingFirebaseEnv} />
      </StrictMode>,
    )
  })
} else {
  void import('./App').then(({ App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
}
