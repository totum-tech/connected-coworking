import { GeistSans } from "geist/font/sans";
import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import Entry from "@/app/entry";
import {ColorSchemeScript} from "@mantine/core";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Connected Coworking",
  description: "Member portal for Connected Coworking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <Entry children={children} />
    </html>
  );
}
