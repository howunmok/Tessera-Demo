import { Outlet, ScrollRestoration } from 'react-router'

export function RootLayout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
