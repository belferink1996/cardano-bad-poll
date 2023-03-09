import CloseButton from '../components/sdk/CloseButton'
import PoweredBy from '../components/sdk/PoweredBy'
import '../styles/sdk.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head />
      <body>
        <main className='overflow-auto relative w-screen h-screen p-4 flex flex-col items-center bg-gray-900'>
          <CloseButton />
          <PoweredBy />

          {children}
        </main>
      </body>
    </html>
  )
}
