import { Spinner } from 'react-bootstrap'

interface LoadingSpinnerProps {
  fullscreen?: boolean
}

export default function LoadingSpinner({
  fullscreen = false,
}: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
        style={{ zIndex: 1050 }}
      >
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center p-4">
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">載入中...</span>
      </Spinner>
    </div>
  )
}
