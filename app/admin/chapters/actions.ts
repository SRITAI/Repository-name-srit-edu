'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function createChapterAction(formData: FormData) {
  const { supabase } = await requireAdmin('/admin/chapters/new')

  const courseId = String(formData.get('courseId') || '').trim()
  const subjectId = String(formData.get('subjectId') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const sortOrder = Number(formData.get('sortOrder') || 0)

  if (!courseId || !subjectId) {
    return redirect(
      '/admin/chapters/new?error=' + encodeURIComponent('Please select a course and subject.')
    )
  }
  if (!title) {
    return redirect(
      '/admin/chapters/new?error=' + encodeURIComponent('Chapter title is required.')
    )
  }
  if (!Number.isFinite(sortOrder)) {
    return redirect(
      '/admin/chapters/new?error=' + encodeURIComponent('Sort order must be a number.')
    )
  }

  // ── Server-side relationship verification ──────────────
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .single()
  if (courseErr || !course) {
    return redirect('/admin/chapters/new?error=' + encodeURIComponent('Selected course not found.'))
  }

  const { data: subject, error: subjErr } = await supabase
    .from('course_subjects')
    .select('id, course_id')
    .eq('id', subjectId)
    .single()
  if (subjErr || !subject || subject.course_id !== courseId) {
    return redirect(
      '/admin/chapters/new?error=' + encodeURIComponent('Selected subject does not belong to the selected course.')
    )
  }

  // ── Insert chapter ─────────────────────────────────────
  const { error } = await supabase.from('course_chapters').insert({
    course_subject_id: subjectId,
    title,
    sort_order: Math.trunc(sortOrder),
  })

  if (error) {
    return redirect(
      '/admin/chapters/new?error=' + encodeURIComponent('Could not create chapter: ' + error.message)
    )
  }

  revalidatePath('/admin/chapters')
  revalidatePath('/admin/materials/new')

  redirect('/admin/chapters?success=1')
}

export async function updateChapterAction(formData: FormData) {
  const { supabase } = await requireAdmin('/admin/chapters')

  const id = String(formData.get('id') || '').trim()
  const courseId = String(formData.get('courseId') || '').trim()
  const subjectId = String(formData.get('subjectId') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const sortOrder = Number(formData.get('sortOrder') || 0)

  if (!id) {
    return redirect('/admin/chapters?error=' + encodeURIComponent('Chapter ID is required.'))
  }
  if (!courseId || !subjectId) {
    return redirect(
      `/admin/chapters/${id}/edit?error=` + encodeURIComponent('Please select a course and subject.')
    )
  }
  if (!title) {
    return redirect(
      `/admin/chapters/${id}/edit?error=` + encodeURIComponent('Chapter title is required.')
    )
  }
  if (!Number.isFinite(sortOrder)) {
    return redirect(
      `/admin/chapters/${id}/edit?error=` + encodeURIComponent('Sort order must be a number.')
    )
  }

  // ── Verify chapter exists and fetch current subject ─────
  const { data: existingChapter, error: fetchErr } = await supabase
    .from('course_chapters')
    .select('id, course_subject_id')
    .eq('id', id)
    .single()
  if (fetchErr || !existingChapter) {
    return redirect('/admin/chapters?error=' + encodeURIComponent('Chapter not found.'))
  }

  // ── Verify the new subject belongs to the selected course ──
  const { data: subject, error: subjErr } = await supabase
    .from('course_subjects')
    .select('id, course_id')
    .eq('id', subjectId)
    .single()
  if (subjErr || !subject || subject.course_id !== courseId) {
    return redirect(
      `/admin/chapters/${id}/edit?error=` + encodeURIComponent('Selected subject does not belong to the selected course.')
    )
  }

  // ── Update chapter ─────────────────────────────────────
  const { error } = await supabase
    .from('course_chapters')
    .update({
      course_subject_id: subjectId,
      title,
      sort_order: Math.trunc(sortOrder),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return redirect(
      `/admin/chapters/${id}/edit?error=` + encodeURIComponent('Could not update chapter: ' + error.message)
    )
  }

  revalidatePath('/admin/chapters')
  revalidatePath('/admin/materials/new')
  revalidatePath('/admin/materials')

  redirect('/admin/chapters?success=1')
}

export async function deleteChapterAction(formData: FormData) {
  const { supabase } = await requireAdmin('/admin/chapters')

  const id = String(formData.get('id') || '').trim()

  if (!id) {
    return redirect('/admin/chapters?error=' + encodeURIComponent('Missing chapter id.'))
  }

  // ── Check for dependent course_files ───────────────────
  const { data: files, error: filesErr } = await supabase
    .from('course_files')
    .select('id')
    .eq('course_chapter_id', id)
    .limit(1)

  if (filesErr) {
    return redirect(
      '/admin/chapters?error=' + encodeURIComponent('Could not verify chapter dependencies: ' + filesErr.message)
    )
  }

  if (files && files.length > 0) {
    return redirect(
      '/admin/chapters?error=' + encodeURIComponent(
        'Cannot delete chapter: it has study materials attached. Please remove the materials first.'
      )
    )
  }

  // ── Delete chapter ─────────────────────────────────────
  const { error } = await supabase.from('course_chapters').delete().eq('id', id)

  if (error) {
    return redirect(
      '/admin/chapters?error=' + encodeURIComponent('Could not delete chapter: ' + error.message)
    )
  }

  revalidatePath('/admin/chapters')
  revalidatePath('/admin/materials/new')
  revalidatePath('/admin/materials')

  redirect('/admin/chapters?success=1')
}