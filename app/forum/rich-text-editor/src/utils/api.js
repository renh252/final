import axios from 'axios';

const API_BASE_URL = '/api';

export const uploadImage = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const saveArticle = async (articleData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/articles`, articleData);
    return response.data;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
};

export const fetchArticles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/articles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};