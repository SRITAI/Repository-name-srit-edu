import type { SupportConversation, SupportMessage } from './contracts'

export class SupportRequestError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export async function supportRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const result = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new SupportRequestError(result.error || 'Support is unavailable. Please try again.', response.status)
  return result as T
}

export function messageFromBroadcast(value: unknown): SupportMessage | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string' || typeof item.conversation_id !== 'string' ||
      (item.sender_type !== 'student' && item.sender_type !== 'employee') ||
      typeof item.sender_display_name !== 'string' || typeof item.body !== 'string' ||
      typeof item.created_at !== 'string') return null
  return {
    id: item.id,
    conversation_id: item.conversation_id,
    sender_type: item.sender_type,
    sender_display_name: item.sender_display_name,
    body: item.body,
    created_at: item.created_at,
  }
}

export function mergeMessages(existing: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  const byId = new Map(existing.map((message) => [message.id, message]))
  for (const message of incoming) byId.set(message.id, message)
  return [...byId.values()].sort((a, b) =>
    a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
}

export async function readConversationMessages(basePath: string, conversationId: string): Promise<SupportMessage[]> {
  let offset = 0
  let messages: SupportMessage[] = []
  while (true) {
    const result = await supportRequest<{ messages: SupportMessage[]; nextOffset: number | null }>(
      `${basePath}?conversationId=${encodeURIComponent(conversationId)}&offset=${offset}`,
    )
    messages = mergeMessages(messages, result.messages)
    if (result.nextOffset === null) return messages
    offset = result.nextOffset
  }
}

export type StudentConversationResponse = { conversation: SupportConversation | null }
export type EmployeeConversationsResponse = { conversations: SupportConversation[] }
export type SendMessageResponse = { message: SupportMessage }
