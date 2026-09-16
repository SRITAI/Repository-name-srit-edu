'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin/courses')
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createCourseAction(formData: FormData) {
  await requireAdmin()

  const supabase = createAdminClient()

  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || 'pcm')
  const description = String(formData.get('description') || '').trim()
  const languageValue = String(formData.get('languages') || 'en')
  const price = Number(formData.get('price') || 0)
  const originalPrice = Number(formData.get('original_price') || 0)
  const paperYears = Number(formData.get('paper_analysis_years') || 5)

  if (!title) {
    throw new Error('Course title is required')
  }

  const languages =
    languageValue === 'en-hi' ? ['en', 'hi'] : [languageValue]

  const slug = makeSlug(title)

  const { error } = await (supabase as any)
    .from('courses')
    .insert({
      slug,
      title,
      category,
      description,
      languages,
      price_paise: Math.round(price * 100),
      original_price_paise: Math.round(originalPrice * 100),
      is_published: formData.get('is_published') === 'on',
      ncert_based: formData.get('ncert_based') === 'on',
      board_focused: formData.get('board_focused') === 'on',
      paper_analysis_years: paperYears,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/courses')
  revalidatePath('/courses')

  redirect('/admin/courses')
}

export async function updateCourseAction(formData: FormData) {
  await requireAdmin()

  const supabase = createAdminClient()

  const id = String(formData.get('id') || '')
  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || 'pcm')
  const description = String(formData.get('description') || '').trim()
  const languageValue = String(formData.get('languages') || 'en')
  const price = Number(formData.get('price') || 0)
  const originalPrice = Number(formData.get('original_price') || 0)
  const paperYears = Number(formData.get('paper_analysis_years') || 5)

  if (!id) throw new Error('Course ID is required')
  if (!title) throw new Error('Course title is required')

  const languages =
    languageValue === 'en-hi' ? ['en', 'hi'] : [languageValue]

  const slug = makeSlug(title)

  const { error } = await (supabase as any)
    .from('courses')
    .update({
      slug,
      title,
      category,
      description,
      languages,
      price_paise: Math.round(price * 100),
      original_price_paise: Math.round(originalPrice * 100),
      is_published: formData.get('is_published') === 'on',
      ncert_based: formData.get('ncert_based') === 'on',
      board_focused: formData.get('board_focused') === 'on',
      paper_analysis_years: paperYears,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/courses')
  revalidatePath('/courses')

  redirect('/admin/courses')
}

export async function toggleCoursePublishAction(formData: FormData) {
  await requireAdmin()

  const supabase = createAdminClient()

  const id = String(formData.get('id') || '')
  const current = String(formData.get('is_published') || '') === 'true'

  if (!id) throw new Error('Course ID is required')

  const { error } = await (supabase as any)
    .from('courses')
    .update({
      is_published: !current,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/courses')
  revalidatePath('/courses')
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin()

  const supabase = createAdminClient()

  const id = String(formData.get('id') || '')

  if (!id) throw new Error('Course ID is required')

  const { error } = await (supabase as any)
    .from('courses')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/courses')
  revalidatePath('/courses')
}
