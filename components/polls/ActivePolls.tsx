import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { firestore } from '../../utils/firebase'
import { FetchedTimestampResponse } from '../../pages/api/timestamp'
import { Poll } from '../../@types'
import { POLLS_DB_PATH } from '../../constants'

const ActivePolls = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])

  const getAndSetPolls = useCallback(async () => {
    setLoading(true)

    try {
      const {
        data: { now },
      } = await axios.get<FetchedTimestampResponse>(`/api/timestamp`)

      const collection = firestore.collection(POLLS_DB_PATH)
      const collectionQuery = await collection.where('endAt', '>', now).get()

      const payload = collectionQuery.docs
        .map((doc) => {
          const data = doc.data() as Poll

          return {
            ...data,
            active: now < data.endAt,
            id: doc.id,
          }
        })
        .sort((a, b) => a.endAt - b.endAt)

      setPolls(payload)
    } catch (error: any) {
      console.error(error)
    }

    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getAndSetPolls()
  }, [getAndSetPolls])

  return (
    <div className='flex flex-col items-center'>
      {loading
        ? 'Loading...'
        : polls.length
        ? polls.map((poll) => (
            <div
              key={`poll-${poll.id}`}
              onClick={() => router.push(`vote/${poll.id}`)}
              className='m-1 p-4 text-sm bg-gray-900 bg-opacity-50 rounded-xl border border-gray-700 select-none cursor-pointer hover:bg-gray-700 hover:text-gray-200 hover:border hover:border-gray-500'
            >
              <p className={(poll.active ? 'text-green-400' : 'text-red-400') + ' mb-1'}>
                {poll.active ? 'Active until:' : 'Ended at:'} {new Date(poll.endAt).toLocaleString()}
              </p>
              <p>{poll.question}</p>
            </div>
          ))
        : 'No active polls...'}
    </div>
  )
}

export default ActivePolls
