import { createClient } from '@/lib/supabase/server'

export default async function UpdatesPage() {
  const supabase = createClient()
  const { data: updates } = await supabase
    .from('announcements')
    .select('id, title, description, image_url, publish_date')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-semibold text-navy-900">New Updates</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        New courses, question papers, scholarship announcements, and board updates.
      </p>

      <div className="mt-10 space-y-6">
        {updates?.length ? (
          updates.map((update) => (
            <article key={update.id} className="rounded-lg border border-neutral-200 p-6">
              {update.publish_date && (
                <p className="text-sm text-neutral-500">
                  {new Date(update.publish_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              <h2 className="mt-1 text-lg font-semibold text-navy-900">{update.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{update.description}</p>
            </article>
          ))
        ) : (
          <p className="text-neutral-600">No updates published yet — check back soon.</p>
        )}
      </div>
    </div>
  )
}
