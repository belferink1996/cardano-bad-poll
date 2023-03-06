import dynamic from 'next/dynamic'
import { Fragment, useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { RankedPolicyAsset } from '../../utils/cnftTools'
import { firebase, firestore } from '../../utils/firebase'
import { useWallet } from '../../contexts/WalletContext'
import ConnectWallet from '../../components/ConnectWallet'
import TranscriptsViewer, { Transcript } from '../../components/TranscriptsViewer'
import { HolderSettingsType } from '../../components/TheTool/Settings/HolderSettings'
import { FetchedTimestampResponse } from '../../pages/api/timestamp'
import { FetchedAssetResponse } from '../../pages/api/asset/[asset_id]'
import { PolicyRankedAssetsResponse } from '../../pages/api/policy/[policy_id]/ranks'
import { Poll } from '../../@types'
import { POLLS_DB_PATH } from '../../constants'
import { WalletAssetsResponse } from '../../pages/api/wallet/[wallet_identifier]/assets'
const PollViewer = dynamic(async () => (await import('../../components/polls/PollViewer')).default, { ssr: false })

const VotePoll = (props: { poll: Poll; isSdkWrapped?: boolean; sdkVoterStakeKey?: string }) => {
  const { poll, isSdkWrapped, sdkVoterStakeKey } = props
  const { connected, wallet } = useWallet()

  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const addTranscript = (msg: string, key?: string) => {
    setTranscripts((prev) => {
      const prevCopy = [...prev]
      if (prevCopy.length >= 50) prevCopy.pop()

      return [
        {
          timestamp: new Date().getTime(),
          msg,
          key,
        },
        ...prevCopy,
      ]
    })
  }

  const [loading, setLoading] = useState(false)
  const [pollActive, setPollActive] = useState(poll.active || false)
  const [holderEligible, setHolderEligible] = useState(false)
  const [holderVote, setHolderVote] = useState<{ points: number; units: string[] }>({ points: 0, units: [] })

  const pollExpired = useCallback(() => {
    setPollActive(false)
    addTranscript('Poll expired (inactive)')
  }, [])

  useEffect(() => {
    if (!pollActive) {
      pollExpired()
    } else if (pollActive && !isSdkWrapped) {
      addTranscript(
        'Please connect your wallet.',
        'Your wallet will be scanned to verify your vote eligibility & weight'
      )
    }
  }, [pollActive, pollExpired])

  const fetchRankedAssets = useCallback(async (_policyId: string): Promise<RankedPolicyAsset[]> => {
    try {
      const { data } = await axios.get<PolicyRankedAssetsResponse>(`/api/policy/${_policyId}/ranks`)

      return data.items
    } catch (error: any) {
      console.error(error)

      if (error.response.status !== 500 && error.response.status !== 400) {
        addTranscript('ERROR', error.response.data || error.message)
        return await fetchRankedAssets(_policyId)
      } else {
        return []
      }
    }
  }, [])

  const fetchAsset = useCallback(async (_assetId: string): Promise<FetchedAssetResponse> => {
    try {
      const { data } = await axios.get<FetchedAssetResponse>(`/api/asset/${_assetId}`)

      return data
    } catch (error: any) {
      console.error(error)

      if (error.response.status !== 500 && error.response.status !== 400) {
        addTranscript('ERROR', error.response.data || error.message)
        return await fetchAsset(_assetId)
      } else {
        return {} as FetchedAssetResponse
      }
    }
  }, [])

  const processBalances = useCallback(
    async ({
      balances,
      eligiblePolicyIds,
    }: {
      balances: WalletAssetsResponse['assets']
      eligiblePolicyIds: HolderSettingsType[]
    }) => {
      if (!eligiblePolicyIds.length) {
        setLoading(false)
        setHolderEligible(false)
        addTranscript("You aren't eligible to vote this poll", "You don't own any of the required Policy IDs")
        toast.dismiss()
        return
      } else {
        setHolderEligible(true)
      }

      addTranscript(`Found ${eligiblePolicyIds.length} eligible Policy IDs`)
      addTranscript('Processing voting points', 'This may take a moment...')

      let votePoints = 0

      const rankedAssets: Record<string, RankedPolicyAsset[]> = {}
      const voteUnits: string[] = []

      for await (const setting of eligiblePolicyIds) {
        const { policyId, weight, withTraits, traitOptions, withRanks, rankOptions } = setting

        let basePoints = 0
        let rankPoints = 0
        let traitPoints = 0

        const heldPolicyUnits = balances.filter((balance) => balance.unit.indexOf(policyId) === 0)
        for await (const { unit, quantity } of heldPolicyUnits) {
          const isUnitUsed = !!poll?.usedUnits.find((str) => str === unit)

          if (!isUnitUsed) {
            basePoints += Number(quantity || 0) * weight
            voteUnits.push(unit)

            if (withRanks) {
              if (!rankedAssets[policyId] || !rankedAssets[policyId].length) {
                rankedAssets[policyId] = await fetchRankedAssets(policyId)
              }

              const rankedAsset = rankedAssets[policyId].find((rankedItem) => rankedItem.assetId === unit)

              if (rankedAsset) {
                rankOptions.forEach((rankSetting) => {
                  if (rankedAsset.rank >= rankSetting.minRange && rankedAsset.rank <= rankSetting.maxRange) {
                    rankPoints += rankSetting.amount
                  }
                })
              }
            }

            if (withTraits) {
              if (!rankedAssets[policyId] || !rankedAssets[policyId].length) {
                rankedAssets[policyId] = await fetchRankedAssets(policyId)
              }

              const isAssetFromRanked = !!rankedAssets[policyId]?.length
              const asset = isAssetFromRanked
                ? rankedAssets[policyId].find((asset) => asset.assetId === unit)
                : await fetchAsset(unit)

              let attributes: Record<string, any> = isAssetFromRanked
                ? (asset as RankedPolicyAsset).attributes
                : (asset as FetchedAssetResponse).onchain_metadata?.attributes ||
                  (asset as FetchedAssetResponse).onchain_metadata ||
                  (asset as FetchedAssetResponse).metadata ||
                  {}

              traitOptions.forEach((traitSetting) => {
                if (
                  attributes[traitSetting.category] === traitSetting.trait ||
                  attributes[traitSetting.category]?.toLowerCase() === traitSetting.trait.toLowerCase() ||
                  attributes[traitSetting.category.toLowerCase()] === traitSetting.trait ||
                  attributes[traitSetting.category.toLowerCase()]?.toLowerCase() ===
                    traitSetting.trait.toLowerCase()
                ) {
                  traitPoints += traitSetting.amount
                }
              })
            }
          }
        }

        votePoints += basePoints
        votePoints += rankPoints
        votePoints += traitPoints

        if (basePoints) addTranscript(`Added ${basePoints} voting points for: holding`, policyId)
        if (rankPoints) addTranscript(`Added ${rankPoints} voting points for: ranks`, policyId)
        if (traitPoints) addTranscript(`Added ${traitPoints} voting points for: attributes`, policyId)
      }

      addTranscript(`You have ${votePoints} total voting points`, 'Scroll down 👇 and cast your vote 🗳️')
      setHolderVote({
        points: votePoints,
        units: voteUnits,
      })

      toast.dismiss()
      toast.success('Connected!')
    },
    [poll, fetchRankedAssets, fetchAsset]
  )

  const loadWallet = useCallback(async () => {
    setLoading(true)
    toast.loading('Processing...')

    try {
      const sKeys = await wallet.getRewardAddresses()
      addTranscript('Connected', sKeys[0])

      const eligiblePolicyIds: HolderSettingsType[] = []
      const balances = await wallet.getBalance()

      for await (const pId of (await wallet.getPolicyIds()).values()) {
        const foundSetting = poll?.holderSettings.find((s) => s.policyId === pId)
        if (foundSetting) {
          eligiblePolicyIds.push(foundSetting)
        }
      }

      await processBalances({ balances, eligiblePolicyIds })
    } catch (error: any) {
      console.error(error)
      addTranscript('ERROR', error.message)
      toast.dismiss()
      toast.error('Woopsies!')
    }

    setLoading(false)
  }, [poll, processBalances, wallet])

  const loadWalletFromSdk = useCallback(async () => {
    setLoading(true)
    toast.loading('Processing...')

    try {
      addTranscript('Connected', sdkVoterStakeKey)

      const { data: walletData } = await axios.get<WalletAssetsResponse>(`/api/wallet/${sdkVoterStakeKey}/assets`)

      const balances = walletData.assets
      const eligiblePolicyIds: HolderSettingsType[] = []

      for await (const { unit } of balances) {
        const foundSetting = poll?.holderSettings.find((s) => unit.indexOf(s.policyId) === 0)
        if (foundSetting) {
          const alreadyExists = eligiblePolicyIds.find((s) => s.policyId === foundSetting.policyId)
          if (!alreadyExists) {
            eligiblePolicyIds.push(foundSetting)
          }
        }
      }

      await processBalances({ balances, eligiblePolicyIds })
    } catch (error: any) {
      console.error(error)
      addTranscript('ERROR', error.message)
      toast.dismiss()
      toast.error('Woopsies!')
    }

    setLoading(false)
  }, [poll, processBalances, sdkVoterStakeKey])

  useEffect(() => {
    if (pollActive && !loading) {
      if (isSdkWrapped) {
        loadWalletFromSdk()
      } else if (connected) {
        loadWallet()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollActive, connected, loadWallet, isSdkWrapped, loadWalletFromSdk])

  const castVote = useCallback(
    async (serialNumber: number) => {
      if (
        window.confirm(
          `Are you sure you want to cast ${holderVote.points} points to option #${serialNumber}?\nCasted points are permanent!\nEvery asset can only be used once!`
        )
      ) {
        setLoading(true)
        toast.loading('Processing...')

        if (poll && holderVote.points) {
          try {
            addTranscript('Processing voting points', 'This may take a moment...')

            const {
              data: { now },
            } = await axios.get<FetchedTimestampResponse>(`/api/timestamp`)

            if (now >= poll.endAt) {
              setPollActive(false)
              addTranscript('Poll expired (inactive)')
              toast.dismiss()
              return
            }

            const collection = firestore.collection(POLLS_DB_PATH)

            const { FieldValue } = firebase.firestore
            const incrementPoints = FieldValue.increment(holderVote.points)
            const arrayUnionUnits = FieldValue.arrayUnion(...holderVote.units)

            const payload = {
              [`vote_${serialNumber}`]: incrementPoints,
              usedUnits: arrayUnionUnits,
            }

            await collection.doc(poll?.id).update(payload)

            addTranscript(
              'Success! You can leave the poll 👍',
              `Casted ${holderVote.points} points to option #${serialNumber}, with a total of ${holderVote.units.length} assets`
            )
            setHolderVote({
              points: 0,
              units: [],
            })

            toast.dismiss()
            toast.success('Voted!')
          } catch (error: any) {
            console.error(error)
            toast.dismiss()
            toast.error('Woopsies!')
            addTranscript('ERROR', error.message)
          }
        }

        setLoading(false)
      }
    },
    [poll, holderVote]
  )

  return (
    <div className='w-[80vw] md:w-[690px] mx-auto'>
      <TranscriptsViewer transcripts={transcripts} />

      {isSdkWrapped ? (
        <div className='mb-2' />
      ) : (
        <div className='w-full mb-4 flex flex-wrap items-center justify-evenly'>
          <ConnectWallet
            disabled={!pollActive && poll.allowPublicView}
            disableTokenGate
            addTranscript={addTranscript}
          />
        </div>
      )}

      {poll.allowPublicView || holderEligible ? (
        <Fragment>
          <PollViewer poll={poll} callbackTimerExpired={() => pollExpired()} />

          <div className='w-full mt-2 flex flex-wrap items-center justify-evenly'>
            {poll.options.map((obj) => (
              <button
                key={`click-option-${obj.serial}`}
                type='button'
                disabled={
                  (!isSdkWrapped && !connected) ||
                  (isSdkWrapped && !sdkVoterStakeKey) ||
                  !pollActive ||
                  !holderVote.points ||
                  loading
                }
                onClick={() => castVote(obj.serial)}
                className='grow m-1 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700 hover:cursor-pointer'
              >
                Vote #{obj.serial}
              </button>
            ))}
          </div>
        </Fragment>
      ) : (
        <p className='my-8 text-center text-red-400'>
          This poll is classified, and cannot be seen by the public eye,
          <br />
          please connect your wallet.
        </p>
      )}

      <div className='mt-4 flex flex-col items-center justify-center'>
        <h6>Who can vote?</h6>

        {poll.holderSettings.map((setting) => (
          <div key={`holderSetting-${setting.policyId}`} className='text-xs my-2'>
            <p className='text-gray-200'>{setting.policyId}</p>
            <p>Policy ID ({setting.weight} points)</p>
            {setting.withRanks
              ? setting.rankOptions.map((rankSetting) => (
                  <p key={`rankSetting-${rankSetting.minRange}-${rankSetting.maxRange}`}>
                    Ranks: {rankSetting.minRange}-{rankSetting.maxRange} ({rankSetting.amount} points)
                  </p>
                ))
              : null}

            {setting.withTraits
              ? setting.traitOptions.map((traitSetting) => (
                  <p key={`traitSetting-${traitSetting.category}-${traitSetting.trait}`}>
                    Attribute: {traitSetting.category} / {traitSetting.trait} ({traitSetting.amount} points)
                  </p>
                ))
              : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default VotePoll
