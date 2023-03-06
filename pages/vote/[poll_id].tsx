import type { NextPage } from 'next'
import fetchPoll from '../../functions/fetchPoll'
import VotePoll from '../../components/polls/VotePoll'
import { Poll } from '../../@types'

export const getServerSideProps = async (ctx: any) => {
  const poll = await fetchPoll(ctx.query.poll_id, Date.now())

  return { props: { poll } }
}

const Page: NextPage = (props: { poll?: Poll | null }) => {
  const { poll } = props

  if (!poll) {
    return <div className='flex items-center justify-center'>Poll does not exist...</div>
  }

  return <VotePoll poll={poll} />
}

export default Page
