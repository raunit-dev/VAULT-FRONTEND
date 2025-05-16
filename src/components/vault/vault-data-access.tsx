import { getVaultProgram, getVaultProgramId } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as anchor from "@coral-xyz/anchor";
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useAnchorProvider } from '@/components/solana/use-anchor-provider'
import { useTransactionToast } from '@/components/use-transaction-toast'
import { toast } from 'sonner'
import BN from 'bn.js'

/**
 * Hook for interacting with the Vault program
 */
function useVaultProgram() {
  const { connection } = useConnection()
  const { publicKey } = useWallet() // Get connected wallet's public key
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVaultProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVaultProgram(provider, programId), [provider, programId])

  // Query all vaults
  const accounts = useQuery({
    queryKey: ['vault', 'all', { cluster }],
    queryFn: () => program.account.vaultState.all(),
    enabled: !!provider.wallet?.publicKey, // Only run if wallet is connected
  })

  // Query program account info
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  // Initialize a new vault
  const initialize = useMutation({
    mutationKey: ['vault', 'initialize', { cluster }],
    mutationFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected')
      
      // Calculate PDA addresses
      const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('state'), publicKey.toBuffer()],
        programId
      )
      
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        programId
      )
      
      // Send transaction using the connected wallet (which has funds)
      return program.methods.initialize()
        .accountsPartial({
          user: publicKey,
          state: statePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: (error) => {
      console.error('Initialization error:', error)
      toast.error('Failed to initialize account')
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

/**
 * Hook for interacting with a specific vault account
 */
function useVaultProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const { publicKey } = useWallet()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVaultProgram()

  // Calculate PDAs
  const statePda = useMemo(
    () => PublicKey.findProgramAddressSync(
      [Buffer.from('state'), account.toBuffer()],
      program.programId
    )[0],
    [account, program.programId]
  )
  
  const vaultPda = useMemo(
    () => PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), account.toBuffer()],
      program.programId
    )[0],
    [account, program.programId]
  )

  // Query account data
  const accountQuery = useQuery({
    queryKey: ['vault', 'fetch', { cluster, account }],
    queryFn: () => program.account.vaultState.fetch(statePda),
  })

  // Close account
  const closeMutation = useMutation({
    mutationKey: ['vault', 'close', { cluster, account }],
    mutationFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected')
      
      return program.methods.closeaccount()
        .accountsPartial({
          user: account,
          state: statePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
    onError: (error) => {
      console.error('Close account error:', error)
      toast.error('Failed to close account')
    },
  })

  // Deposit SOL
  const depositMutation = useMutation({
    mutationKey: ['vault', 'deposit', { cluster, account }],
    mutationFn: async (amount: number) => {
      if (!publicKey) throw new Error('Wallet not connected')
      
      return program.methods
        .deposit(new BN(amount))
        .accountsPartial({
          user: account,
          state: statePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
    onError: (error) => {
      console.error('Deposit error:', error)
      toast.error('Failed to deposit')
    },
  })

  // Withdraw SOL
  const withdrawMutation = useMutation({
    mutationKey: ['vault', 'withdraw', { cluster, account }],
    mutationFn: async (amount: number) => {
      if (!publicKey) throw new Error('Wallet not connected')
      
      return program.methods
        .withdraw(new BN(amount))
        .accountsPartial({
          user: account,
          state: statePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
    onError: (error) => {
      console.error('Withdraw error:', error)
      toast.error('Failed to withdraw')
    },
  })

  return {
    accountQuery,
    closeMutation,
    depositMutation,
    withdrawMutation,
  }
}

export { useVaultProgram, useVaultProgramAccount }