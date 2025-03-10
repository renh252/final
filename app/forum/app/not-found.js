import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

const NotFound = () => {
    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger" className="text-center">
                        <h1>404 - 找不到頁面</h1>
                        <p>抱歉，您所尋找的頁面不存在。</p>
                    </Alert>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;