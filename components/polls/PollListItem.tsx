'use client'
import { useRouter } from 'next/navigation'

interface PollListItemProps {
  navToPage?: string
  onClick?: () => void
  active: boolean
  endAt: number
  question: string
  allowPublicView: boolean
  className: string
}

const PollListItem = (props: PollListItemProps) => {
  const { navToPage, onClick, active, endAt, question, allowPublicView, className = '' } = props
  const router = useRouter()

  return (
    <div
      onClick={() => {
        if (onClick) {
          onClick()
        } else if (navToPage) {
          router.push(navToPage)
        }
      }}
      className={className}
    >
      <p className={(active ? 'text-green-400' : 'text-red-400') + ' mb-1'}>
        {active ? 'Active until:' : 'Ended at:'} {new Date(endAt).toUTCString()}
      </p>
      <p>{allowPublicView ? question : 'CLASSIFIED'}</p>
    </div>
  )
}

export default PollListItem
