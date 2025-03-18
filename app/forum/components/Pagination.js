'use client';
import React, { useState } from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [hoveredPage, setHoveredPage] = useState(null);

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const getItemStyle = (pageNum) => {
        const isActive = pageNum === currentPage;
        const isHovered = pageNum === hoveredPage;

        if (isActive) {
            return {
                backgroundColor: '#C79650',
                borderColor: '#C79650',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
            };
        } else if (isHovered) {
            return {
                backgroundColor: '#C79650',
                borderColor: '#C79650',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
            };
        } else {
            return {
                backgroundColor: '#D9D9D9',
                borderColor: '#D9D9D9',
                color: 'black',
                cursor: 'pointer',
                transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
            };
        }
    };

    const getEllipsisItem = (key) => (
        <BootstrapPagination.Ellipsis
            key={key}
            style={{
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                color: 'black',
                cursor: 'default',
            }}
        />
    );

    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, currentPage - halfVisiblePages);
        let endPage = Math.min(totalPages, currentPage + halfVisiblePages);

        if (currentPage <= halfVisiblePages) {
            endPage = Math.min(totalPages, maxVisiblePages);
        } else if (currentPage + halfVisiblePages >= totalPages) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <BootstrapPagination.Item
                    key={1}
                    onClick={() => handlePageChange(1)}
                    style={getItemStyle(1)}
                    onMouseEnter={() => setHoveredPage(1)}
                    onMouseLeave={() => setHoveredPage(null)}
                >
                    1
                </BootstrapPagination.Item>
            );
            if (startPage > 2) {
                items.push(getEllipsisItem('start-ellipsis'));
            }
        }

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            items.push(
                <BootstrapPagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                    style={getItemStyle(pageNum)}
                    onMouseEnter={() => setHoveredPage(pageNum)}
                    onMouseLeave={() => setHoveredPage(null)}
                >
                    {pageNum}
                </BootstrapPagination.Item>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(getEllipsisItem('end-ellipsis'));
            }
            items.push(
                <BootstrapPagination.Item
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    style={getItemStyle(totalPages)}
                    onMouseEnter={() => setHoveredPage(totalPages)}
                    onMouseLeave={() => setHoveredPage(null)}
                >
                    {totalPages}
                </BootstrapPagination.Item>
            );
        }

        return items;
    };

    return (
        <div className="d-flex justify-content-center mt-4 mb-4">
            <style>
                {`
                .page-item.active .page-link {
                    background-color: #C79650 !important;
                    border-color: #C79650 !important;
                    color: white !important;
                }
                `}
            </style>
            <BootstrapPagination>
                <BootstrapPagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={currentPage !== 1 ? getItemStyle('prev') : {}}
                    onMouseEnter={() => setHoveredPage('prev')}
                    onMouseLeave={() => setHoveredPage(null)}
                />
                {getPaginationItems()}
                <BootstrapPagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={currentPage !== totalPages ? getItemStyle('next') : {}}
                    onMouseEnter={() => setHoveredPage('next')}
                    onMouseLeave={() => setHoveredPage(null)}
                />
            </BootstrapPagination>
        </div>
    );
};

export default Pagination;