export default function ErrorMessage({ message }) {
  return (
    <div className="alert alert-danger my-3" role="alert">
      {message}
    </div>
  )
}

