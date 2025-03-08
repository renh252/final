import React from 'react';
import { Nav } from 'react-bootstrap';
import Link from 'next/link';

export default function Navigation() {
  return (
    <Nav className="mb-4">
      <Nav.Item>
        <Link href="/forum/popular" passHref>
          <Nav.Link>热门</Nav.Link>
        </Link>
      </Nav.Item>
      <Nav.Item>
        <Link href="/forum/latest" passHref>
          <Nav.Link>最新</Nav.Link>
        </Link>
      </Nav.Item>
      <Nav.Item>
        <Link href="/forum/rules" passHref>
          <Nav.Link>板规</Nav.Link>
        </Link>
      </Nav.Item>
    </Nav>
  );
}