"use client";
import { GeistProvider, CssBaseline } from '@geist-ui/core'

export default function Entry({
   children,
 }: {
  children: React.ReactNode;
}) {
  return (
    <GeistProvider>
      <CssBaseline />
        <body className="bg-background text-foreground">
          <main className="min-h-screen flex flex-col items-center">
            {children}
          </main>
        </body>
    </GeistProvider>
  )
}
