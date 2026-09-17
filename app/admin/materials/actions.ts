'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin'

export const BUCKET_NAME = 'Course files'
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const ALLOWED_LANGUAGES = ['hi', 'en'] as const

function sanitizeFileName(name: string): string {
  return (
    name
      .toLowerCase()
      // keep letters, numbers, spaces/hyphens; replace everything else with a hyphen
      .replace(/[^\p{L}\p{N}\s-]/gu, '-')
      .replace(/[\s]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file'
  )
}

function isPdf(file: File): boolean {
  if (file.type === 'application/pdf') return true
  return /\.pdf$/i.test(file.name)
}

function uniqueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Upload ───────────────────────────────────────────
export async function uploadMaterial(formData: FormData) {
  const { supabase } = await requireAdmin('/admin/materials/new')

  const courseId = String(formData.get('courseId') || '').trim()
  const subjectId = String(formData.get('subjectId') || '').trim()
  const chapterId = String(formData.get('chapterId') || '').trim()
  const language = String(formData.get('language') || '').trim()
  const fileName = String(formData.get('fileName') || '').trim()
  const sortOrderRaw = Number(formData.get('sortOrder') || 0)
  const file = formData.get('file')

  if (!courseId || !subjectId || !chapterId) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Please select a course, subject and chapter.')
    )
  }
  if (!ALLOWED_LANGUAGES.includes(language as any)) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Please select a valid language (Hindi or English).')
    )
  }
  if (!fileName) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('File name is required.')
    )
  }
  if (!Number.isFinite(sortOrderRaw)) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Sort order must be a number.')
    )
  }

  if (!(file instanceof File) || file.size === 0) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Please select a PDF file to upload.')
    )
  }
  if (!isPdf(file)) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Only PDF files are allowed.')
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('File size must be less than 25 MB.')
    )
  }

  // ── Server-side relationship verification ────────────
  // Never trust client-supplied IDs; verify the full
  // course → subject → chapter chain.
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .single()
  if (courseErr || !course) {
    return redirect('/admin/materials/new?error=' + encodeURIComponent('Selected course not found.'))
  }

  const { data: subject, error: subjErr } = await supabase
    .from('course_subjects')
    .select('id, course_id')
    .eq('id', subjectId)
    .single()
  if (subjErr || !subject || subject.course_id !== courseId) {
    return redirect('/admin/materials/new?error=' + encodeURIComponent('Selected subject does not belong to the selected course.'))
  }

  const { data: chapter, error: chapErr } = await supabase
    .from('course_chapters')
    .select('id, course_subject_id')
    .eq('id', chapterId)
    .single()
  if (chapErr || !chapter || chapter.course_subject_id !== subjectId) {
    return redirect('/admin/materials/new?error=' + encodeURIComponent('Selected chapter does not belong to the selected subject.'))
  }

  const safeBase = sanitizeFileName(file.name)
  const storagePath = `courses/${courseId}/${subjectId}/${chapterId}/${uniqueId()}-${safeBase}.pdf`

  // ── Upload to private bucket (service role, server only) ──
  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await admin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, arrayBuffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Storage upload failed: ' + uploadError.message)
    )
  }

  // ── Insert record ────────────────────────────────────
  const { error: dbError } = await supabase.from('course_files').insert({
    course_chapter_id: chapterId,
    language,
    storage_path: storagePath,
    file_name: fileName,
    sort_order: Math.trunc(sortOrderRaw),
  })

  if (dbError) {
    // Best-effort cleanup of the orphaned upload.
    await admin.storage.from(BUCKET_NAME).remove([storagePath]).catch(() => {})
    return redirect(
      '/admin/materials/new?error=' + encodeURIComponent('Could not save the file record: ' + dbError.message)
    )
  }

  revalidatePath('/admin/materials')
  return redirect('/admin/materials?success=1')
}

// ── Delete ────────────────────────────────────────────
export async function deleteMaterial(formData: FormData) {
  const { supabase } = await requireAdmin('/admin/materials')

  const id = String(formData.get('id') || '').trim()
  if (!id) {
    return redirect('/admin/materials?error=' + encodeURIComponent('Missing file id.'))
  }

  const { data: file, error: fetchErr } = await supabase
    .from('course_files')
    .select('id, storage_path, file_name')
    .eq('id', id)
    .single()
  if (fetchErr || !file) {
    return redirect('/admin/materials?error=' + encodeURIComponent('Study material not found.'))
  }

  const admin = createAdminClient()
  const { error: storageError } = await admin.storage.from(BUCKET_NAME).remove([file.storage_path])
  if (storageError) {
    return redirect('/admin/materials?error=' + encodeURIComponent('Could not delete file from storage: ' + storageError.message))
  }

  const { error: dbError } = await supabase.from('course_files').delete().eq('id', id)
  if (dbError) {
    return redirect('/admin/materials?error=' + encodeURIComponent('Could not delete the study material record: ' + dbError.message))
  }

  revalidatePath('/admin/materials')
  return redirect('/admin/materials?success=1')
}

