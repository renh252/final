# Forum Website

This project is a forum website built using React and Next.js, styled with Bootstrap. It includes various features such as article listing, search functionality, and a dynamic API for fetching articles.

## Project Structure

```
forum
├── api
│   └── forum
│       ├── article
│       │   └── [id]
│       │       └── route.js        # Dynamic API route for fetching article details by ID
│       ├── featured
│       │   └── route.js            # API for fetching featured articles
│       └── list
│           └── route.js            # API for fetching paginated list of articles
├── app
│   └── forum
│       ├── article
│       │   └── [id]
│       │       └── page.js          # Page for displaying a single article
│       ├── list
│       │   └── page.js              # Main forum page displaying articles
│       └── search
│           └── page.js              # Page for displaying search results
├── components
│   ├── ButtonGroup.js               # Component for button group to filter articles
│   ├── Carousel.js                   # Carousel component for featured articles
│   ├── NavTabs.js                    # Navigation tabs for article categories
│   ├── Pagination.js                 # Pagination component for navigating through articles
│   ├── PinnedCard.js                 # Card component for displaying pinned articles
│   ├── PostList.js                   # List component for displaying articles
│   └── SearchBox.js                  # Search input component for searching articles
├── context
│   └── ArticleContext.js             # Context API for managing article state
├── app
│   ├── loading.js                    # Loading component displayed during data fetching
│   └── not-found.js                  # Custom 404 page
├── package.json                      # NPM configuration file
├── next.config.js                   # Next.js configuration file
└── README.md                        # Project documentation
```

## Features

- **Dynamic API Routes**: The project includes dynamic API routes for fetching article details, featured articles, and paginated lists of articles.
- **Responsive Design**: The website is designed to be responsive, ensuring a good user experience on both desktop and mobile devices.
- **Search Functionality**: Users can search for articles using keywords, with results displayed on a dedicated search results page.
- **Article Filtering**: Users can filter articles by categories using a button group.
- **Loading Indicators**: A loading spinner is displayed while data is being fetched from the API.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd forum
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the forum website.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.