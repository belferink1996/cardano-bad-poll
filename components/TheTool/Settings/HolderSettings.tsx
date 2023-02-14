import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'

export interface HolderSettingsType {
  policyId: string
  weight: number
  withTraits: boolean
  traitOptions: {
    category: string
    trait: string
    amount: number
  }[]
  withRanks: boolean
  rankOptions: {
    minRange: number
    maxRange: number
    amount: number
  }[]
}

interface HolderSettingsProps {
  disabled: boolean
  defaultSettings?: HolderSettingsType[]
  callback: (_payload: HolderSettingsType[]) => void
}

export const INIT_TRAIT_REWARDS = {
  category: '',
  trait: '',
  amount: 0,
}

export const INIT_RANK_REWARDS = {
  minRange: 0,
  maxRange: 0,
  amount: 0,
}

export const INIT_HOLDER_SETTINGS: HolderSettingsType = {
  policyId: '',
  weight: 1,
  withTraits: false,
  traitOptions: [{ ...INIT_TRAIT_REWARDS }],
  withRanks: false,
  rankOptions: [{ ...INIT_RANK_REWARDS }],
}

const HolderSettings = (props: HolderSettingsProps) => {
  const { disabled, defaultSettings, callback } = props

  const [holderSettings, setHolderSettings] = useState<HolderSettingsType[]>(
    defaultSettings && defaultSettings.length ? defaultSettings : [{ ...INIT_HOLDER_SETTINGS }]
  )

  useEffect(() => {
    callback(
      holderSettings
        .filter((obj) => !!obj.policyId)
        .map((obj) => ({
          ...obj,
          traitOptions:
            obj.withTraits && obj.traitOptions.length
              ? obj.traitOptions.filter((traitObj) => !!traitObj.category && !!traitObj.trait && !!traitObj.amount)
              : [],
          rankOptions:
            obj.withRanks && obj.rankOptions.length
              ? obj.rankOptions.filter(
                  (traitObj) => !!traitObj.minRange && !!traitObj.maxRange && !!traitObj.amount
                )
              : [],
        }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holderSettings])

  return (
    <div className='w-full'>
      <h3 className={'text-lg ' + (disabled ? 'text-gray-700' : '')}>Step 2 - Who can vote on this poll?</h3>

      {holderSettings.map(({ policyId, weight, withTraits, traitOptions, withRanks, rankOptions }, policyIdx) => (
        <div key={`pid-${policyIdx}-${holderSettings.length}`} className='mb-2'>
          {policyIdx > 0 ? <div className='w-3/4 h-0.5 my-4 mx-auto bg-gray-400 rounded-full' /> : null}

          <div>
            <div className='flex items-center'>
              <input
                placeholder='Policy ID'
                disabled={disabled}
                value={policyId}
                onChange={(e) =>
                  setHolderSettings((prev) => {
                    const payload = [...prev]

                    payload[policyIdx] = {
                      ...payload[policyIdx],
                      policyId: e.target.value,
                    }

                    return payload
                  })
                }
                className='w-full my-0.5 p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
              />
              {holderSettings.length > 1 ? (
                <button
                  onClick={() => {
                    setHolderSettings((prev) => {
                      const payload = [...prev]

                      return payload.filter((obj) => obj.policyId !== policyId)
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

            <div className='flex items-center'>
              <div className='flex items-center'>
                <label className={'mr-2 ml-4 ' + (disabled || !policyId ? 'text-gray-700' : '')}>Points:</label>
                <input
                  disabled={disabled || !policyId}
                  value={String(weight)}
                  onChange={(e) =>
                    setHolderSettings((prev) => {
                      const payload = [...prev]
                      const foundPolicyIdx = payload.findIndex((obj) => obj.policyId === policyId)

                      const v = Number(e.target.value)
                      if (isNaN(v)) return payload

                      payload[foundPolicyIdx] = {
                        ...payload[foundPolicyIdx],
                        weight: v,
                      }

                      return payload
                    })
                  }
                  className='w-20 my-0.5 p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                />
              </div>

              <div className='ml-4 flex flex-wrap items-center'>
                <label
                  className={
                    'mr-4 flex items-center ' +
                    (disabled || !policyId
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'hover:text-white cursor-pointer')
                  }
                >
                  <input
                    type='checkbox'
                    disabled={disabled || !policyId}
                    checked={withTraits}
                    onChange={(e) =>
                      setHolderSettings((prev) => {
                        const payload = [...prev]
                        const foundPolicyIdx = payload.findIndex((obj) => obj.policyId === policyId)

                        payload[foundPolicyIdx] = {
                          ...payload[foundPolicyIdx],
                          withTraits: !withTraits,
                          traitOptions: [{ ...INIT_TRAIT_REWARDS }],
                        }

                        return payload
                      })
                    }
                    className='disabled:opacity-50'
                  />
                  <span className='ml-1 text-sm'>Trait Points</span>
                </label>

                <label
                  className={
                    'mr-4 flex items-center ' +
                    (disabled || !policyId
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'hover:text-white cursor-pointer')
                  }
                >
                  <input
                    type='checkbox'
                    disabled={disabled || !policyId}
                    checked={withRanks}
                    onChange={(e) =>
                      setHolderSettings((prev) => {
                        const payload = [...prev]
                        const foundPolicyIdx = payload.findIndex((obj) => obj.policyId === policyId)

                        payload[foundPolicyIdx] = {
                          ...payload[foundPolicyIdx],
                          withRanks: !withRanks,
                          rankOptions: [{ ...INIT_RANK_REWARDS }],
                        }

                        return payload
                      })
                    }
                    className='disabled:opacity-50'
                  />
                  <span className='ml-1 text-sm'>Rank Points</span>
                </label>
              </div>
            </div>
          </div>

          {withTraits ? (
            <div className='w-full my-2'>
              {traitOptions.map(({ category, trait, amount }, rewardingTraitsIdx) => (
                <div
                  key={`pid-${policyIdx}-${holderSettings.length}-trait-${rewardingTraitsIdx}-${traitOptions.length}`}
                  className='my-1'
                >
                  <div className='flex items-center justify-between'>
                    <label className='w-[29%]'>
                      {rewardingTraitsIdx === 0 ? (
                        <span className={'ml-1 text-xs ' + (disabled || !policyId ? 'text-gray-700' : '')}>
                          Trait Category
                        </span>
                      ) : null}
                      <input
                        placeholder='ex. Eyewear'
                        disabled={disabled}
                        value={category}
                        onChange={(e) =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]
                            const arr = [...traitOptions]

                            arr[rewardingTraitsIdx].category = e.target.value

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              traitOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                      />
                    </label>

                    <label className='w-[29%]'>
                      {rewardingTraitsIdx === 0 ? (
                        <span className={'ml-1 text-xs ' + (disabled || !policyId ? 'text-gray-700' : '')}>
                          Trait Value
                        </span>
                      ) : null}
                      <input
                        placeholder='ex. 3D Glasses'
                        disabled={disabled}
                        value={trait}
                        onChange={(e) =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]
                            const arr = [...traitOptions]

                            arr[rewardingTraitsIdx].trait = e.target.value

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              traitOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                      />
                    </label>

                    <label className='w-[29%]'>
                      {rewardingTraitsIdx === 0 ? (
                        <span className={'ml-1 text-xs ' + (disabled || !policyId ? 'text-gray-700' : '')}>
                          Points
                        </span>
                      ) : null}
                      <input
                        placeholder='ex. 10'
                        disabled={disabled}
                        value={String(amount || '')}
                        onChange={(e) =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]
                            const arr = [...traitOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v)) return prev

                            arr[rewardingTraitsIdx].amount = v

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              traitOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                      />
                    </label>

                    {traitOptions.length > 1 ? (
                      <button
                        onClick={() =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              traitOptions: traitOptions.filter((_item, _idx) => _idx !== policyIdx),
                            }

                            return payload
                          })
                        }
                        className={
                          (rewardingTraitsIdx === 0 ? 'mt-6 ' : '') +
                          'w-8 h-8 p-1.5 ml-1 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200 ' +
                          (disabled ? 'hidden' : '')
                        }
                      >
                        <TrashIcon />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              <button
                type='button'
                disabled={disabled}
                onClick={() =>
                  setHolderSettings((prev) => {
                    const payload = [...prev]

                    payload[policyIdx].traitOptions.push({ category: '', trait: '', amount: 0 })

                    return payload
                  })
                }
                className='w-full mt-1 p-3 flex items-center disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-lg bg-gray-900 hover:bg-gray-700 text-sm hover:text-white border border-gray-700 hover:border-gray-500'
              >
                <PlusCircleIcon className='w-6 h-6 mr-2' />
                Add another Attribute
              </button>
            </div>
          ) : null}

          {withRanks ? (
            <div className='w-full my-2'>
              {rankOptions.map(({ minRange, maxRange, amount }, rewardingRanksIdx) => (
                <div
                  key={`pid-${policyIdx}-${holderSettings.length}-rank-${rewardingRanksIdx}-${rankOptions.length}`}
                  className='my-1'
                >
                  <div className='flex items-center justify-between'>
                    <label className='w-[29%]'>
                      {rewardingRanksIdx === 0 ? (
                        <span className={'ml-1 text-xs ' + (disabled || !policyId ? 'text-gray-700' : '')}>
                          Min. Range
                        </span>
                      ) : null}
                      <input
                        placeholder='ex. 1'
                        disabled={disabled}
                        value={minRange || ''}
                        onChange={(e) =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]
                            const arr = [...rankOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v) || v <= 0) return prev

                            arr[rewardingRanksIdx].minRange = v

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              rankOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                      />
                    </label>

                    <label className='w-[29%]'>
                      {rewardingRanksIdx === 0 ? (
                        <span className={'ml-1 text-xs ' + (disabled || !policyId ? 'text-gray-700' : '')}>
                          Max. Range
                        </span>
                      ) : null}
                      <input
                        placeholder='ex. 1000'
                        disabled={disabled}
                        value={maxRange || ''}
                        onChange={(e) =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]
                            const arr = [...rankOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v) || v <= 0) return prev

                            arr[rewardingRanksIdx].maxRange = v

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              rankOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                      />
                    </label>

                    <label className='w-[29%]'>
                      {rewardingRanksIdx === 0 ? (
                        <span className={'ml-1 text-xs ' + (disabled || !policyId ? 'text-gray-700' : '')}>
                          Points
                        </span>
                      ) : null}
                      <input
                        placeholder='ex. 10'
                        disabled={disabled}
                        value={String(amount || '')}
                        onChange={(e) =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]
                            const arr = [...rankOptions]

                            const v = Number(e.target.value)
                            if (isNaN(v)) return prev

                            arr[rewardingRanksIdx].amount = v

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              rankOptions: arr,
                            }

                            return payload
                          })
                        }
                        className='w-full p-3 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 disabled:placeholder:text-gray-700 placeholder:text-gray-600 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:placeholder:text-white'
                      />
                    </label>

                    {rankOptions.length > 1 ? (
                      <button
                        onClick={() =>
                          setHolderSettings((prev) => {
                            const payload = [...prev]

                            payload[policyIdx] = {
                              ...payload[policyIdx],
                              rankOptions: rankOptions.filter((_item, _idx) => _idx !== policyIdx),
                            }

                            return payload
                          })
                        }
                        className={
                          (rewardingRanksIdx === 0 ? 'mt-6 ' : '') +
                          'w-8 h-8 p-1.5 ml-1 text-sm text-red-400 rounded-full border bg-red-900 border-red-400 hover:text-red-200 hover:bg-red-700 hover:border-red-200 ' +
                          (disabled ? 'hidden' : '')
                        }
                      >
                        <TrashIcon />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              <button
                type='button'
                disabled={disabled}
                onClick={() =>
                  setHolderSettings((prev) => {
                    const payload = [...prev]

                    payload[policyIdx].rankOptions.push({ minRange: 0, maxRange: 0, amount: 0 })

                    return payload
                  })
                }
                className='w-full mt-1 p-3 flex items-center disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-lg bg-gray-900 hover:bg-gray-700 text-sm hover:text-white border border-gray-700 hover:border-gray-500'
              >
                <PlusCircleIcon className='w-6 h-6 mr-2' />
                Add another Range
              </button>
            </div>
          ) : null}
        </div>
      ))}

      <button
        type='button'
        disabled={disabled || !holderSettings.filter((obj) => !!obj.policyId).length}
        onClick={() =>
          setHolderSettings((prev) => {
            const payload = [...prev]

            payload.push({ ...INIT_HOLDER_SETTINGS })

            return payload
          })
        }
        className='w-fit my-1 p-3 flex items-center justify-between disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-lg bg-gray-900 hover:bg-gray-700 text-sm hover:text-white border border-gray-700 hover:border-gray-500'
      >
        <PlusCircleIcon className='w-6 h-6 mr-2' />
        Add another Policy ID
      </button>

      <p className={'mt-4 text-xs ' + (disabled ? 'text-gray-700' : '')}>
        <br />* Trait categories and trait values are case-sensitive
        <br />* Ranks are obtained from cnft.tools
        <br />* Trait and rank weights are non-inclusive (additional to the policy base weight)
      </p>
    </div>
  )
}

export default HolderSettings
