export default function Loader({ text = "Processing Excel..." }) {
  return (
    <div className="loader-overlay">
      <div className="card shadow text-center p-4">
        <div
          className="spinner-border text-primary mx-auto"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-3 fw-semibold">{text}</p>
      </div>
    </div>
  );
}
