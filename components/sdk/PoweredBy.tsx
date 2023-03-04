import Image from 'next/image'
import Link from 'next/link'

const PoweredBy = () => {
  return (
    <Link
      href='https://badfoxmc.com'
      target='_blank'
      rel='noopener noreferrer'
      className='w-16 h-20 mb-4 flex items-center justify-center'
    >
      <Image
        src='https://badfoxmc.com/media/logo/white_alpha.png'
        alt='Bad Fox Motorcycle Club - logo'
        width={42}
        height={42}
      />

      <h5 className='ml-2 text-sm text-center text-gray-200'>
        Powered by
        <br />
        @BadFoxMC
      </h5>
    </Link>
  )
}

export default PoweredBy
