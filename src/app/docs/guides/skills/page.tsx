import { DocContent, DocH2, DocH3, DocP, DocNote, DocTable, DocList } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function SkillsPage() {
  return (
    <DocContent title="Skills & Plugins" description="Drop-in plugins and skills for ElizaOS, Claude Code, OpenClaw/ClawHub, and other AI agent frameworks." badge="Guide">

      <DocH2>ElizaOS Plugin</DocH2>
      <DocP>Full plugin for ElizaOS agents. 5 actions + 1 portfolio provider. Published on npm and submitted to the ElizaOS registry.</DocP>

      <DocH3>Install</DocH3>
      <InstallCommand command="npm install buff-elizaos-plugin" />

      <DocH3>Configure</DocH3>
      <CodeBlock filename="env" lang="bash" showLineNumbers={false} code={`BUFF_API_KEY=your-api-key              # Get from buff.finance/dashboard
BUFF_WALLET_PUBKEY=your-buff-wallet    # Your Buff wallet Solana address
BUFF_PLAN=sprout                       # seed|sprout|tree|forest
BUFF_INVEST_INTO=BTC                   # BTC|ETH|SOL|USDC
BUFF_THRESHOLD=5                       # USD threshold before auto-swap`} />

      <DocH3>Add to Character</DocH3>
      <CodeBlock filename="character.json" lang="typescript" code={`{
  "name": "my-agent",
  "plugins": ["buff-elizaos-plugin"]
}`} />

      <DocH3>Actions</DocH3>
      <DocTable
        headers={["Action", "Trigger", "Description"]}
        rows={[
          ["BUFF_ROUNDUP", '"round up my $4.73 transaction"', "Calculate a round-up"],
          ["BUFF_INVEST", '"check my Buff investments"', "Check threshold & build swap"],
          ["BUFF_PORTFOLIO", '"show my Buff portfolio"', "View wallet balances"],
          ["BUFF_SET_PLAN", '"set plan to tree"', "Change round-up tier"],
          ["BUFF_SET_ALLOC", '"set allocation 60% BTC 40% ETH"', "Set portfolio split"],
        ]}
      />

      <DocP>The <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">buffPortfolioProvider</code> automatically injects portfolio context into agent conversations.</DocP>

      <DocNote>
        npm: <a href="https://www.npmjs.com/package/buff-elizaos-plugin" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">buff-elizaos-plugin</a> &middot;
        GitHub: <a href="https://github.com/nightcode112/buff-elizaos-plugin" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">nightcode112/buff-elizaos-plugin</a>
      </DocNote>

      <DocH2>OpenClaw / ClawHub Skill</DocH2>
      <DocP>Published on ClawHub as <strong>buff-roundup</strong>. Drop-in skill for any OpenClaw-compatible agent.</DocP>

      <DocH3>Install</DocH3>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# From ClawHub
clawhub install nightcode112/buff-roundup

# Or copy manually
cp -r packages/openclaw-skill ~/.openclaw/skills/buff-roundup`} />

      <DocH3>Configure</DocH3>
      <CodeBlock filename="env" lang="bash" showLineNumbers={false} code={`BUFF_API_KEY=your-api-key
BUFF_WALLET_PUBKEY=your-buff-wallet
BUFF_PLAN=sprout
BUFF_INVEST_INTO=BTC
BUFF_THRESHOLD=5`} />

      <DocH3>Usage in OpenClaw Agent</DocH3>
      <CodeBlock filename="agent.ts" code={`import { Buff } from "buff-protocol-sdk"

const buff = new Buff({
  apiKey: process.env.BUFF_API_KEY,
  plan: process.env.BUFF_PLAN || "sprout",
  investInto: process.env.BUFF_INVEST_INTO || "BTC",
  investThreshold: Number(process.env.BUFF_THRESHOLD) || 5,
})

// Register the agent
await buff.registerAgent(agentPubkey, "openclaw-agent")

// After any agent action that costs money
const breakdown = await buff.calculateRoundUp(costOfAction)
console.log("Round-up:", breakdown.roundUpUsd)

// Get wrap instructions to transfer the round-up
const { instructions } = await buff.getWrapInstructions(
  costOfAction, agentPubkey, buffWalletPubkey
)

// Build and execute swap when threshold is reached
const { ready, transactions } = await buff.buildSwap(buffWalletPubkey)
if (ready) {
  for (const tx of transactions) {
    const signed = signWithAgentKey(tx)
    await buff.executeSwap(signed)
  }
}`} />

      <DocNote>
        ClawHub: <a href="https://clawhub.com/nightcode112/buff-roundup" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">nightcode112/buff-roundup</a> &middot;
        SKILL.md: <a href="https://buff.finance/SKILL.md" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">buff.finance/SKILL.md</a>
      </DocNote>

      <DocH2>Claude Code Skills</DocH2>
      <DocP>Two skills for Claude Code — type the slash command in any Claude Code session.</DocP>

      <DocH3>/buff-integrate</DocH3>
      <DocP>Guides you through integrating the Buff SDK into any Solana project. Covers installation, API key auth, wallet signature auth, round-up calculation, wrap instructions, and swap execution.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# In Claude Code, just type:
/buff-integrate

# Claude will walk you through the full SDK setup`} />

      <DocH3>/buff-agent</DocH3>
      <DocP>Sets up a Buff-enabled AI agent from scratch. Covers agent registration, API key setup, deriveWallet, round-up calculation, and swap execution.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# In Claude Code:
/buff-agent

# Claude will create the agent wallet, init Buff, and wire everything up`} />

      <DocH3>Install Claude Code Skills</DocH3>
      <DocP>Clone the repo and the skills are automatically available:</DocP>
      <InstallCommand command="git clone https://github.com/nightcode112/Buff.git && cd Buff" />
      <DocP>The skills live in <code>.claude/skills/buff-integrate/</code> and <code>.claude/skills/buff-agent/</code>. Claude Code auto-discovers them when you work in the project directory.</DocP>

      <DocNote>To use these skills in a different project, copy the skill folders to your project&apos;s <code>.claude/skills/</code> directory.</DocNote>

      <DocH2>Available Plugins & Skills</DocH2>
      <DocTable
        headers={["Name", "Platform", "Install"]}
        rows={[
          ["buff-elizaos-plugin", "ElizaOS", "npm install buff-elizaos-plugin"],
          ["buff-roundup", "OpenClaw / ClawHub", "clawhub install nightcode112/buff-roundup"],
          ["buff-integrate", "Claude Code", "Clone repo → /buff-integrate"],
          ["buff-agent", "Claude Code", "Clone repo → /buff-agent"],
          ["SKILL.md", "Any agent", "Fetch buff.finance/SKILL.md"],
        ]}
      />

      <DocH2>Universal SKILL.md</DocH2>
      <DocP>Any AI agent can fetch the SKILL.md directly from <code className="text-[13px] bg-muted px-1.5 py-0.5 rounded">https://buff.finance/SKILL.md</code> to learn how to use Buff. Compatible with Claude Code, OpenClaw, and any framework that reads SKILL.md files.</DocP>

      <DocH2>Create Your Own Plugin</DocH2>
      <DocP>Build a custom Buff plugin for your platform:</DocP>
      <DocList items={[
        "Install buff-protocol-sdk from npm",
        "Initialize with new Buff({ apiKey }) — all logic is server-side",
        "Use calculateRoundUp(), getWrapInstructions(), buildSwap(), executeSwap()",
        "Or call the REST API directly from any language",
        "See the ElizaOS plugin source for a reference implementation",
      ]} />

      <DocNote>The SDK is a thin API client — zero sensitive logic. All fee calculation, treasury addresses, and swap routing are handled server-side by the Buff API.</DocNote>
    </DocContent>
  );
}
