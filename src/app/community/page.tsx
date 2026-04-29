'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import PostCard from '@/components/community/PostCard'
import CreatePost from '@/components/community/CreatePost'

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Community Hub</h1>
      {session && <CreatePost onPostCreated={() => window.location.reload()} />}
      <div className="space-y-6 mt-8">
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
