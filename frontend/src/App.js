import React, { useState } from "react";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSequence([]);
    setErrors([]);
    setFileContent("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrors([{ reason: "Please select a file first." }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setSequence([]);
    setFileContent("");

    const formData = new FormData();
    formData.append("bookingsFile", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setFileContent(data.fileContent || ""); // Save content on error
        throw new Error(data.details || "File processing failed.");
      }

      setSequence(data.sequence || []);
      setErrors(data.errors || []);
      setFileContent(data.fileContent || "");
    } catch (err) {
      setErrors([{ reason: err.message }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1> Bus Boarding Sequence Generator</h1>
        <p>Upload a booking file to get the correct boarding order.</p>
        <div className="upload-container">
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? "Processing..." : "Generate Sequence"}
          </button>
        </div>
      </header>

      {errors.length > 0 && (
        <div className="error-popup">
          <h3> An Error Occurred</h3>
          <ul>
            {errors.map((err, index) => (
              <li key={index}>{err.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {sequence.length > 0 && (
        <div className="results-container">
          <h2>Boarding Order</h2>
          <table>
            <thead>
              <tr>
                <th>Seq</th>
                <th>Booking_ID</th>
              </tr>
            </thead>
            <tbody>
              {sequence.map((item) => (
                <tr key={item.seq}>
                  <td>{item.seq}</td>
                  <td>{item.bookingId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* This will now show on success OR error, as long as file content exists */}
      {fileContent && (
        <div className="results-container file-content-display">
          <h2>Uploaded File Content</h2>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
