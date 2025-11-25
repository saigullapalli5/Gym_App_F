import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log("Testing API connection to:", API_URL);
        const response = await fetch(`${API_URL}/api/test`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResponse(data);
        setApiStatus("✅ Connected Successfully!");
      } catch (err) {
        console.error("API Test Error:", err);
        setError(err.message);
        setApiStatus("❌ Connection Failed");
      }
    };

    testApiConnection();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        maxWidth: "600px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2>API Connection Test</h2>
      <p>
        <strong>API URL:</strong> {API_URL}
      </p>
      <p>
        <strong>Status:</strong> {apiStatus}
      </p>

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <p>
            <strong>Error:</strong> {error}
          </p>
          <p>
            Make sure your backend server is running and the URL is correct.
          </p>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h4>Response from server:</h4>
          <pre
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "4px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
