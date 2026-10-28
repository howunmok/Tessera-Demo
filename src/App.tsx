import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router/dom'
import { Toaster } from 'sonner'
import { router } from './router'

export function App() {
  return (
    // "user" turns off transform/layout animations when the OS asks for reduced motion.
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }}
      />
    </MotionConfig>
  )
}
