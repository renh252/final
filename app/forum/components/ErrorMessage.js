import React from 'react';

const ErrorMessage = ({ message }) => {
    return (
        <div className="error-message">
            <h2>Error</h2>
            <p>{message}</p>
        </div>
    );
};

export default ErrorMessage;