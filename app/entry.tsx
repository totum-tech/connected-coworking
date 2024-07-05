"use client";
import {MantineProvider} from "@mantine/core";

export default function Entry({
   children,
 }: {
  children: React.ReactNode;
}) {
  return (
    <body className="bg-background text-foreground">
      <MantineProvider>
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </MantineProvider>
    </body>
  )
}
