'use client'

import React, { useContext, useState } from 'react'
import { Input } from 'react-chat-elements'
import { ChatContext } from '../../context/ChatContext'

const ChatInput = () => {
  const { sendMessage, user } = useContext(ChatContext)
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if (message.trim() && user) {
      sendMessage(message)
      setMessage('')
    }
  }

  return (
    <div className="chat-input">
      <Input
        placeholder={
          user ? 'Type a message...' : 'Please log in to send a message'
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        disabled={!user}
        multiline={false}
      />
      <button
        className="btn btn-primary"
        onClick={handleSendMessage}
        disabled={!user}
      >
        Send
      </button>
    </div>
  )
}

export default ChatInput
