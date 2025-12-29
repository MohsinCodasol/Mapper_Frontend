import { useDropzone } from "react-dropzone";
import { uploadExcel, fetchHeaders } from "../api/excelApi";
import { useState } from "react";
import Loader from "./Loader";

export default function UploadExcel({ onHeadersLoaded }) {
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [headerDepth, setHeaderDepth] = useState("");
  const [error, setError] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    multiple: false,
    onDrop: async (files) => {
      try {
        setLoading(true);
        const res = await uploadExcel(files[0]);
        setFileId(res.data.file_id); // ✅ store file id
      } catch (e) {
        setError("Upload failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = async () => {
    if (!headerDepth || headerDepth < 1) {
      setError("Enter valid header depth");
      return;
    }

    try {
      setLoading(true);
      const res = await fetchHeaders(fileId, Number(headerDepth));
      const { headers, bases, header_depth } = res.data;
      onHeadersLoaded({
        file_id: fileId,        
        headers: headers,        
        bases: bases,
        header_depth: header_depth
      });
    } catch (e) {
      setError("Failed to read headers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader text="Processing Excel..." />}

      <div className="container py-5">

        {/* Upload Card */}
        <div
          {...getRootProps()}
          className={`card mx-auto p-4 text-center ${
            isDragActive ? "border-primary" : ""
          }`}
          style={{ maxWidth: 420, cursor: "pointer", borderStyle: "dashed" }}
        >
          <input {...getInputProps()} />
          <div className="fs-1">📊</div>
          <h5 className="mt-2">Upload Excel</h5>
          <p className="text-muted mb-0">
            Drag & drop or click to browse
          </p>
        </div>

        {/* Header Depth Input */}
        <div className="card mt-4 mx-auto p-4" style={{ maxWidth: 420 }}>
          <h5 className="mb-3 text-center">Header Depth</h5>

          <input
            type="number"
            min="1"
            className="form-control"
            placeholder="Enter header depth"
            value={headerDepth}
            onChange={(e) => setHeaderDepth(e.target.value)}
            disabled={!fileId}   // ✅ disabled until upload
          />

          <small className="text-muted d-block mt-2 text-center">
            Enter number of header rows in Excel
          </small>

          <button
            className="btn btn-primary w-100 mt-3"
            onClick={handleSubmit}
            disabled={!fileId}
          >
            Continue
          </button>

          {error && (
            <div className="alert alert-danger mt-3 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
