"use client"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Determine which page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxDisplayedPages = 5

    if (totalPages <= maxDisplayedPages) {
      // Show all pages if there are only a few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show a range of pages around the current page
      const leftSide = Math.floor(maxDisplayedPages / 2)
      let start = currentPage - leftSide

      if (start < 1) {
        start = 1
      }

      let end = start + maxDisplayedPages - 1

      if (end > totalPages) {
        end = totalPages
        start = end - maxDisplayedPages + 1
        if (start < 1) {
          start = 1
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.unshift("...")
        pages.unshift(1)
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <nav aria-label="Forum pagination">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous"
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">◀</span>
          </button>
        </li>

        {getPageNumbers().map((page, index) => (
          <li
            key={index}
            className={`page-item ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => (page !== "..." ? onPageChange(page) : null)}
              disabled={page === "..."}
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next"
            disabled={currentPage === totalPages}
          >
            <span aria-hidden="true">▶</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

