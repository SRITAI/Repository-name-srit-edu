export type SupportMessage = {
  id: string
  conversation_id: string
  sender_type: 'student' | 'employee'
  sender_display_name: string
  body: string
  created_at: string
}

export type SupportConversation = {
  id: string
  student_display_name: string
  status: 'open' | 'closed'
  created_at: string
  updated_at: string
}

export type SupportConversationBroadcast = Pick<
  SupportConversation,
  'student_display_name' | 'status' | 'updated_at'
> & { conversation_id: string }

export const SUPPORT_MESSAGE_SELECT =
  'id, conversation_id, sender_type, sender_display_name, body, created_at'

export const SUPPORT_CONVERSATION_SELECT =
  'id, student_display_name, status, created_at, updated_at'

// Migration 0008 sends private Broadcast events named "conversation" and "message".
// The employee topic suffix is the Supabase auth user UUID, not the employee code.
export const SUPPORT_EMPLOYEES_TOPIC = 'support:employees'
export const supportStudentTopic = (studentUserId: string) =>
  `support:student:${studentUserId}`
export const supportEmployeeTopic = (employeeUserId: string) =>
  `support:employee:${employeeUserId}`

export const SUPPORT_CONVERSATION_EVENT = 'conversation'
export const SUPPORT_MESSAGE_EVENT = 'message'
