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
        {children}
      </MantineProvider>
    </body>
  )
}
