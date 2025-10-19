import { Modern_Antiqua } from 'next/font/google'
 
const modernAntiqua = Modern_Antiqua({
  subsets: ['latin'],
  weight: '400',
})
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={modernAntiqua.className}>
      <body>{children}</body>
    </html>
  )
}