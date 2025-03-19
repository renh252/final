'use client'

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'assets', 'images');

const handler = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Image upload failed' });
    }

    const file = files.file[0];
    const newPath = path.join(uploadDir, file.originalFilename);

    fs.rename(file.filepath, newPath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'File move failed' });
      }

      const imageUrl = `/assets/images/${file.originalFilename}`;
      res.status(200).json({ url: imageUrl });
    });
  });
};

export default handler;