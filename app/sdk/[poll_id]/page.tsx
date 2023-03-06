import fetchPoll from '../../../functions/fetchPoll'
import BackButton from '../../../components/sdk/BackButton'
import VotePollWrappedForSDK from '../../../components/polls/VotePollWrappedForSDK'
import '../../../styles/sdk.css'

interface PageProps {
  params?: { poll_id?: string }
  searchParams?: {
    voter_stake_key?: string
  }
}

const Page = async (props: PageProps) => {
  const { params, searchParams } = props
  if (!params || !searchParams) {
    return <p className='text-sm text-center'>Dev error: bad URL</p>
  }

  const { poll_id: pollId } = params
  const { voter_stake_key: voterStakeKey } = searchParams

  if (!voterStakeKey) {
    return <p className='text-sm text-center'>Dev error: stake key not provided</p>
  }

  const poll = pollId ? await fetchPoll(pollId as string, Date.now()) : ''

  return (
    <>
      <BackButton />

      {!poll ? (
        <div className='flex items-center justify-center'>Poll does not exist...</div>
      ) : (
        <VotePollWrappedForSDK poll={poll} voterStakeKey={voterStakeKey} />
      )}
    </>
  )
}

export default Page
