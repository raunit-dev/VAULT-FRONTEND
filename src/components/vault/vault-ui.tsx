import { PublicKey } from '@solana/web3.js'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ellipsify } from '@/lib/utils'
import { useVaultProgram, useVaultProgramAccount } from './vault-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

/**
 * Component to create a new vault
 */
export function VaultCreate() {
  const { initialize } = useVaultProgram()
  const { publicKey } = useWallet()

  return (
    <Button 
      onClick={() => initialize.mutateAsync()} 
      disabled={initialize.isPending || !publicKey}
    >
      Create Vault {initialize.isPending && '...'}
    </Button>
  )
}

/**
 * Component to display a list of vaults
 */
export function VaultList() {
  const { accounts, getProgramAccount } = useVaultProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <VaultCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl">No vaults</h2>
          <p>No vaults found. Create one above to get started.</p>
        </div>
      )}
    </div>
  )
}

/**
 * Component to display and interact with a single vault
 */
function VaultCard({ account }: { account: PublicKey }) {
  const { accountQuery, depositMutation, withdrawMutation, closeMutation } = useVaultProgramAccount({
    account,
  })

  // You can display more fields from accountQuery.data if needed

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Vault</CardTitle>
        <CardDescription>
          Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const value = window.prompt('Deposit amount (in lamports):', '1000000')
              if (!value || isNaN(Number(value))) return
              return depositMutation.mutateAsync(Number(value))
            }}
            disabled={depositMutation.isPending}
          >
            Deposit
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const value = window.prompt('Withdraw amount (in lamports):', '0')
              if (!value || isNaN(Number(value))) return
              return withdrawMutation.mutateAsync(Number(value))
            }}
            disabled={withdrawMutation.isPending}
          >
            Withdraw
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!window.confirm('Are you sure you want to close this vault?')) {
                return
              }
              return closeMutation.mutateAsync()
            }}
            disabled={closeMutation.isPending}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}