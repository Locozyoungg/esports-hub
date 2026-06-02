import Link from 'next/link'

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <Link href={`/community/post/${post.id}`} className="block">
        <h2 className="text-2xl font-semibold hover:text-purple-400 transition">
          {post.title}
        </h2>
      </Link>
      <p className="text-gray-400 mt-2">
        by {post.author.name || post.author.email} • {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <p className="mt-3 line-clamp-2">{post.content}</p>
      <div className="mt-4 flex gap-4 text-sm text-gray-400">
        <span>💬 {post.comments.length} comments</span>
      </div>
    </div>
  )
}
