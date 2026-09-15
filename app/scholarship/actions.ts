'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitScholarshipApplication(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/scholarship')
  }

  const fields = {
    full_name: String(formData.get('fullName') || '').trim(),
    mobile_number: String(formData.get('mobileNumber') || '').trim(),
    email: String(formData.get('email') || '').trim() || null,
    class: String(formData.get('class') || '').trim(),
    education: String(formData.get('education') || '').trim() || null,
    school_name: String(formData.get('schoolName') || '').trim(),
    school_address: String(formData.get('schoolAddress') || '').trim(),
    district: String(formData.get('district') || '').trim(),
    state: String(formData.get('state') || '').trim(),
    father_name: String(formData.get('fatherName') || '').trim(),
    mother_name: String(formData.get('motherName') || '').trim(),
    caste: String(formData.get('caste') || '').trim() || null,
  }

  const required: (keyof typeof fields)[] = [
    'full_name',
    'mobile_number',
    'class',
    'school_name',
    'school_address',
    'district',
    'state',
    'father_name',
    'mother_name',
  ]

  for (const key of required) {
    if (!fields[key]) {
      redirect('/scholarship?error=' + encodeURIComponent('Please fill in every required field.'))
    }
  }

  const { data: appNumber, error: rpcError } = await (supabase as any).rpc(
    'generate_scholarship_application_number'
  )

  if (rpcError || !appNumber) {
    redirect(
      '/scholarship?error=' +
        encodeURIComponent('Something went wrong generating your application ID. Please try again.')
    )
  }

  const { error } = await supabase.from('scholarship_applications').insert({
    ...fields,
    user_id: user.id,
    application_number: appNumber,
  })

  if (error) {
    redirect(
      '/scholarship?error=' + encodeURIComponent('Could not submit your application. Please try again.')
    )
  }

  redirect('/scholarship?success=' + encodeURIComponent(appNumber as string))
}
