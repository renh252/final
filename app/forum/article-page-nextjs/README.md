# Article Page Next.js

This project is a simple blog application built with React and Next.js. It features individual article pages that dynamically fetch and display article content based on the article ID. The application is designed to be responsive and user-friendly.

## Project Structure

- **app/api/forum/article/[id]/route.js**: Handles API requests to fetch article details based on the article ID using the GET method.
- **app/forum/article/[id]/page.js**: Main component for individual article pages, utilizing `useEffect` to fetch article data and render different UI states based on loading and error conditions.
- **app/components/Article/ArticleBody.js**: Displays the main content of the article, supporting Markdown parsing and video embedding.
- **app/components/Article/ArticleHeader.js**: Shows the article title, author information, publication date, and category tags.
- **app/components/Article/ArticleFooter.js**: Contains interactive buttons for liking, saving, and sharing the article.
- **app/components/Article/Comments.js**: Displays the comments section, including an input box for new comments and a list of existing comments, with support for sorting and pagination.
- **app/components/UI/Loading.js**: Displays a loading spinner while article data is being fetched.
- **app/components/UI/ErrorMessage.js**: Shows error messages when API requests fail or when an article is not found.
- **app/components/layout/Header.js**: Displays the website title and navigation bar.
- **app/components/layout/Footer.js**: Contains footer information for the website.
- **app/components/layout/Sidebar.js**: Displays sidebar content, such as popular articles or category lists.
- **app/loading.js**: Global loading state file that shows a loading indicator when the page is loading.
- **app/not-found.js**: Displays an error message when an article is not found.
- **app/layout.js**: Defines the overall layout of the application, including header and footer components.
- **lib/api.js**: Contains functions for API requests, encapsulating the logic for interacting with the backend.
- **lib/utils.js**: Includes utility functions, such as date formatting.
- **public/fonts**: Directory for font files.
- **public/images**: Directory for image files, such as article avatars or other media.
- **styles/globals.css**: Contains global style settings.
- **styles/article.module.css**: Contains specific styles for the article page.
- **next.config.js**: Configuration settings for Next.js.
- **package.json**: Lists project dependencies and scripts.
- **README.md**: Project description and usage instructions.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd article-page-nextjs
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Features

- Dynamic article fetching based on ID.
- Responsive design for mobile and desktop views.
- Interactive components for user engagement.
- Error handling for API requests.
- Loading indicators for better user experience.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.