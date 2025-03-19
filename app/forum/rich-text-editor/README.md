# Rich Text Editor Project

This project is a rich text editor built with Next.js, utilizing WangEditor for the editing functionality. It provides a user-friendly interface for creating and editing content, with features such as image uploading and text formatting.

## Features

- **Rich Text Editing**: Users can create and format text using a variety of tools provided by WangEditor.
- **Image Uploading**: Supports image uploads through a custom API, allowing users to insert images into their content.
- **Responsive Design**: Built with Bootstrap to ensure a responsive layout that works on various devices.
- **Global State Management**: Utilizes React Context for managing the editor's state across components.

## Project Structure

```
rich-text-editor
├── public
│   └── assets
│       └── images
│           └── placeholder.svg
├── src
│   ├── components
│   │   ├── common
│   │   │   ├── Footer.js
│   │   │   ├── Header.js
│   │   │   └── Layout.js
│   │   └── editor
│   │       ├── EditorToolbar.js
│   │       ├── ImageUploader.js
│   │       ├── RichTextEditor.js
│   │       └── SaveButton.js
│   ├── context
│   │   └── EditorContext.js
│   ├── hooks
│   │   └── useEditor.js
│   ├── lib
│   │   └── editorConfig.js
│   ├── pages
│   │   ├── api
│   │   │   └── upload
│   │   │       └── image.js
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── create.js
│   │   ├── edit
│   │   │   └── [id].js
│   │   └── index.js
│   ├── styles
│   │   ├── editor.css
│   │   └── globals.css
│   └── utils
│       ├── api.js
│       └── formatter.js
├── .eslintrc.json
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd rich-text-editor
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the development server, run:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.