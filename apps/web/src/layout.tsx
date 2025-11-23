import '../styles/globals.css'
import Theme from './theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactElement;
}>) {
  return (
      <Theme>
        {children}
      </Theme>
  )
}
