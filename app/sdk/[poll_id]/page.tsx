import fetchPoll from '../../../functions/fetchPoll'
import BackButton from '../../../components/sdk/BackButton'
import VotePollWrappedForSDK from '../../../components/polls/VotePollWrappedForSDK'
import '../../../styles/sdk.css'

const Page = async ({
  params: { poll_id: pollId },
  searchParams: { voter_stake_key: voterStakeKey },
}: {
  params: { poll_id?: string }
  searchParams: { voter_stake_key?: string }
}) => {
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
