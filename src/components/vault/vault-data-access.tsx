import { getVaultProgram,getVaultProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as anchor from "@coral-xyz/anchor";
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useAnchorProvider } from '@/components/solana/use-anchor-provider'
import { useTransactionToast } from '@/components/use-transaction-toast'
import { toast } from 'sonner'

function useVaultProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVaultProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVaultProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['vault', 'all', { cluster }],
    queryFn: () => program.account.vaultState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['vault', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accountsPartial({
        user: keypair.publicKey,
        state: PublicKey.findProgramAddressSync(
          [Buffer.from('state'), keypair.publicKey.toBuffer()],
          programId
        )[0],
        vault: PublicKey.findProgramAddressSync(
          [Buffer.from('vault'), keypair.publicKey.toBuffer()],
          programId
        )[0],
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

function useVaultProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVaultProgram()

  const statePda = useMemo(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from('state'), account.toBuffer()],
        program.programId
      )[0],
    [account, program.programId]
  )
  const vaultPda = useMemo(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), account.toBuffer()],
        program.programId
      )[0],
    [account, program.programId]
  )

  const accountQuery = useQuery({
    queryKey: ['vault', 'fetch', { cluster, account }],
    queryFn: () => program.account.vaultState.fetch(statePda),
  })

  const closeMutation = useMutation({
    mutationKey: ['vault', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.closeaccount().accountsPartial({
        user: account,
        state: statePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const depositMutation = useMutation({
    mutationKey: ['vault', 'deposit', { cluster, account }],
    mutationFn: (amount: number) =>
      program.methods.deposit(new (require('bn.js'))(amount)).accountsPartial({
        user: account,
        state: statePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const withdrawMutation = useMutation({
    mutationKey: ['vault', 'withdraw', { cluster, account }],
    mutationFn: (amount: number) =>
      program.methods.withdraw(new (require('bn.js'))(amount)).accountsPartial({
        user: account,
        state: statePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
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