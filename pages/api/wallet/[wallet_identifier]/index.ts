import { NextApiRequest, NextApiResponse } from 'next'
import * as cardanoSerialization from '@emurgo/cardano-serialization-lib-nodejs'
import blockfrost from '../../../../utils/blockfrost'

const cborToString = (cborStr: string) =>
  cardanoSerialization.Address.from_bytes(
    cborStr.length % 2 === 0 && /^[0-9A-F]*$/i.test(cborStr)
      ? Buffer.from(cborStr, 'hex')
      : Buffer.from(cborStr, 'utf-8')
  ).to_bech32()

const handler = async (req: NextApiRequest, res: NextApiResponse<{ stakeKey: string }>) => {
  const { method, query } = req

  const walletIdentifier = query.wallet_identifier as string
  let stakeKey = walletIdentifier.indexOf('stake1') === 0 ? walletIdentifier : null

  if (!stakeKey && !!walletIdentifier) {
    try {
      stakeKey = cborToString(walletIdentifier)
    } catch (error) {
      console.error(error)
      stakeKey = null
    }
  }

  if (!stakeKey) {
    return res.status(400).end('Please provide a valid wallet identifer: stake1...')
  }

  try {
    switch (method) {
      case 'GET': {
        await blockfrost.accounts(stakeKey)

        return res.status(200).json({ stakeKey })
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)

    if (error.message === 'Invalid or malformed stake address format.') {
      return res.status(404).end()
    }

    return res.status(500).end()
  }
}

export default handler
