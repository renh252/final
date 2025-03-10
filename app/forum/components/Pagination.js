'use client';
import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (page) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <BootstrapPagination>
            <BootstrapPagination.Prev 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
            />
            {[...Array(totalPages)].map((_, index) => (
                <BootstrapPagination.Item 
                    key={index + 1} 
                    active={index + 1 === currentPage} 
                    onClick={() => handlePageChange(index + 1)}
                >
                    {index + 1}
                </BootstrapPagination.Item>
            ))}
            <BootstrapPagination.Next 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
            />
        </BootstrapPagination>
    );
};

export default Pagination;