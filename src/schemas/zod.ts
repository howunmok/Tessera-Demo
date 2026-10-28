import { z } from 'zod'

// No runtime code generation (`new Function`): the Content Security Policy forbids it, and
// zod's probe for it would otherwise be reported as a violation.
z.config({ jitless: true })

export { z }
