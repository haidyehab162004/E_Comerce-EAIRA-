import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const startApp = async () => {
  const { default: App } = await import('./App.jsx')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

let started = false

// يبدأ التطبيق بعد أول إطارين عشان أول رسم للـ splash يبان بسرعة،
// مع fallback بـ setTimeout لو الـ requestAnimationFrame متعطل (تاب في الخلفية مثلاً)
const boot = () => {
  if (started) return
  started = true
  void startApp()
}

requestAnimationFrame(() => {
  requestAnimationFrame(boot)
})
setTimeout(boot, 300)
