import React, { useState } from "react";
import axios from "axios";

const AIPostGenerator = () => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePost = async () => {
    if (!description) {
      setError("Please enter a description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/generate_post", {
        description,
      });

      // Ensure the response contains the expected data
      if (response.data && response.data.image_url && response.data.caption && response.data.hashtags) {
        setImage(response.data.image_url);
        setCaption(response.data.caption);
        setHashtags(response.data.hashtags);
      } else {
        throw new Error("Invalid response from the server");
      }
    } catch (error) {
      console.error("Error generating post:", error);
      setError("Failed to generate post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI-Powered Post Generator</h2>

      <textarea
        style={styles.textarea}
        rows="4"
        placeholder="Enter a description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      {error && <p style={styles.error}>{error}</p>}

      <button
        style={styles.button}
        onClick={handleGeneratePost}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Post"}
      </button>

      {image && (
        <div style={styles.resultContainer}>
          <img
            src={image}
            alt="Generated"
            style={styles.image}
          />
          <p style={styles.caption}>{caption}</p>
          <p style={styles.hashtags}>{hashtags.join(" ")}</p>
        </div>
      )}
    </div>
  );
};

// Basic inline styles
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "20px",
  },
  resultContainer: {
    marginTop: "20px",
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  caption: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  hashtags: {
    color: "#666",
  },
};

export default AIPostGenerator;