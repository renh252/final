'use client'

import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import ChatBox from './Chat/ChatBox'

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button
        variant="primary"
        className="chat-button"
        onClick={toggleChat}
        style={{ position: 'fixed', bottom: '20px', right: '20px' }}
      >
        Chat
      </Button>
      {isOpen && <ChatBox />}
    </>
  )
}

export default ChatButton
