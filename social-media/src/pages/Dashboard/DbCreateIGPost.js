import React, { useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase';

const InstagramConnect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  
  // AI post generation states
  const [showAiModal, setShowAiModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Replace these with your actual values
  const igUserId = '17841472108405468';
  const accessToken = 'EAAM9zMmQC2kBO3ZANDQhpiWAUoUtZCZApCWIBc4anpua506x1i0qtjzoCGReCx75eEmnQ2ZCZCdGPZCkqcdn9Ym5b2pogF6s51z0rm8ujs3jScNhp1IIUTbz7OKyIqI1bRr6UsqUlLU844tuj9DlpgvQsTJHcKLtF5EkGypdnW5ltwPDUFycJkSlaGWxktlR0LwkOz03adfEwL8yT9hTvNQ7Ayh9wZD';

  useEffect(() => {
    // Clear file preview when imageUrl is manually entered
    if (imageUrl && file) {
      setFile(null);
    }
  }, [imageUrl]);

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a temporary URL for preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setImageUrl(''); // Clear the image URL input when file is selected
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError('Please select an image');
        return;
      }
      setImageUploadError(null);
      setImageUploadProgress(0);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUrl(downloadURL);
            setImageUploadProgress(null);
            setImageUploadError(null);
          });
        }
      );
    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const createMediaContainer = async () => {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.id; // Returns the container ID
  };

  const publishMedia = async (containerId) => {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data; // Returns the published media ID
  };

  const postToInstagram = async () => {
    if (!imageUrl || !caption) {
      setError('Please provide both image URL and caption');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const containerId = await createMediaContainer();
      console.log('Media Container ID:', containerId);
      const publishedMedia = await publishMedia(containerId);
      console.log('Published Media:', publishedMedia);
      setSuccess(true);
      // Clear form after successful post
      setImageUrl('');
      setCaption('');
      setPreviewUrl('');
      setFile(null);
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // AI Post Generation Functions
  const generateAiPost = async () => {
    if (!prompt) {
      setGenerationError('Please enter a prompt');
      return;
    }

    setGeneratingPost(true);
    setGenerationError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate post');
      }

      const data = await response.json();
      console.log('Generated Post Data:', data);
      
      // Set the generated data to the form
      setImageUrl(data.image_url);
      setCaption(data.post);
      setPreviewUrl(data.image_url);
      
      // Close the modal
      setShowAiModal(false);
      setPrompt('');
      
      // Display trending data indicator if applicable
      if (data.used_trending_data) {
        console.log('Post created with trending data insights');
      }
      
    } catch (error) {
      console.error('Error generating AI post:', error);
      setGenerationError(error.message);
    } finally {
      setGeneratingPost(false);
    }
  };

  // AI Modal Component
  const AiPostGeneratorModal = () => {
    if (!showAiModal) return null;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={styles.modalTitle}>Generate AI Post</h2>
          <p style={styles.modalDescription}>
            Enter a prompt describing the post you want to create
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={styles.modalTextarea}
            placeholder="E.g., 'Create a motivational post about persistence' or 'Make a post about healthy breakfast ideas'"
          />
          
          {generationError && (
            <p style={styles.error}>{generationError}</p>
          )}
          
          <div style={styles.modalButtons}>
            <button 
              onClick={() => setShowAiModal(false)}
              style={styles.modalCancelButton}
            >
              Cancel
            </button>
            <button
              onClick={generateAiPost}
              disabled={generatingPost || !prompt}
              style={{
                ...styles.modalGenerateButton,
                opacity: (generatingPost || !prompt) ? 0.7 : 1
              }}
            >
              {generatingPost ? 'Generating...' : 'Generate Post'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Post to Instagram</h1>
      
      <div style={styles.formContainer}>
        <div style={styles.aiButtonContainer}>
          <button 
            onClick={() => setShowAiModal(true)}
            style={styles.aiButton}
          >
            ✨ Generate AI Post
          </button>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={handleImageUrlChange}
            style={styles.input}
            placeholder="Enter image URL"
            disabled={imageUploadProgress !== null}
          />
          <p style={styles.orText}>OR</p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload Image</label>
          <div style={styles.fileInputContainer}>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              style={styles.fileInput}
              id="file-upload"
              disabled={imageUploadProgress !== null}
            />
            <label htmlFor="file-upload" style={styles.fileInputLabel}>
              {file ? file.name : 'Choose file'}
            </label>
            <button
              onClick={handleUploadImage}
              disabled={!file || imageUploadProgress !== null}
              style={{
                ...styles.uploadButton,
                opacity: (!file || imageUploadProgress !== null) ? 0.7 : 1
              }}
            >
              Upload
            </button>
          </div>
          {imageUploadProgress !== null && (
            <div style={styles.progressContainer}>
              <div 
                style={{
                  ...styles.progressBar,
                  width: `${imageUploadProgress}%`
                }}
              ></div>
              <span style={styles.progressText}>{imageUploadProgress}%</span>
            </div>
          )}
          {imageUploadError && <p style={styles.error}>{imageUploadError}</p>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={styles.textarea}
            placeholder="Enter your caption"
          />
        </div>

        {previewUrl && (
          <div style={styles.imagePreviewContainer}>
            <h3 style={styles.previewTitle}>Preview</h3>
            <img
              src={previewUrl}
              alt="Preview"
              style={styles.imagePreview}
              onError={() => setPreviewUrl('')}
            />
          </div>
        )}

        <button
          onClick={postToInstagram}
          disabled={loading || !imageUrl || !caption}
          style={{
            ...styles.button,
            opacity: (loading || !imageUrl || !caption) ? 0.7 : 1
          }}
        >
          {loading ? 'Posting...' : 'Post to Instagram'}
        </button>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>Posted successfully!</p>}
      </div>
      
      {/* AI Post Generator Modal */}
      <AiPostGeneratorModal />
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#070E1E',
    color: '#E2E8F0',
  },
  title: {
    color: '#E2E8F0',
    marginBottom: '2rem',
    fontSize: '2rem',
  },
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#0F172A',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  aiButtonContainer: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  aiButton: {
    padding: '12px 20px',
    backgroundColor: '#6D28D9',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#94A3B8',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#E2E8F0',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#E2E8F0',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  fileInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  fileInput: {
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: -1,
  },
  fileInputLabel: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#E2E8F0',
    fontSize: '1rem',
    cursor: 'pointer',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textAlign: 'center',
  },
  uploadButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#4F46E5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  progressContainer: {
    marginTop: '10px',
    height: '20px',
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#E2E8F0',
    fontSize: '0.8rem',
  },
  orText: {
    textAlign: 'center',
    margin: '10px 0',
    color: '#94A3B8',
  },
  imagePreviewContainer: {
    margin: '20px auto',
    padding: '10px',
    backgroundColor: '#1E293B',
    borderRadius: '8px',
    width: 'fit-content',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  previewTitle: {
    color: '#94A3B8',
    fontSize: '1rem',
    marginBottom: '10px',
  },
  imagePreview: {
    maxWidth: '300px',
    maxHeight: '300px',
    border: '2px solid #334155',
    borderRadius: '4px',
    backgroundColor: '#0F172A',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#8B5CF6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  error: {
    color: '#EF4444',
    marginTop: '10px',
  },
  success: {
    color: '#10B981',
    marginTop: '10px',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  },
  modalTitle: {
    color: '#E2E8F0',
    marginBottom: '0.5rem',
    fontSize: '1.5rem',
    textAlign: 'center',
  },
  modalDescription: {
    color: '#94A3B8',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  modalTextarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#E2E8F0',
    fontSize: '1rem',
    minHeight: '150px',
    resize: 'vertical',
    marginBottom: '1.5rem',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  modalCancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#334155',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  modalGenerateButton: {
    flex: 2,
    padding: '10px',
    backgroundColor: '#8B5CF6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  },
};

export default InstagramConnect;