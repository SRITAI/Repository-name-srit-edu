'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitContactMessage(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const mobileNumber = String(formData.get('mobileNumber') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!name || !mobileNumber || !email || !message) {
    redirect('/contact-us?error=' + encodeURIComponent('Please fill in every field.'))
  }

  const supabase = createClient()
  const { error } = await supabase.from('contact_messages').insert({
    name,
    mobile_number: mobileNumber,
    email,
    message,
  })

  if (error) {
    redirect('/contact-us?error=' + encodeURIComponent('Could not send your message. Please try again.'))
  }

  redirect('/contact-us?success=1')
}
