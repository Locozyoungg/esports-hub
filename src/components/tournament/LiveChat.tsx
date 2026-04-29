'use client'

import { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'

let socket: any

export default function LiveChat({ tournamentId, userId }: { tournamentId: string; userId?: string }) {
  const [messages, setMessages] = useState<{ user: string; text: string; time: Date }[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    socket = io('/api/socket')
    socket.emit('join-tournament', tournamentId)

    socket.on('chat-message', (msg: any) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      socket.disconnect()
    }
  }, [tournamentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit('send-message', {
      tournamentId,
      userId: userId || 'anonymous',
      text: input,
      time: new Date()
    })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-white/10 rounded p-2">
            <span className="font-bold text-purple-300">{msg.user}: </span>
            <span>{msg.text}</span>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(msg.time).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">
          Send
        </button>
      </div>
    </div>
  )
}
