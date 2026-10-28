import { useId, type ReactNode } from 'react'

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-7"
    >
      <h2 id={headingId} className="text-base font-semibold tracking-tight">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}
