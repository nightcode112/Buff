import { DocContent, DocH2, DocH3, DocP, DocNote, DocTable, DocList } from "@/components/docs/doc-layout";
import { CodeBlock, InstallCommand } from "@/components/docs/code-block";

export default function SkillsPage() {
  return (
    <DocContent title="Skills & Plugins" description="Drop-in skills for Claude Code, OpenClaw, and other AI agent frameworks." badge="Guide">
      <DocH2>Claude Code Skills</DocH2>
      <DocP>Two skills for Claude Code — use them by typing the slash command in any Claude Code session.</DocP>

      <DocH3>/buff-integrate</DocH3>
      <DocP>Guides you through integrating the Buff SDK into any Solana project. Covers installation, human wallet mode, agent mode, x402, multi-asset allocation, and events.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# In Claude Code, just type:
/buff-integrate

# Claude will walk you through the full SDK setup`} />

      <DocH3>/buff-agent</DocH3>
      <DocP>Sets up a Buff-enabled AI agent from scratch. Covers agent wallet creation, headless initialization, wrapAmount for off-chain payments, x402 middleware, and monitoring.</DocP>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# In Claude Code:
/buff-agent

# Claude will create the agent wallet, init Buff, and wire everything up`} />

      <DocH2>Install Claude Code Skills</DocH2>
      <DocP>Clone the repo and the skills are automatically available:</DocP>
      <InstallCommand command="git clone https://github.com/nightcode112/Buff.git && cd Buff" />
      <DocP>The skills live in <code>.claude/skills/buff-integrate/</code> and <code>.claude/skills/buff-agent/</code>. Claude Code auto-discovers them when you work in the project directory.</DocP>

      <DocNote>To use these skills in a different project, copy the skill folders to your project&apos;s <code>.claude/skills/</code> directory.</DocNote>

      <DocH2>OpenClaw Skill</DocH2>
      <DocP>Drop-in skill for any OpenClaw agent. Rounds up every transaction and auto-invests via Jupiter.</DocP>

      <DocH3>Install</DocH3>
      <CodeBlock filename="bash" lang="bash" showLineNumbers={false} code={`# Copy the skill to your OpenClaw skills directory
cp -r packages/openclaw-skill ~/.openclaw/skills/buff-roundup

# Or reference it in your OpenClaw config
# skills:
#   - path: ./packages/openclaw-skill`} />

      <DocH3>Configure</DocH3>
      <CodeBlock filename="env" lang="bash" showLineNumbers={false} code={`BUFF_AGENT_SEED=your-32-byte-hex-seed
BUFF_PLAN=sprout
BUFF_INVEST_INTO=BTC
BUFF_THRESHOLD=5`} />

      <DocH3>Usage in OpenClaw Agent</DocH3>
      <CodeBlock filename="agent.ts" code={`import { Buff } from "buff-protocol-sdk"

const buff = await Buff.init({
  agentSeed: process.env.BUFF_AGENT_SEED,
  platformId: "openclaw-agent",
  source: "agent",
  plan: "sprout",
  investInto: "BTC",
})

// After any agent action that costs money
await buff.wrapAmount({
  txValueUsd: costOfAction,
  source: "agent",
  memo: "openclaw task execution",
})

// Periodically check & invest
const { swaps } = await buff.checkAndInvest()
if (swaps.length) console.log("Invested:", swaps.map(s => s.asset))`} />

      <DocH2>Universal SKILL.md Format</DocH2>
      <DocP>All Buff skills follow the standard SKILL.md format, compatible with Claude Code, OpenClaw, and other agent frameworks that support the format:</DocP>
      <CodeBlock filename="SKILL.md" lang="bash" showLineNumbers={false} code={`---
name: buff-roundup
description: Auto-invest spare change from agent transactions.
---

# Instructions

[Markdown body with steps, code examples, configuration]`} />

      <DocH2>Available Skills</DocH2>
      <DocTable
        headers={["Skill", "Platform", "Use Case"]}
        rows={[
          ["buff-integrate", "Claude Code", "Add Buff to any Solana project"],
          ["buff-agent", "Claude Code", "Set up an AI agent with Buff"],
          ["buff-roundup", "OpenClaw", "Round-up investing for OpenClaw agents"],
        ]}
      />

      <DocH2>Create Your Own Skill</DocH2>
      <DocP>Build a custom Buff skill for your platform:</DocP>
      <DocList items={[
        "Create a directory with a SKILL.md file",
        "Add YAML frontmatter with name and description",
        "Write instructions in the markdown body — code examples, config, steps",
        "Reference the Buff SDK or REST API in your instructions",
        "Drop it in .claude/skills/ (Claude Code) or ~/.openclaw/skills/ (OpenClaw)",
      ]} />

      <DocNote>Skills are just markdown files with instructions. If you can write documentation, you can create a skill. The AI agent reads the instructions and follows them.</DocNote>
    </DocContent>
  );
}
