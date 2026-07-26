'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import PostCard from '@/components/community/PostCard'
import CreatePost from '@/components/community/CreatePost'

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('Failed to load posts')
      const data = await res.json()
      setPosts(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handlePostCreated = () => {
    fetchPosts()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Community Hub</h1>

      {session && <CreatePost onPostCreated={handlePostCreated} />}

      {loading ? (
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 rounded-xl p-4 sm:p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-3" />
              <div className="h-4 bg-white/10 rounded w-1/5 mb-4" />
              <div className="h-12 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 sm:mt-8 card p-6 sm:p-8 text-center">
          <p className="text-red-400 mb-2">Failed to load posts</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 text-purple-400 hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-6 sm:mt-8 card p-6 sm:p-8 text-center">
          <p className="text-gray-400 text-lg">No posts yet</p>
          <p className="text-gray-500 text-sm mt-2">
            {session ? 'Be the first to create a post!' : 'Sign in to start a discussion.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
