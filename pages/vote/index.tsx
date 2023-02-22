import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { firestore } from '../../utils/firebase'
import { Poll } from '../../@types'
import { POLLS_DB_PATH } from '../../constants'

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
    .sort((a, b) => (b.active ? a.endAt : b.endAt) - (a.active ? b.endAt : a.endAt))
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))

  return { props: { polls } }
}

const Page: NextPage = (props: { polls?: Poll[] }) => {
  const router = useRouter()
  const polls = useMemo(() => props.polls || [], [props.polls])

  return (
    <div className='flex flex-col items-center'>
      {!polls.length
        ? 'No active polls...'
        : polls.map((poll) => (
            <div
              key={`poll-${poll.id}`}
              onClick={() => router.push(`vote/${poll.id}`)}
              className='m-1 p-4 text-sm bg-gray-900 bg-opacity-50 rounded-xl border border-gray-700 select-none cursor-pointer hover:bg-gray-700 hover:text-gray-200 hover:border hover:border-gray-500'
            >
              <p className={(poll.active ? 'text-green-400' : 'text-red-400') + ' mb-1'}>
                {poll.active ? 'Active until:' : 'Ended at:'} {new Date(poll.endAt).toUTCString()}
              </p>
              <p>{poll.allowPublicView ? poll.question : 'CLASSIFIED'}</p>
            </div>
          ))}
    </div>
  )
}

export default Page
