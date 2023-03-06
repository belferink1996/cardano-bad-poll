'use client'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { Poll } from '../../@types'

const WalletProvider = dynamic(async () => (await import('../../contexts/WalletContext')).WalletProvider, {
  ssr: false,
})

const VotePoll = dynamic(async () => (await import('./VotePoll')).default, {
  ssr: false,
})

const VotePollWrappedForSDK = (props: { poll: Poll; voterStakeKey: string }) => {
  const { poll, voterStakeKey } = props

  return (
    <WalletProvider>
      <Toaster />
      <VotePoll poll={poll} isSdkWrapped sdkVoterStakeKey={voterStakeKey} />
    </WalletProvider>
  )
}

export default VotePollWrappedForSDK
