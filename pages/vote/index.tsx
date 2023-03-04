import type { NextPage } from 'next'
import { useMemo } from 'react'
import { firestore } from '../../utils/firebase'
import { Poll } from '../../@types'
import { POLLS_DB_PATH } from '../../constants'
import PollListItem from '../../components/polls/PollListItem'

export const getServerSideProps = async (ctx: any) => {
  const now = Date.now()
  const collection = firestore.collection(POLLS_DB_PATH)
  const collectionQuery = await collection
    // .where('allowPublicView', '==', true)
    // .where('endAt', '>', now)
    .get()

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

  return { props: { polls } }
}

const Page: NextPage = (props: { polls?: Poll[] }) => {
  const polls = useMemo(() => props.polls || [], [props.polls])

  return (
    <div className='flex flex-col items-center'>
      {!polls.length
        ? 'No polls...'
        : polls.map((poll) => (
            <PollListItem
              key={`poll-${poll.id}`}
              navToPage={`vote/${poll.id}`}
              active={poll.active}
              endAt={poll.endAt}
              question={poll.question}
              allowPublicView={poll.allowPublicView}
              className='m-1 p-4 text-sm bg-gray-900 bg-opacity-50 hover:bg-opacity-50 rounded-xl border border-gray-700 select-none cursor-pointer hover:bg-gray-700 hover:text-gray-200 hover:border hover:border-gray-500'
            />
          ))}
    </div>
  )
}

export default Page
