import React, { Fragment, useEffect, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import { Poll } from '../../@types'

interface PollViewerProps {
  poll: Poll
  callbackTimerExpired: () => void
}

interface Pointallocation {
  totalPoints: number
  winnerSerialNumber: number
  allocation: {
    [key: string]: {
      points: number
      percent: number
    }
  }
}

const PollViewer = (props: PollViewerProps) => {
  const { poll, callbackTimerExpired } = props
  const [pointAllocation, setPointAllocation] = useState<Pointallocation>({
    totalPoints: 0,
    winnerSerialNumber: 0,
    allocation: {},
  })

  useEffect(() => {
    const most = { points: 0, serial: 0 }
    const payload: Pointallocation = { totalPoints: 0, winnerSerialNumber: 0, allocation: {} }

    poll.options.forEach((obj) => {
      const key = `vote_${obj.serial}`
      const points = poll[key] || 0

      if (points > most.points) {
        most.points = points
        most.serial = obj.serial
      }

      if (!payload.allocation[key]) {
        payload.allocation[key] = { points: 0, percent: 0 }
      }

      payload.allocation[key].points = points
      payload['totalPoints'] += points
    })

    Object.entries(payload.allocation).forEach(([key, obj]) => {
      payload.allocation[key].percent = Math.round((100 / payload['totalPoints']) * obj.points)
    })
    payload['winnerSerialNumber'] = most.serial

    setPointAllocation(payload)
  }, [poll])

  const timer = useTimer({
    expiryTimestamp: new Date(poll.active ? poll.endAt : 0),
    onExpire: () => callbackTimerExpired(),
  })

  return (
    <div>
      {poll.description ? (
        <p className='w-full mb-2 py-2 px-4 text-sm bg-gray-900 bg-opacity-50 rounded-xl border border-gray-700'>
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

        {poll.options.map((obj) => {
          const isActive = poll.active
          const isWinner = pointAllocation['winnerSerialNumber'] === obj.serial
          const percentValue = pointAllocation.allocation[`vote_${obj.serial}`]?.percent || 0
          const pointValue = pointAllocation.allocation[`vote_${obj.serial}`]?.points || 0

          return (
            <Fragment key={`read-option-${obj.serial}`}>
              <div className='w-full h-0.5 my-2 bg-gray-800 rounded-full' />

              <p className={isActive ? '' : isWinner ? 'text-green-200 font-bold' : 'text-red-200'}>
                <span className='text-gray-200 font-bold'>{obj.serial}.</span> {obj.answer}
              </p>

              {isActive ? null : (
                <div className='w-full h-fit bg-transparent rounded-full'>
                  <div
                    className={
                      'leading-4 rounded-full bg-opacity-50 ' + (isWinner ? 'bg-green-600' : 'bg-red-600')
                    }
                    style={{ width: `${percentValue}%` }}
                  >
                    <span
                      className={
                        'ml-2 whitespace-nowrap text-[11px] ' + (isWinner ? 'text-green-200' : 'text-red-200')
                      }
                    >
                      {percentValue}%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;({pointValue}&nbsp;/&nbsp;
                      {pointAllocation.totalPoints}&nbsp;points)
                    </span>
                  </div>
                </div>
              )}
            </Fragment>
          )
        })}
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
