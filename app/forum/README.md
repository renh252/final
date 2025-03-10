# Forum Website

This project is a forum website built using React and Next.js, utilizing Bootstrap for styling. It features a dynamic API for fetching articles, a user-friendly interface for browsing content, and a responsive design for various devices.

## Project Structure

```
forum
├── api
│   └── forum
│       ├── article
│       │   └── [id]
│       │       └── route.ts
│       ├── featured
│       │   └── route.ts
│       └── list
│           └── route.ts
├── app
│   ├── forum
│   │   ├── article
│   │   │   └── [id]
│   │   │       └── page.js
│   │   └── list
│   │       └── page.js
│   ├── search
│   │   └── page.js
│   ├── loading.js
│   └── not-found.js
├── components
│   ├── ButtonGroup.js
│   ├── Carousel.js
│   ├── NavTabs.js
│   ├── Pagination.js
│   ├── PinnedCard.js
│   ├── PostList.js
│   └── SearchBox.js
├── context
│   └── ArticleContext.tsx
├── pages
│   ├── _app.js
│   ├── _document.js
│   └── index.js
├── public
│   └── images
├── styles
│   └── globals.css
├── package.json
├── tsconfig.json
└── README.md
```

## Features

1. **Dynamic API Routes**: 
   - Fetch individual article details by ID.
   - Retrieve featured articles for the homepage.
   - Support pagination for article listings.

2. **Responsive Design**: 
   - Built with Bootstrap to ensure a mobile-friendly layout.

3. **User Interface Components**:
   - Carousel for featured articles.
   - Button group for category filtering.
   - Navigation tabs for sorting articles.
   - Search functionality for easy content discovery.
   - Pagination for navigating through article lists.

4. **Global State Management**: 
   - Utilizes React Context API to manage article data and application state.

5. **Loading and Error Handling**: 
   - Includes loading indicators and custom error pages for a better user experience.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd forum
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.