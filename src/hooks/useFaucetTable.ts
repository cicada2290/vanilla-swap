import { useEffect, useState } from 'react'
import { Networks } from '@/config/networks'
import { coins } from '@/config/coin'
import { useAccountContext } from '@/context/accountContext'
import { requestAccountLines } from '@/utils/xrpl'

export interface FaucetTableData {
  currency: string
  issuer: string
  icon: string
  isTrusted: boolean
  balance: string
}

export type LoadingState =
  | 'loading'
  | 'sorting'
  | 'loadingMore'
  | 'error'
  | 'idle'
  | 'filtering'

const useFaucetTable = () => {
  const [data, setData] = useState<FaucetTableData[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const { accountData } = useAccountContext()

  const fetchTrustInfo = async () => {
    if (!accountData.address) return null

    const { result } = await requestAccountLines({
      network: Networks.default,
      account: accountData.address,
    })

    return result.lines
  }

  const fetchData = async () => {
    try {
      setLoadingState('loading')

      const trustInfo = await fetchTrustInfo()
      console.log('[trustInfo]', trustInfo)

      const coinlist = []
      for (const coin of coins) {
        if (coin.currency === 'XRP') continue

        let isTrusted = false
        let balane = '0'
        if (trustInfo) {
          isTrusted = trustInfo.some(
            (trust) =>
              trust.currency === coin.currency && trust.account === coin.issuer
          )
          balane =
            trustInfo.find(
              (trust) =>
                trust.currency === coin.currency &&
                trust.account === coin.issuer
            )?.balance || '0'
        }

        coinlist.push({
          currency: coin.currency,
          issuer: coin.issuer || '',
          icon: coin.icon || '',
          isTrusted: isTrusted,
          balance: balane,
        })
      }

      setData(coinlist)
      setLoadingState('idle')
    } catch (error) {
      console.error(error)
      setLoadingState('error')
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData])

  return {
    // state
    data,
    loadingState,
    setLoadingState,
    // actions
    fetchData,
  }
}

export default useFaucetTable
