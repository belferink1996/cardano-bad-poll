import Link from 'next/link'
import axios from 'axios'
import { firestore } from '../../utils/firebase'
import PollListItem from '../../components/polls/PollListItem'
import { POLLS_DB_PATH } from '../../constants'
import { Poll } from '../../@types'
import '../../styles/sdk.css'

const baseUrl = 'https://poll.badfoxmc.com'

const Page = async ({
  searchParams: { creator_stake_key: creatorStakeKey, voter_stake_key: voterStakeKey },
}: {
  searchParams: { creator_stake_key?: string; voter_stake_key?: string }
}) => {
  if (!creatorStakeKey || !voterStakeKey) {
    return <p className='text-sm text-center'>Dev error: stake key(s) not provided</p>
  }

  try {
    await axios.get(`${baseUrl}/api/wallet/${creatorStakeKey}`)
  } catch (error) {
    return (
      <p className='text-sm text-center'>
        Dev error: creator stake key invalid
        <br />
        {creatorStakeKey}
      </p>
    )
  }

  try {
    await axios.get(`${baseUrl}/api/wallet/${voterStakeKey}`)
  } catch (error) {
    return (
      <p className='text-sm text-center'>
        Dev error: voter stake key invalid
        <br />
        {voterStakeKey}
      </p>
    )
  }

  const now = Date.now()
  const collection = firestore.collection(POLLS_DB_PATH)
  const collectionQuery = await collection.where('stakeKey', '==', creatorStakeKey).get()

  const polls = collectionQuery.docs
    .map((doc) => {
      const data = doc.data() as Poll

      return {
        ...data,
        active: now < data.endAt,
        id: doc.id,
      }
    })
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
    .sort((a, b) => (!a.active ? b.endAt - a.endAt : a.endAt - b.endAt))

  if (!polls.length) {
    return (
      <Link href={`${baseUrl}/tool`} target='_blank' rel='noopener noreferrer'>
        <p className='text-sm text-center hover:text-gray-200'>
          No polls yet for this stake key...
          <br />
          {creatorStakeKey}
          <br />
          Click here to create your 1st poll
        </p>
      </Link>
    )
  }

  return polls.map((poll) => (
    <PollListItem
      key={`poll-${poll.id}`}
      navToPage={`/sdk/${poll.id}?voter_stake_key=${voterStakeKey}`}
      active={poll.active}
      endAt={poll.endAt}
      question={poll.question}
      allowPublicView={poll.allowPublicView}
      className='m-1 p-4 text-sm hover:text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-xl border hover:border border-gray-700 hover:border-gray-500 select-none cursor-pointer'
    />
  ))
}

export default Page
