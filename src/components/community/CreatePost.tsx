'use client'

import { useState } from 'react'

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
    setLoading(false)
    setTitle('')
    setContent('')
    onPostCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
        required
      />
      <textarea
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-base font-medium w-full sm:w-auto"
      >
        {loading ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  )
}
