In Node.js applications (particularly with Next.js App Router or similar frameworks), `"use server"` and `"use client"` are directives that tell the bundler where your code should run.

## What is "use server"?

`"use server"` marks functions that should **only** execute on the server. These functions become endpoints that the client can call, but the actual code never gets sent to the browser. Think of it like creating a mini API endpoint right inside your component file.

Here's a simple example:

```javascript
// This function only runs on the server
async function submitForm(formData) {
  "use server"
  
  // You can do things here that should stay secret
  // like database calls or using API keys
  const secretApiKey = process.env.SECRET_KEY
  await saveToDatabase(formData)
}

// This component might run on client or server
export default function MyForm() {
  return (
    <form action={submitForm}>
      <input name="email" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

When someone submits this form, the browser makes a request to the server to run `submitForm`. The browser never sees the database code or the secret key.

## For Server-Side Rendered Pages

For SSR pages, you actually **don't need either directive** by default. Here's how it works:

1. **No directive = Server Component** (in Next.js App Router)
   - The component runs on the server
   - It can fetch data directly
   - It can't use browser APIs or React hooks like `useState`

2. **"use client" = Client Component**
   - The component runs in the browser
   - It can use hooks and browser APIs
   - It gets hydrated after the initial HTML loads

3. **"use server" = Server Actions**
   - Used for specific functions, not whole components
   - These functions can be called from client components
   - They always execute on the server

So for a basic SSR page:

```javascript
// app/page.js - No directive needed!
// This is a Server Component by default
export default async function Page() {
  // You can fetch data right here
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()
  
  return (
    <div>
      <h1>{json.title}</h1>
      <p>{json.description}</p>
    </div>
  )
}
```

If you need interactivity, you'd create a separate client component:

```javascript
// app/interactive-button.js
"use client"  // This component needs to run in the browser

import { useState } from 'react'

export default function InteractiveButton() {
  const [clicked, setClicked] = useState(false)
  
  return (
    <button onClick={() => setClicked(true)}>
      {clicked ? 'Clicked!' : 'Click me'}
    </button>
  )
}
```

Then use it in your server component:

```javascript
// app/page.js - Still no directive
import InteractiveButton from './interactive-button'

export default function Page() {
  return (
    <div>
      <h1>My Server-Rendered Page</h1>
      <InteractiveButton />  {/* This part becomes interactive */}
    </div>
  )
}
```

The key insight: Server Components (no directive) are the default because they're the most efficient - they send less JavaScript to the browser. You only add `"use client"` when you need browser features, and `"use server"` when you're creating server-only functions that client components can call.