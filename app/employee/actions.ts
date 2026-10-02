'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedEmployee } from '@/lib/employee/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
]
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const VALID_FEEDBACK_CATEGORIES = [
  'general',
  'courses',
  'materials',
  'dashboard',
  'mobile_ui',
  'checkout',
  'other',
]

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical']

const VALID_DEVICE_TYPES = ['desktop', 'mobile', 'tablet', 'other']

/**
 * Server Action: Submit Employee Website Feedback with optional screenshot or PDF attachment.
 */
export async function submitEmployeeFeedbackAction(formData: FormData) {
  // 1. Authoritative Server-side Authentication & Active Employee Verification
  const authResult = await getAuthenticatedEmployee()
  if (authResult.status !== 'authenticated' || !authResult.employeeProfile) {
    redirect('/employee/login?error=' + encodeURIComponent('Please sign in to submit feedback.'))
  }

  const { employeeProfile } = authResult

  // 2. Input Sanitization & Field Extraction
  const category = String(formData.get('category') || 'general').trim().toLowerCase()
  const whatExplored = String(formData.get('whatExplored') || '').trim()
  const whatLiked = String(formData.get('whatLiked') || '').trim()
  const improvementPoints = String(formData.get('improvementPoints') || '').trim()
  const featureSuggestion = String(formData.get('featureSuggestion') || '').trim()
  const priority = String(formData.get('priority') || 'medium').trim().toLowerCase()
  const comments = String(formData.get('comments') || '').trim()
  const attachment = formData.get('attachment') as File | null

  // 3. Validation: Required Text Fields
  if (!whatExplored || !whatLiked || !improvementPoints) {
    redirect(
      '/employee?feedbackError=' +
        encodeURIComponent('Please fill in what you explored, what you liked, and points for improvement.') +
        '#feedback'
    )
  }

  let screenshotPath: string | null = null

  // 4. Attachment Validation & Storage (PNG, JPG, JPEG, WEBP, PDF <= 5 MB)
  if (attachment && typeof attachment === 'object' && attachment.size > 0) {
    if (attachment.size > MAX_FILE_SIZE_BYTES) {
      redirect(
        '/employee?feedbackError=' +
          encodeURIComponent('Attachment exceeds maximum allowed size of 5 MB.') +
          '#feedback'
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(attachment.type)) {
      redirect(
        '/employee?feedbackError=' +
          encodeURIComponent('Invalid file type. Supported formats: PNG, JPG, JPEG, WEBP, or PDF.') +
          '#feedback'
      )
    }

    try {
      const buffer = Buffer.from(await attachment.arrayBuffer())
      const sanitizedName = (attachment.name || 'attachment')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase()
      // Enforce auth.uid() folder boundary: {employee_id}/feedback/{timestamp}-{name}
      const storagePath = `${employeeProfile.id}/feedback/${Date.now()}-${sanitizedName}`

      const admin = createAdminClient()
      const { error: uploadError } = await admin.storage
        .from('employee-screenshots')
        .upload(storagePath, buffer, {
          contentType: attachment.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('[Feedback Upload Error]', uploadError)
        redirect(
          '/employee?feedbackError=' +
            encodeURIComponent('Failed to upload attachment. Please try again.') +
            '#feedback'
        )
      }

      screenshotPath = storagePath
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
      console.error('[Feedback Attachment Processing Error]', err)
      redirect(
        '/employee?feedbackError=' +
          encodeURIComponent('Error processing attachment.') +
          '#feedback'
      )
    }
  }

  // 5. Database INSERT (public.employee_feedback only)
  try {
    const admin = createAdminClient()
    const { error: insertError } = await (admin as any).from('employee_feedback').insert({
      employee_id: employeeProfile.id,
      category: VALID_FEEDBACK_CATEGORIES.includes(category) ? category : 'general',
      what_explored: whatExplored,
      what_liked: whatLiked,
      improvement_points: improvementPoints,
      feature_suggestion: featureSuggestion || null,
      priority: VALID_PRIORITIES.includes(priority) ? priority : 'medium',
      comments: comments || null,
      screenshot_path: screenshotPath,
    })

    if (insertError) {
      console.error('[Feedback Insert Error]', insertError)
      redirect(
        '/employee?feedbackError=' +
          encodeURIComponent('Could not save feedback. Please try again.') +
          '#feedback'
      )
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[Feedback Save Exception]', err)
    redirect(
      '/employee?feedbackError=' +
        encodeURIComponent('An unexpected error occurred while saving feedback.') +
        '#feedback'
    )
  }

  revalidatePath('/employee')
  redirect('/employee?feedbackSuccess=1#feedback')
}

/**
 * Server Action: Submit Employee Bug / Technical Issue Report with optional screenshot or PDF attachment.
 */
export async function submitEmployeeIssueAction(formData: FormData) {
  // 1. Authoritative Server-side Authentication & Active Employee Verification
  const authResult = await getAuthenticatedEmployee()
  if (authResult.status !== 'authenticated' || !authResult.employeeProfile) {
    redirect('/employee/login?error=' + encodeURIComponent('Please sign in to report an issue.'))
  }

  const { employeeProfile } = authResult

  // 2. Input Sanitization & Field Extraction
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const pageSection = String(formData.get('pageSection') || '').trim()
  const deviceType = String(formData.get('deviceType') || 'desktop').trim().toLowerCase()
  const priority = String(formData.get('priority') || 'medium').trim().toLowerCase()
  const comments = String(formData.get('comments') || '').trim()
  const attachment = formData.get('attachment') as File | null

  // 3. Validation: Required Text Fields
  if (!title || !description || !pageSection) {
    redirect(
      '/employee?issueError=' +
        encodeURIComponent('Please provide issue title, page/section, and detailed description.') +
        '#issues'
    )
  }

  let screenshotPath: string | null = null

  // 4. Attachment Validation & Storage (PNG, JPG, JPEG, WEBP, PDF <= 5 MB)
  if (attachment && typeof attachment === 'object' && attachment.size > 0) {
    if (attachment.size > MAX_FILE_SIZE_BYTES) {
      redirect(
        '/employee?issueError=' +
          encodeURIComponent('Attachment exceeds maximum allowed size of 5 MB.') +
          '#issues'
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(attachment.type)) {
      redirect(
        '/employee?issueError=' +
          encodeURIComponent('Invalid file type. Supported formats: PNG, JPG, JPEG, WEBP, or PDF.') +
          '#issues'
      )
    }

    try {
      const buffer = Buffer.from(await attachment.arrayBuffer())
      const sanitizedName = (attachment.name || 'attachment')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase()
      // Enforce auth.uid() folder boundary: {employee_id}/issues/{timestamp}-{name}
      const storagePath = `${employeeProfile.id}/issues/${Date.now()}-${sanitizedName}`

      const admin = createAdminClient()
      const { error: uploadError } = await admin.storage
        .from('employee-screenshots')
        .upload(storagePath, buffer, {
          contentType: attachment.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('[Issue Upload Error]', uploadError)
        redirect(
          '/employee?issueError=' +
            encodeURIComponent('Failed to upload attachment. Please try again.') +
            '#issues'
        )
      }

      screenshotPath = storagePath
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
      console.error('[Issue Attachment Processing Error]', err)
      redirect(
        '/employee?issueError=' +
          encodeURIComponent('Error processing attachment.') +
          '#issues'
      )
    }
  }

  // 5. Database INSERT (public.employee_issues only)
  try {
    const admin = createAdminClient()
    const { error: insertError } = await (admin as any).from('employee_issues').insert({
      employee_id: employeeProfile.id,
      title,
      description,
      page_section: pageSection,
      device_type: VALID_DEVICE_TYPES.includes(deviceType) ? deviceType : 'desktop',
      priority: VALID_PRIORITIES.includes(priority) ? priority : 'medium',
      comments: comments || null,
      screenshot_path: screenshotPath,
      resolution_status: 'open',
    })

    if (insertError) {
      console.error('[Issue Insert Error]', insertError)
      redirect(
        '/employee?issueError=' +
          encodeURIComponent('Could not submit issue report. Please try again.') +
          '#issues'
      )
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[Issue Save Exception]', err)
    redirect(
      '/employee?issueError=' +
        encodeURIComponent('An unexpected error occurred while reporting the issue.') +
        '#issues'
    )
  }

  revalidatePath('/employee')
  redirect('/employee?issueSuccess=1#issues')
}
