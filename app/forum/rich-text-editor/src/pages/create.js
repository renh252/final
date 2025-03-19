'use client'
import React, { useContext } from 'react'
import Layout from '../components/common/Layout'
import RichTextEditor from '../components/editor/RichTextEditor'
import SaveButton from '../components/editor/SaveButton'
import { EditorContext } from '../context/EditorContext'

const CreatePage = () => {
  const { content, setContent } = useContext(EditorContext)

  const handleContentChange = (newContent) => {
    setContent(newContent)
  }

  return (
    <Layout>
      <div className="container mt-5">
        <h1 className="mb-4">創建新文章</h1>
        <RichTextEditor onChange={handleContentChange} />
        <SaveButton content={content} />
      </div>
    </Layout>
  )
}

export default CreatePage