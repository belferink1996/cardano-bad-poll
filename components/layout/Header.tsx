import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../Navigation'

const Header = () => {
  return (
    <header className='w-screen py-3 md:py-4 px-2 md:px-2 bg-black bg-opacity-50 flex items-center justify-between sticky top-0 z-40'>
      <div className='flex items-center'>
        <Link href='https://badfoxmc.com' target='_blank' rel='noopener' className='h-16 w-16 mx-3 relative'>
          <Image
            src='https://badfoxmc.com/media/logo/white_alpha.png'
            alt='logo'
            priority
            unoptimized
            fill
            sizes='5rem'
            className='object-contain rounded-full'
          />
        </Link>
        <h1 className='text-white text-xl'>
          Bad Poll 🗳️
          <br />
          <span className='text-base'>Developed by Bad Fox MC</span>
        </h1>
      </div>

      <Navigation />
    </header>
  )
}

export default Header
