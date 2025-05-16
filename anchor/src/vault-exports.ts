// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VaultIDL from '../target/idl/vault.json'
import type { Vault } from '../target/types/vault'

// Re-export the generated IDL and type
export { Vault, VaultIDL }

// The programId should match your deployed program
export const VAULT_PROGRAM_ID = new PublicKey('4oTu1vvRK3KjG24S71BkN72PXb7EMSchmY2ayzc7BKZW')

// This is a helper function to get the Vault Anchor program.
export function getVaultProgram(provider: AnchorProvider, address?: PublicKey): Program<Vault> {
  return new Program(
    { ...VaultIDL, address: address?.toString() || VAULT_PROGRAM_ID.toString() } as any,
    provider
  )
}

// This is a helper function to get the program ID for the Vault Program depending on the cluster.
export function getVaultProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return VAULT_PROGRAM_ID
    case 'mainnet-beta':
    default:
      return VAULT_PROGRAM_ID
  }
}
