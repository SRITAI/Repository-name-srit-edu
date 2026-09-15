'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCourse(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin/courses/new')
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

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

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const languages =
    languageValue === 'en-hi'
      ? ['en', 'hi']
      : [languageValue]

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

  redirect('/admin/courses')
}
