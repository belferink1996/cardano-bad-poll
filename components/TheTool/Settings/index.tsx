import { useEffect, useState } from 'react'
import PollSettings, { PollSettingsType } from './PollSettings'
import HolderSettings, { HolderSettingsType } from './HolderSettings'

export interface SettingsType {
  holderSettings: HolderSettingsType[]
  pollSettings: PollSettingsType
}

interface SettingsProps {
  disabled: boolean
  defaultSettings?: SettingsType
  callback: (_payload: SettingsType) => void
}

const Settings = (props: SettingsProps) => {
  const { disabled, defaultSettings, callback } = props

  const [holderSettings, setHolderSettings] = useState<HolderSettingsType[] | undefined>(
    defaultSettings?.holderSettings || undefined
  )

  const [pollSettings, setPollSettings] = useState<PollSettingsType | undefined>(
    defaultSettings?.pollSettings || undefined
  )

  useEffect(() => {
    if (holderSettings && pollSettings) {
      callback({
        holderSettings,
        pollSettings,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holderSettings, pollSettings])

  return (
    <div className='w-full px-1 flex flex-col items-center md:flex-row md:items-start md:justify-between'>
      <div className='max-w-[500px] w-full mr-2'>
        <PollSettings
          disabled={disabled}
          defaultSettings={pollSettings}
          callback={(payload) => setPollSettings(payload)}
        />
      </div>

      <div className='max-w-[500px] w-full ml-2 mt-4 md:mt-0'>
        <HolderSettings
          disabled={disabled}
          defaultSettings={holderSettings}
          callback={(payload) => setHolderSettings(payload)}
        />
      </div>
    </div>
  )
}

export default Settings
