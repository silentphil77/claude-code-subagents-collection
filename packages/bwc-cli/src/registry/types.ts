import { z } from 'zod'

export const SubagentSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  file: z.string(),
  tools: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  sha: z.string().optional()
})

export const CommandSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  file: z.string(),
  prefix: z.string().default('/'),
  tags: z.array(z.string()).default([]),
  sha: z.string().optional()
})

export const RegistrySchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  subagents: z.array(SubagentSchema),
  commands: z.array(CommandSchema)
})

export type Subagent = z.infer<typeof SubagentSchema>
export type Command = z.infer<typeof CommandSchema>
export type Registry = z.infer<typeof RegistrySchema>

export interface BwcConfig {
  version: string
  registry: string
  paths: {
    subagents: string
    commands: string
  }
  installed: {
    subagents: string[]
    commands: string[]
  }
}