import type { AMMInfoRequest, AMMInfoResponse, AMMCreate } from 'xrpl'
import { Client, Wallet } from 'xrpl'

export const newClient = (network: string) => {
  return new Client(network)
}

export const fetchColdWallet = () => {
  return Wallet.fromSecret(
    process.env.NEXT_PUBLIC_OWNER_COLD_WALLET_SEED as string
  )
}

export const fetchHotWallet = () => {
  return Wallet.fromSecret(
    process.env.NEXT_PUBLIC_OWNER_HOT_WALLET_SEED as string
  )
}

export const submitAMMCreate = async ({
  network,
  request,
  wallet,
}: {
  network: string
  request: AMMCreate
  wallet: Wallet
}) => {
  const client = newClient(network)
  await client.connect()

  const response = await client
    .submitAndWait(request, { wallet })
    .catch(() => null)

  await client.disconnect()

  return response
}

export const requestAmmInfo = async ({
  network,
  request,
}: {
  network: string
  request: AMMInfoRequest
}): Promise<AMMInfoResponse | null> => {
  const client = newClient(network)
  await client.connect()

  const response = await client.request(request).catch(() => null)

  await client.disconnect()

  return response
}
