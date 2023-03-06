import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { firestore } from '../../utils/firebase'
import Modal from '../layout/Modal'
import PollViewer from './PollViewer'
import PollListItem from './PollListItem'
import { FetchedTimestampResponse } from '../../pages/api/timestamp'
import { POLLS_DB_PATH } from '../../constants'
import { Poll } from '../../@types'

interface PastPollsProps {
  stakeKey: string
  addTranscript: (msg: string, key?: string) => void
}

const PastPolls = (props: PastPollsProps) => {
  const { stakeKey, addTranscript } = props

  const [loading, setLoading] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)

  const getAndSetPolls = useCallback(async () => {
    setLoading(true)

    try {
      const collection = firestore.collection(POLLS_DB_PATH)
      const collectionQuery = await collection.where('stakeKey', '==', stakeKey).get()

      const {
        data: { now },
      } = await axios.get<FetchedTimestampResponse>(`/api/timestamp`)

      const payload = collectionQuery.docs
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

      setPolls(payload)
    } catch (error: any) {
      console.error(error)
      addTranscript('ERROR!', error.message)
    }

    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getAndSetPolls()
  }, [getAndSetPolls])

  const [isCopied, setIsCopied] = useState(false)

  const clickCopy = useCallback(
    (val: string) => {
      if (!isCopied) {
        setIsCopied(true)
        navigator.clipboard.writeText(val)
        setTimeout(() => {
          setIsCopied(false)
        }, 1000)
      }
    },
    [isCopied]
  )

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {polls.length
        ? polls.map((poll) => (
            <PollListItem
              key={`poll-${poll.id}`}
              onClick={() => setSelectedPoll(poll)}
              active={poll.active}
              endAt={poll.endAt}
              question={poll.question}
              allowPublicView={poll.allowPublicView}
              className='m-1 p-4 text-sm bg-gray-900 bg-opacity-50 hover:bg-opacity-50 rounded-xl border border-gray-700 select-none cursor-pointer hover:bg-gray-700 hover:text-gray-200 hover:border hover:border-gray-500'
            />
          ))
        : 'No previous polls... click the above ☝️ to create your first'}

      <Modal title={`Poll: ${selectedPoll?.id}`} open={!!selectedPoll} onClose={() => setSelectedPoll(null)}>
        {selectedPoll ? (
          <div className='w-[555px] flex flex-col'>
            <PollViewer
              poll={selectedPoll}
              callbackTimerExpired={() => {
                setSelectedPoll((prev) => ({ ...(prev as Poll), active: false }))
                getAndSetPolls()
              }}
            />

            <button
              type='button'
              onClick={() => clickCopy(`${window.location.origin}/vote/${selectedPoll.id}`)}
              className='grow m-1 mt-2 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700 hover:cursor-pointer'
            >
              {isCopied ? 'Copied 👍' : 'Copy Poll URL'}
            </button>
          </div>
        ) : (
          <div />
        )}
      </Modal>
    </div>
  )
}

export default PastPolls
