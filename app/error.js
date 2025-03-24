'use client';

import { useEffect } from 'react';
import { Button } from 'react-bootstrap';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // 將錯誤記錄到錯誤報告服務
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
      <h2 className="mb-4">出了點問題</h2>
      <p className="mb-4">很抱歉，應用程序遇到了錯誤。</p>
      <Button
        onClick={() => reset()}
        style={{ backgroundColor: '#C79650', borderColor: '#C79650' }}
      >
        重試
      </Button>
    </div>
  );
}
