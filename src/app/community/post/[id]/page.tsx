'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then((posts: any[]) => {
        const found = posts.find((p: any) => p.id === id)
        if (!found) throw new Error('Post not found')
        setPost(found)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/2" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-400">{error || 'Post not found'}</p>
        <Link href="/community" className="text-purple-400 hover:underline mt-4 inline-block">
          &larr; Back to community
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/community" className="text-purple-400 hover:underline text-sm">
        &larr; Back to community
      </Link>

      <article className="mt-4 sm:mt-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
          <span>By {post.author?.name || post.author?.email || 'Unknown'}</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
          {post.content}
        </div>
      </article>

      {/* Comments */}
      <section className="mt-10 sm:mt-12">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Comments ({post.comments?.length || 0})
        </h2>

        {(!post.comments || post.comments.length === 0) ? (
          <p className="text-gray-500 text-sm sm:text-base">No comments yet. Start the discussion!</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {post.comments.map((comment: any) => (
              <div key={comment.id} className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-2">
                  <span className="font-medium text-purple-300">
                    {comment.author?.name || comment.author?.email}
                  </span>
                  <span className="hidden sm:inline">&middot;</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-200 text-sm sm:text-base">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
