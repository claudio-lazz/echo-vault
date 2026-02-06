import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';

// Anchor tests (WIP)
// Run with: anchor test (from workspace root with proper Anchor.toml)

describe('echovault', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Echovault as Program;

  it('derives grant + revoke PDAs', async () => {
    const owner = provider.wallet.publicKey;
    const grantee = anchor.web3.Keypair.generate().publicKey;
    const scopeHash = new Array(32).fill(1);

    const [grantPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('grant'), owner.toBuffer(), grantee.toBuffer(), Buffer.from(scopeHash)],
      program.programId
    );

    const [revokePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('revoke'), grantPda.toBuffer()],
      program.programId
    );

    if (!grantPda || !revokePda) throw new Error('pda_derivation_failed');
  });

  it('grant + revoke flow (smoke)', async () => {
    const owner = provider.wallet.publicKey;
    const grantee = anchor.web3.Keypair.generate().publicKey;
    const scopeHash = new Array(32).fill(2);
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;

    const [grantPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('grant'), owner.toBuffer(), grantee.toBuffer(), Buffer.from(scopeHash)],
      program.programId
    );

    await program.methods
      .grantAccess(scopeHash as number[], new anchor.BN(expiresAt))
      .accounts({
        owner,
        grantee,
        grant: grantPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    const [revokePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('revoke'), grantPda.toBuffer()],
      program.programId
    );

    await program.methods
      .revokeAccess()
      .accounts({
        owner,
        grant: grantPda,
        registry: revokePda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
  });
});
