import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/common/Layout';
import RichTextEditor from '../../components/editor/RichTextEditor';
import SaveButton from '../../components/editor/SaveButton';
import { EditorContext } from '../../context/EditorContext';
import { fetchArticleById } from '../../utils/api';

const EditPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { setEditorContent } = useContext(EditorContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const loadArticle = async () => {
        try {
          const article = await fetchArticleById(id);
          setEditorContent(article.content);
        } catch (err) {
          setError('Failed to load article');
        } finally {
          setLoading(false);
        }
      };

      loadArticle();
    }
  }, [id, setEditorContent]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Layout>
      <h1>Edit Article</h1>
      <RichTextEditor />
      <SaveButton />
    </Layout>
  );
};

export default EditPage;