import React, { Fragment, useEffect, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import { Poll } from '../../@types'

interface PollViewerProps {
  poll: Poll
  callbackTimerExpired: () => void
}

const PollViewer = (props: PollViewerProps) => {
  const { poll, callbackTimerExpired } = props
  const [pointAllocation, setPointAllocation] = useState<Record<string, number>>({})

  useEffect(() => {
    let totalPoints = 0
    const most = { points: 0, serial: 0 }
    const payload: Record<string, number> = {}

    poll.options.forEach((obj) => {
      const key = `vote_${obj.serial}`
      const points = poll[key] || 0

      if (points > most.points) {
        most.points = points
        most.serial = obj.serial
      }

      payload[key] = points
      totalPoints += points
    })

    Object.entries(payload).forEach(([key, val]) => {
      payload[key] = Math.round((100 / totalPoints) * val)
    })
    payload['winner'] = most.serial

    setPointAllocation(payload)
  }, [poll])

  const timer = useTimer({
    expiryTimestamp: new Date(poll.active ? poll.endAt : 0),
    onExpire: () => callbackTimerExpired(),
  })

  return (
    <div>
      {poll.description ? (
        <p className='w-full mb-2 py-2 px-4 text-xs bg-gray-900 bg-opacity-50 rounded-xl border border-gray-700'>
          {poll.description.split('\n').map((str, idx) => (
            <Fragment key={`str-${idx}-${str}`}>
              {str}
              <br />
            </Fragment>
          ))}
        </p>
      ) : null}

      <div className='w-full py-2 px-4 text-sm bg-gray-900 bg-opacity-50 rounded-xl border border-gray-700'>
        <p className='my-2 mb-2 text-gray-200'>{poll.question}</p>

        {poll.options.map((obj) => (
          <Fragment key={`read-option-${obj.serial}`}>
            <div className='w-full h-0.5 bg-gray-800 rounded-full' />

            <p className='my-2'>
              <span className='text-gray-200 font-bold'>{obj.serial}.</span> {obj.answer}
            </p>

            {poll.active ? null : (
              <div className='w-full h-fit mb-2 bg-gray-700 rounded-full'>
                <div
                  className={
                    'leading-3 rounded-full ' +
                    (pointAllocation.winner === obj.serial ? 'bg-green-800' : 'bg-red-800')
                  }
                  style={{ width: `${pointAllocation[`vote_${obj.serial}`]}%` }}
                >
                  <span className='ml-1 text-[10px] text-gray-200 font-light'>
                    {pointAllocation[`vote_${obj.serial}`]}%
                  </span>
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <table className={'mx-auto mt-2 text-center ' + (poll.active ? 'text-gray-400' : 'text-gray-700')}>
        <tbody>
          <tr className='text-xl'>
            <td>{`${timer.days < 10 ? '0' : ''}${timer.days}`}</td>
            <td>:</td>
            <td>{`${timer.hours < 10 ? '0' : ''}${timer.hours}`}</td>
            <td>:</td>
            <td>{`${timer.minutes < 10 ? '0' : ''}${timer.minutes}`}</td>
            <td>:</td>
            <td>{`${timer.seconds < 10 ? '0' : ''}${timer.seconds}`}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default PollViewer
