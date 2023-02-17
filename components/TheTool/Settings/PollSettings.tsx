import { ChevronDownIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { MINUTES, DAYS, HOURS, MONTHS, WEEKS } from '../../../constants'

export type EndAtPeriod = typeof MINUTES | typeof HOURS | typeof DAYS | typeof WEEKS | typeof MONTHS

export interface AnswerOptionType {
  answer: string
  serial: number
}

export interface PollSettingsType {
  description: string
  question: string
  options: AnswerOptionType[]
  endAt: {
    amount: number
    period: EndAtPeriod
  }
}

interface PollSettingsProps {
  disabled: boolean
  defaultSettings?: PollSettingsType
  callback: (_payload: PollSettingsType) => void
}

export const INIT_POLL_SETTINGS: PollSettingsType = {
  description: '',
  question: '',
  options: [
    {
      serial: 1,
      answer: '',
    },
  ],
  endAt: {
    amount: 0,
    period: HOURS,
  },
}

const PollSettings = (props: PollSettingsProps) => {
  const { disabled, defaultSettings, callback } = props

  const [pollSettings, setPollSettings] = useState<PollSettingsType>(defaultSettings || INIT_POLL_SETTINGS)
  const [openPeriodSelection, setOpenPeriodSelection] = useState(false)

  useEffect(() => {
    callback(pollSettings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollSettings])

  return (
    <div className='w-full mb-4'>
      <h3 className={'text-lg ' + (disabled ? 'text-gray-700' : '')}>Step 1 - Poll configuration</h3>

      <textarea
        placeholder='Description (optional)'
        disabled={disabled}
        value={pollSettings.description}
        onChange={(e) =>
          setPollSettings((prev) => {
            const payload = { ...prev }

            payload.description = e.target.value

            return payload
          })
        }
        className='w-full my-0.5 p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
      />

      <div className={(disabled ? 'bg-gray-800 ' : 'bg-gray-400 ') + 'w-3/4 h-0.5 my-4 mx-auto rounded-full'} />

      <input
        placeholder='Question'
        disabled={disabled}
        value={pollSettings.question}
        onChange={(e) =>
          setPollSettings((prev) => {
            const payload = { ...prev }

            payload.question = e.target.value

            return payload
          })
        }
        className='w-full my-0.5 p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
      />

      {pollSettings.options.map(({ serial, answer }, idx) => (
        <div key={`option-${idx}-${pollSettings.options.length}`} className='flex items-center'>
          <input
            placeholder={`Option #${serial}`}
            disabled={disabled}
            value={answer}
            onChange={(e) =>
              setPollSettings((prev) => {
                const v = e.target.value
                const arr = [...prev.options]
                arr[idx].answer = v

                return {
                  ...prev,
                  options: arr,
                }
              })
            }
            className='w-full my-0.5 p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
          />

          {pollSettings.options.length > 1 ? (
            <button
              onClick={() => {
                setPollSettings((prev) => {
                  return {
                    ...prev,
                    options: [...prev.options].filter((obj) => obj.serial !== serial),
                  }
                })
              }}
              className={
                'w-8 h-8 p-1.5 ml-1 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200 ' +
                (disabled ? 'hidden' : '')
              }
            >
              <TrashIcon />
            </button>
          ) : null}
        </div>
      ))}

      <button
        type='button'
        disabled={disabled}
        onClick={() =>
          setPollSettings((prev) => {
            return {
              ...prev,
              options: [
                ...prev.options,
                {
                  serial: prev.options.length + 1,
                  answer: '',
                },
              ],
            }
          })
        }
        className='w-fit my-1 p-3 flex items-center justify-between disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-lg bg-gray-900 hover:bg-gray-700 text-sm hover:text-white border border-gray-700 hover:border-gray-500'
      >
        <PlusCircleIcon className='w-6 h-6 mr-2' />
        Add another option
      </button>

      <div className={(disabled ? 'bg-gray-800 ' : 'bg-gray-400 ') + 'w-3/4 h-0.5 my-4 mx-auto rounded-full'} />

      <h6 className={'text-sm ' + (disabled ? 'text-gray-700' : '')}>When should the poll end?</h6>

      <div className='flex my-0.5'>
        <label className='w-[30%] mr-1'>
          <input
            placeholder='0'
            disabled={disabled}
            value={pollSettings.endAt.amount || ''}
            onChange={(e) =>
              setPollSettings((prev) => {
                const v = Number(e.target.value)

                if (isNaN(v) || v < 0) {
                  return prev
                }

                return {
                  ...prev,
                  endAt: {
                    ...prev.endAt,
                    amount: v,
                  },
                }
              })
            }
            className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
          />
        </label>

        <div className='w-full ml-1 relative'>
          <button
            type='button'
            disabled={disabled}
            onClick={() => setOpenPeriodSelection((prev) => !prev)}
            className='w-full p-3 flex items-center justify-between disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-lg bg-gray-900 hover:bg-gray-700 text-sm hover:text-white border border-gray-700 hover:border-gray-500'
          >
            <span>{!!pollSettings.endAt.period ? `Period: ${pollSettings.endAt.period}` : 'Select a Period'}</span>
            <ChevronDownIcon className={(openPeriodSelection ? 'rotate-180' : 'rotate-0') + ' ml-1 w-4 h-4'} />
          </button>

          <div
            className={
              (openPeriodSelection ? 'flex ' : 'hidden ') +
              (disabled ? 'bg-gray-900 bg-opacity-50 border-gray-800 text-gray-700' : '') +
              ' flex-col max-h-56 overflow-y-auto absolute top-14 z-20 w-full p-3 rounded-lg bg-gray-900 border border-gray-700'
            }
          >
            {[MINUTES, HOURS, DAYS, WEEKS, MONTHS].map((val) => (
              <button
                key={`period-${val}`}
                type='button'
                disabled={disabled}
                onClick={() => {
                  setPollSettings((prev) => {
                    return {
                      ...prev,
                      endAt: {
                        ...prev.endAt,
                        period: val as EndAtPeriod,
                      },
                    }
                  })
                  setOpenPeriodSelection(false)
                }}
                className={
                  'w-full py-1 rounded-xl truncate text-sm text-start ' +
                  (disabled ? '' : 'hover:text-white ') +
                  (!disabled && pollSettings.endAt.period === val ? 'text-white' : '')
                }
              >
                <span>{val}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PollSettings
