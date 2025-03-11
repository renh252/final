# Article Page App

This project is a simple article page application built with React and Next.js. It allows users to view individual articles, interact with them, and leave comments. The application is designed with responsive web design principles to ensure a seamless experience across different devices.

## Project Structure

```
article-page-app
├── app
│   ├── article
│   │   ├── [id]
│   │   │   └── page.js          # Main component for individual article pages
│   │   └── page.js              # Main page for articles
│   ├── api
│   │   └── articles
│   │       ├── [id]
│   │       │   └── route.js     # API route for fetching individual article data
│   │       └── route.js         # API route for fetching list of articles
│   ├── components
│   │   ├── ArticleCard.jsx      # Component for displaying article cards
│   │   ├── ArticleContent.jsx    # Component for displaying article content
│   │   ├── ArticleHeader.jsx     # Component for article header
│   │   ├── CommentSection.jsx    # Component for displaying comments and input
│   │   ├── Footer.jsx            # Component for footer content
│   │   ├── Header.jsx            # Component for header and navigation
│   │   ├── Layout.jsx            # Layout component for consistent structure
│   │   ├── RelatedArticles.jsx   # Component for displaying related articles
│   │   └── ShareButtons.jsx      # Component for social media share buttons
│   ├── context
│   │   └── ArticleContext.js     # Context for managing article and comment state
│   ├── hooks
│   │   └── useArticle.js         # Custom hook for fetching and managing article data
│   ├── styles
│   │   ├── article.module.css     # Styles specific to article pages
│   │   └── globals.css           # Global styles for the application
│   ├── utils
│   │   └── formatDate.js         # Utility function for formatting dates
│   ├── layout.js                  # Layout structure for the application
│   └── page.js                    # Home page of the application
├── public
│   └── images
│       └── placeholder.svg       # Placeholder image for articles without images
├── .eslintrc.json                # ESLint configuration file
├── .gitignore                    # Files and folders to ignore in version control
├── jsconfig.json                 # JavaScript configuration file for editor support
├── next.config.js                # Next.js configuration file
├── package.json                  # npm configuration file with dependencies and scripts
└── README.md                     # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd article-page-app
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

## Features

- View individual articles with detailed content.
- Interact with articles through like and save buttons.
- Leave comments on articles.
- Responsive design for optimal viewing on various devices.
- Fetch articles and comments via API.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.