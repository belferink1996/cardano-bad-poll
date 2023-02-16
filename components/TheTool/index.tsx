import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { RankedPolicyAsset } from '../../utils/cnftTools'
import { firestore } from '../../utils/firebase'
import { useWallet } from '../../contexts/WalletContext'
import ConnectWallet from '../ConnectWallet'
import PastPolls from '../polls/PastPolls'
import TranscriptsViewer, { Transcript } from '../TranscriptsViewer'
import Settings, { SettingsType } from './Settings'
import { PolicyAssetsResponse } from '../../pages/api/policy/[policy_id]'
import { PolicyRankedAssetsResponse } from '../../pages/api/policy/[policy_id]/ranks'
import { FetchedTimestampResponse } from '../../pages/api/timestamp'
import { POLLS_DB_PATH, TOOLS_PROD_CODE } from '../../constants'

const TheTool = () => {
  const { connected, hasNoKey, wallet } = useWallet()
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

  useEffect(() => {
    addTranscript('Welcome, please connect your wallet.', 'You have to hold a Bad Key 🔑 to access the tool 🔒')
  }, [])

  const [connectedStakeKey, setConnectedStakeKey] = useState('')
  const [settings, setSettings] = useState<SettingsType | undefined>(undefined)

  const [sessionId, setSessionId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [showPastPolls, setShowPastPolls] = useState(false)
  const [pollPublished, setPollPublished] = useState(false)
  const [pollUrl, setPollUrl] = useState('')

  const isUserSettingsExist = useCallback(
    () =>
      !!(
        settings &&
        settings.holderSettings &&
        settings.holderSettings.length &&
        settings.pollSettings &&
        settings.pollSettings.question &&
        settings.pollSettings.options &&
        settings.pollSettings.options.length &&
        settings.pollSettings.endAt.amount &&
        settings.pollSettings.endAt.period
      ),
    [settings]
  )

  const recordSession = useCallback(async () => {
    if (connectedStakeKey && (pollPublished || errorMessage)) {
      const payload = {
        stakeKey: connectedStakeKey,
        errorMessage,
        settings,
        pollPublished,
        pollUrl,
      }

      try {
        if (!sessionId) {
          const { data } = await axios.post('/main-api/tool-sessions/bad-poll', payload, {
            headers: { tools_prod_code: TOOLS_PROD_CODE },
          })
          setSessionId(data.sessionId)
        } else {
          await axios.patch(`/main-api/tool-sessions/bad-poll?sessionId=${sessionId}`, payload, {
            headers: { tools_prod_code: TOOLS_PROD_CODE },
          })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }, [sessionId, connectedStakeKey, errorMessage, settings, pollPublished, pollUrl])

  useEffect(() => {
    recordSession()
  }, [recordSession])

  const fetchRankedAssets = useCallback(async (_policyId: string): Promise<RankedPolicyAsset[]> => {
    try {
      const { data } = await axios.get<PolicyRankedAssetsResponse>(`/api/policy/${_policyId}/ranks`)

      return data.items
    } catch (error: any) {
      console.error(error)

      const errMsg = error.response.data || error.message
      setErrorMessage(errMsg)

      if (error.response.status !== 500 && error.response.status !== 400) {
        addTranscript('ERROR', errMsg)
        return await fetchRankedAssets(_policyId)
      } else {
        return []
      }
    }
  }, [])

  const fetchPolicyAssets = useCallback(
    async (_policyId: string, _allAssets?: boolean): Promise<PolicyAssetsResponse> => {
      try {
        const { data } = await axios.get<PolicyAssetsResponse>(
          `/api/policy/${_policyId}?allAssets=${!!_allAssets}`
        )

        return data
      } catch (error: any) {
        console.error(error)

        const errMsg = error.response.data || error.message
        setErrorMessage(errMsg)

        if (error.response.status !== 500 && error.response.status !== 400) {
          addTranscript('ERROR', errMsg)
          return await fetchPolicyAssets(_policyId, _allAssets)
        } else {
          return []
        }
      }
    },
    []
  )

  const loadWallet = useCallback(async () => {
    if (connected) {
      setLoading(true)
      toast.loading('Processing...')

      if (hasNoKey) {
        toast.dismiss()
        toast.error('Woopsies!')
        return addTranscript("Wallet doesn't have a Bad Key 🔐", 'https://jpg.store/collection/badkey')
      }

      try {
        const sKeys = await wallet.getRewardAddresses()
        addTranscript('Connected', sKeys[0])
        setConnectedStakeKey(sKeys[0])

        addTranscript(
          'Define your poll settings',
          "Once the poll's published, the settings cannot be altered/changed."
        )
        toast.dismiss()
        toast.success('Connected!')
      } catch (error: any) {
        console.error(error)
        setErrorMessage(error.message)
        addTranscript('ERROR', error.message)
        toast.dismiss()
        toast.error('Woopsies!')
      }
    }

    setLoading(false)
  }, [wallet, connected, hasNoKey])

  useEffect(() => {
    if (!loading) loadWallet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadWallet])

  const clickPublish = useCallback(async () => {
    setErrorMessage('')
    setLoading(true)
    toast.loading('Processing...')

    try {
      const holderSettings = settings?.holderSettings || []

      for (let pIdx = 0; pIdx < holderSettings.length; pIdx++) {
        const { policyId, withRanks } = holderSettings[pIdx]

        addTranscript(`Verifying settings for Policy ID ${pIdx + 1} / ${holderSettings.length}`, policyId)
        const policyAssets = await fetchPolicyAssets(policyId, false)

        if (!policyAssets || !policyAssets.length) {
          setLoading(false)
          addTranscript(`Policy ID does not have any assets`, policyId)
          toast.dismiss()
          toast.error('Woopsies!')
          return
        }

        if (withRanks) {
          const rankedAssets = await fetchRankedAssets(policyId)

          if (!rankedAssets || !rankedAssets.length) {
            setLoading(false)
            addTranscript('Policy ID does not have ranks on cnft.tools', policyId)
            toast.dismiss()
            toast.error('Woopsies!')
            return
          }
        }
      }

      addTranscript(`Verification complete`, 'Note: verification does not process/include policy attributes')

      const {
        data: { endAt },
      } = await axios.get<FetchedTimestampResponse>(
        `/api/timestamp?endPeriod=${settings?.pollSettings.endAt.period}&endAmount=${settings?.pollSettings.endAt.amount}`
      )

      addTranscript('Publishing poll', 'This may take a moment...')

      const collection = firestore.collection(POLLS_DB_PATH)
      const votes: Record<string, number> = {}

      settings?.pollSettings.options.forEach(({ serial }) => {
        votes[`vote_${serial}`] = 0
      })

      const res = await collection.add({
        stakeKey: connectedStakeKey,
        endAt,
        holderSettings: settings?.holderSettings,
        description: settings?.pollSettings.description || '',
        question: settings?.pollSettings.question,
        options: settings?.pollSettings.options,
        ...votes,
        usedUnits: [],
      })

      const url = `${window.location.origin}/vote/${res.id}`

      addTranscript('Published! Share this link with your community:', url)
      setPollUrl(url)
      setPollPublished(true)
      toast.dismiss()
      toast.success('Published!')
    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message)
      addTranscript('ERROR!', error.message)
      toast.dismiss()
      toast.error('Woopsies!')
    }

    setLoading(false)
  }, [connectedStakeKey, settings, fetchPolicyAssets, fetchRankedAssets])

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

  return (
    <div className='flex flex-col items-center max-w-[1200px] w-full mx-auto px-10'>
      <TranscriptsViewer transcripts={transcripts} />

      <div className='w-full my-4'>
        <div className='flex flex-wrap items-center justify-evenly'>
          <ConnectWallet addTranscript={addTranscript} />

          <button
            type='button'
            disabled={!connected || hasNoKey || !isUserSettingsExist() || pollPublished || loading}
            onClick={clickPublish}
            className='grow m-1 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700 hover:cursor-pointer'
          >
            Publish Poll
          </button>

          <button
            type='button'
            disabled={!connected || hasNoKey || !pollPublished || loading}
            onClick={() => clickCopy(pollUrl)}
            className='grow m-1 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-xl bg-green-900 hover:bg-green-700 bg-opacity-50 hover:bg-opacity-50 hover:text-gray-200 disabled:border border hover:border border-green-700 hover:border-green-700 hover:cursor-pointer'
          >
            {isCopied ? 'Copied 👍' : 'Copy Poll URL'}
          </button>
        </div>

        <div className='flex'>
          <button
            type='button'
            disabled={!connected || hasNoKey || loading}
            onClick={() => setShowPastPolls((prev) => !prev)}
            className='grow m-1 p-4 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:bg-opacity-50 disabled:border-gray-800 disabled:text-gray-700 rounded-xl bg-gray-900 hover:bg-gray-700 hover:text-gray-200 disabled:border border hover:border border-gray-700 hover:border-gray-500 hover:cursor-pointer'
          >
            {showPastPolls ? 'Setup New Poll' : 'Inspect Previous Polls'}
          </button>
        </div>
      </div>

      {showPastPolls ? (
        <PastPolls stakeKey={connectedStakeKey} addTranscript={addTranscript} />
      ) : (
        <Settings
          disabled={!connected || hasNoKey || pollPublished || loading}
          defaultSettings={settings}
          callback={(payload) => setSettings(payload)}
        />
      )}
    </div>
  )
}

export default TheTool
