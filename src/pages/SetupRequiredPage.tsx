import { Logo } from '@/components/ui/Logo'

/** Shown instead of the app while the Firebase variables in .env are still empty. */
export function SetupRequiredPage({ missing }: { missing: string[] }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-lg rounded-card border border-line bg-surface p-8 shadow-card sm:p-10">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-medium tracking-tight">
          Connect your Firebase project
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          The app can’t start until these values are filled in your{' '}
          <code className="rounded bg-canvas px-1.5 py-0.5 text-sm text-ink">.env</code> file:
        </p>

        <ul className="mt-5 space-y-1.5">
          {missing.map((key) => (
            <li
              key={key}
              className="rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-sm"
            >
              {key}
            </li>
          ))}
        </ul>

        <ol className="mt-8 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-muted marker:text-ink">
          <li>
            Follow{' '}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-sm text-ink">
              docs/FIREBASE_SETUP.md
            </code>{' '}
            to create the project and copy its web config.
          </li>
          <li>
            Paste the values into{' '}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-sm text-ink">.env</code> in the
            project root.
          </li>
          <li>
            Stop and restart{' '}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-sm text-ink">npm run dev</code>.
          </li>
        </ol>
      </div>
    </main>
  )
}
