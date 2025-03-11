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
        
        if (isActive || isHovered) {
            return {
                backgroundColor: '#C79650',
                borderColor: '#C79650',
                color: 'white'
            };
        } else {
            return {
                backgroundColor: '#D9D9D9',
                borderColor: '#D9D9D9',
                color: 'black'
            };
        }
    };

    return (
        <div className="d-flex justify-content-center mt-4 mb-4">
            <BootstrapPagination>
                <BootstrapPagination.Prev 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    style={currentPage !== 1 ? getItemStyle('prev') : {}}
                    onMouseEnter={() => setHoveredPage('prev')}
                    onMouseLeave={() => setHoveredPage(null)}
                />
                
                {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
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
                })}
                
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