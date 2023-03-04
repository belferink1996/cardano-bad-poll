import '../../../styles/sdk.css'

const Page = async ({ params: { poll_id: pollId } }: { params: { poll_id?: string } }) => {
  console.log('pollId', pollId)

  return <div />
}

export default Page
