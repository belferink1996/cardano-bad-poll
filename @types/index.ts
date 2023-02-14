import { HolderSettingsType } from '../components/TheTool/Settings/HolderSettings'
import { AnswerOptionType } from '../components/TheTool/Settings/PollSettings'

export interface Poll {
  id: string
  stakeKey: string
  active: boolean
  endAt: number
  holderSettings: HolderSettingsType[]
  description: string
  question: string
  options: AnswerOptionType[]
  usedUnits: string[]
  [vote_serial: string]: any
}
