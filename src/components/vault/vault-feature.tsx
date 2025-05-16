import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/solana/solana-provider'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { AppHero } from '@/components/app-hero'
import { ellipsify } from '@/lib/utils'
import { useVaultProgram } from './vault-data-access'
import { VaultCreate, VaultList } from './vault-ui'

export default function VaultFeature() {
  const { publicKey } = useWallet()
  const { programId } = useVaultProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Solana Vault"
        subtitle={
          'Create a new vault by clicking the "Create Vault" button. The state of a vault is stored on-chain and can be manipulated by calling the program\'s methods (deposit, withdraw, and close).'
        }
      >
        <p className="mb-6">
          Program ID: <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <VaultCreate />
      </AppHero>
      <VaultList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-16">
        <div className="hero-content text-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="mb-6">Connect your wallet to create and manage vaults.</p>
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
  )
}