import Link from 'next/link'
import { firestore } from '../../utils/firebase'
import PollListItem from '../../components/polls/PollListItem'
import { POLLS_DB_PATH } from '../../constants'
import { Poll } from '../../@types'
import '../../styles/sdk.css'

const Page = async ({ searchParams: { stake_key: stakeKey } }: { searchParams: { stake_key?: string } }) => {
  let polls: Poll[] = []

  if (stakeKey) {
    const now = Date.now()
    const collection = firestore.collection(POLLS_DB_PATH)
    const collectionQuery = await collection.where('stakeKey', '==', stakeKey).get()

    polls = collectionQuery.docs
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
  }

  if (!stakeKey) {
    return (
      <p className='text-sm text-center text-gray-400'>
        Dev error: no stake key provided
        <br />
        {'new BadPollSDK().start({ stakeKey: "stake1..." })'}
      </p>
    )
  }

  if (!polls.length) {
    return (
      <Link href='https://poll.badfoxmc.com/tool' target='_blank' rel='noopener noreferrer'>
        <p className='text-sm text-center text-gray-400 hover:text-gray-200'>
          No polls yet for this stake key...
          <br />
          {stakeKey}
          <br />
          Click here to create your 1st poll
        </p>
      </Link>
    )
  }

  return polls.map((poll) => (
    <PollListItem
      key={`poll-${poll.id}`}
      navToPage={`/sdk/${poll.id}?stake_key=${stakeKey}`}
      active={poll.active}
      endAt={poll.endAt}
      question={poll.question}
      allowPublicView={poll.allowPublicView}
      className='m-1 p-4 text-sm text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-xl border hover:border border-gray-700 hover:border-gray-500 select-none cursor-pointer'
    />
  ))
}

export default Page
