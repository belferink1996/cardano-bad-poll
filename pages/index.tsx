import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useScreenSize from '../hooks/useScreenSize'

const About = () => {
  return (
    <div className='my-4 mx-2 md:mx-10 max-w-2xl lg:max-w-lg text-gray-300'>
      <h2 className='text-xl mb-4'>About The Tool:</h2>
      <p className='my-4 text-sm'>
        Bad Poll is responsible for governing web3 communities. It weighs the vote of a connected wallet, based on
        it&apos;s held assets.
      </p>
      <p className='my-4 text-sm'>
        The way it does this, is simply by reading the Cardano wallet, and comparing the data with the poll
        creator&apos;s settings.
      </p>

      <Link
        href='/tool'
        className='w-full p-4 block text-center rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700'
      >
        Let&apos;s Do This!
      </Link>
    </div>
  )
}

const Page: NextPage = () => {
  const { screenWidth } = useScreenSize()

  const [logoSize, setLogoSize] = useState(1)
  const [foxSize, setFoxSize] = useState(1)
  const [bikeSize, setBikeSize] = useState(1)

  useEffect(() => {
    setLogoSize((screenWidth / 100) * 30.5)
    setFoxSize((screenWidth / 100) * 25)
    setBikeSize((screenWidth / 100) * 45)
  }, [screenWidth])

  return (
    <div className='px-4 flex flex-col items-center'>
      <div id='home' className='relative w-screen h-[calc(100vh-85px)] md:h-[calc(100vh-95px)]'>
        <div className='absolute z-10'>
          <div className='hidden lg:block animate__animated animate__fadeInRight'>
            <About />
          </div>
        </div>

        <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
          <div className='animate__animated animate__infinite animate__slower animate__pulse'>
            <Image
              src='https://badfoxmc.com/media/logo/white_alpha.png'
              alt='logo'
              priority
              width={logoSize}
              height={logoSize}
              className='drop-shadow-landinglogo'
            />
          </div>
        </div>

        <div className='absolute bottom-0 right-0 md:right-12'>
          <div className='animate__animated animate__fadeInDown'>
            <Image
              src='https://badfoxmc.com/media/landing/tool_fox.png'
              alt='fox'
              priority
              width={foxSize}
              height={foxSize}
            />
          </div>
        </div>

        <div className='absolute bottom-0 left-0'>
          <div className='animate__animated animate__fadeInDown'>
            <Image
              src='https://badfoxmc.com/media/landing/tool_bike.png'
              alt='motorcycle'
              priority
              width={bikeSize}
              height={bikeSize / 1.7647}
            />
          </div>
        </div>
      </div>

      <div className='lg:hidden animate__animated animate__fadeInRight'>
        <About />
      </div>
    </div>
  )
}

export default Page
