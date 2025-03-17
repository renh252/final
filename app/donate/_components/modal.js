import { Modal, Button } from 'react-bootstrap'

export default function RescueModal({
  isOpen,
  closeModal,
  title,
  description,
  image,
}) {
  return (
    <Modal show={isOpen} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {image && (
          <img src={image} alt={title} className="w-100 rounded mb-3" />
        )}
        <p>{description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          關閉
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
