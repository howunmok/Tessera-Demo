import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { PageLoader } from '@/components/ui/PageLoader'
import { ROUTER_BASENAME } from '@/config/app'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

/** Code-split a route: its component is downloaded the first time the route matches. */
function lazyComponent(load: () => Promise<ComponentType>) {
  return async () => ({ Component: await load() })
}

export const router = createBrowserRouter(
  [
    {
      Component: RootLayout,
      ErrorBoundary: RouteErrorPage,
      HydrateFallback: PageLoader,
      children: [
        {
          // Everything that needs Firebase Auth lives under this layout.
          lazy: lazyComponent(() => import('@/components/layout/AuthRoot').then((m) => m.AuthRoot)),
          children: [
            {
              index: true,
              lazy: lazyComponent(() => import('@/pages/LandingPage').then((m) => m.LandingPage)),
            },
            {
              lazy: lazyComponent(() =>
                import('@/components/layout/RouteGuards').then((m) => m.GuestOnly),
              ),
              children: [
                {
                  path: 'signin',
                  lazy: lazyComponent(() =>
                    import('@/pages/auth/SignInPage').then((m) => m.SignInPage),
                  ),
                },
                {
                  path: 'signup',
                  lazy: lazyComponent(() =>
                    import('@/pages/auth/SignUpPage').then((m) => m.SignUpPage),
                  ),
                },
                {
                  path: 'reset-password',
                  lazy: lazyComponent(() =>
                    import('@/pages/auth/ResetPasswordPage').then((m) => m.ResetPasswordPage),
                  ),
                },
              ],
            },
            {
              lazy: lazyComponent(() =>
                import('@/components/layout/RouteGuards').then((m) => m.RequireAuth),
              ),
              children: [
                {
                  lazy: lazyComponent(() =>
                    import('@/components/layout/AppShell').then((m) => m.AppShell),
                  ),
                  children: [
                    {
                      path: 'dashboard',
                      lazy: lazyComponent(() =>
                        import('@/pages/DashboardPage').then((m) => m.DashboardPage),
                      ),
                    },
                    {
                      path: 'dashboard/cards/:cardId',
                      lazy: lazyComponent(() =>
                        import('@/pages/EditorPage').then((m) => m.EditorPage),
                      ),
                    },
                    {
                      path: 'dashboard/cards/:cardId/print',
                      lazy: lazyComponent(() =>
                        import('@/pages/PrintPage').then((m) => m.PrintPage),
                      ),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          // Public card pages don't load Firebase Auth.
          path: 'c/:slug',
          lazy: lazyComponent(() => import('@/pages/PublicCardPage').then((m) => m.PublicCardPage)),
        },
        {
          path: '*',
          lazy: lazyComponent(() => import('@/pages/NotFoundPage').then((m) => m.NotFoundPage)),
        },
      ],
    },
  ],
  { basename: ROUTER_BASENAME },
)
