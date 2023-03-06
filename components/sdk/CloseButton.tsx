'use client'
import { XMarkIcon } from '@heroicons/react/24/solid'

const CloseButton = () => {
  return (
    <button
      onClick={() => window.parent?.postMessage('bad-poll-close', '*')}
      className='w-6 h-6 p-0.5 rounded-full bg-gray-400 hover:bg-gray-300 text-gray-800 flex items-center justify-center absolute top-4 right-4'
    >
      <XMarkIcon />
    </button>
  )
}

export default CloseButton
