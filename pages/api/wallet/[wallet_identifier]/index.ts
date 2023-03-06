import { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '../../../../utils/blockfrost'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req

  const walletIdentifier = query.wallet_identifier as string
  const stakeKey = walletIdentifier.indexOf('stake1') === 0 ? walletIdentifier : null

  if (!stakeKey) {
    return res.status(400).end('Please provide a valid wallet identifer: stake1...')
  }

  try {
    switch (method) {
      case 'GET': {
        await blockfrost.accounts(stakeKey)

        return res.status(200).end()
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
