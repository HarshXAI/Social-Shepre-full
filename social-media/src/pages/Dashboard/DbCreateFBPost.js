import React, { useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase';

const FacebookPostCreator = () => {
  const [postMessage, setPostMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);

  const accessToken = 'EAAM9zMmQC2kBO24NGSZALikxqySvVqRQF5i1NdzHUrJHhQEKegwpWeh4zCTdTQHZC9xT1f63LdCH3QSzdWPlIVYw4njqt4A8ZCgq1Y7fks790ZC1ERAgzs937PpFp7IBU9rwhOZCtcJZCBlBN6tLQQcH6ZB7EaQ2Rcc0JskB38XO1vw2lp5mBVhlFxryvlxZAz13bsZAe474NprgUOoD0HOz4pd3G'; // Replace with your actual Facebook access token
  const userProfilePicture = `https://graph.facebook.com/me/picture?access_token=${accessToken}`;

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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!postMessage.trim() && !imageUrl.trim()) {
      setError('Post must contain either a message or an image.');
      setLoading(false);
      return;
    }

    try {
      let postData;
      let apiUrl;

      if (imageUrl.trim()) {
        // Post with an image
        apiUrl = `https://graph.facebook.com/v22.0/591873497331588/photos?access_token=${accessToken}`;
        postData = {
          url: imageUrl,
          caption: postMessage,
        };
      } else {
        // Post only text
        apiUrl = `https://graph.facebook.com/v22.0/591873497331588/feed?access_token=${accessToken}`;
        postData = {
          message: postMessage,
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Post published successfully!');
        setPostMessage('');
        setImageUrl('');
        setCharCount(0);
        setPreviewUrl('');
        setFile(null);
      } else {
        throw new Error(data.error?.message || 'Failed to post.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Facebook Post</h1>
      
      <div style={styles.formContainer}>
        <div style={styles.userInfo}>
          <img 
            src={userProfilePicture} 
            alt="Profile" 
            style={styles.profilePic}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/40';
            }}
          />
          <span style={styles.userName}>Your Facebook Page</span>
        </div>

        <div style={styles.inputGroup}>
          <textarea
            value={postMessage}
            onChange={(e) => {
              setPostMessage(e.target.value);
              setCharCount(e.target.value.length);
            }}
            placeholder="What's on your mind?"
            rows="4"
            maxLength="63206"
            style={styles.textarea}
          />
          <span style={styles.charCount}>{charCount}/63206</span>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="Enter image URL"
            style={styles.input}
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

        {previewUrl && (
          <div style={styles.postPreviewContainer}>
            <div style={styles.previewHeader}>
              <h3 style={styles.previewTitle}>Post Preview</h3>
            </div>
            <div style={styles.previewContent}>
              {postMessage && (
                <p style={styles.previewText}>{postMessage}</p>
              )}
              <img
                src={previewUrl}
                alt="Preview"
                style={styles.imagePreview}
                onError={() => setPreviewUrl('')}
              />
            </div>
          </div>
        )}

        <button
          onClick={handlePostSubmit}
          disabled={loading || (!postMessage.trim() && !imageUrl.trim())}
          style={{
            ...styles.button,
            opacity: (loading || (!postMessage.trim() && !imageUrl.trim())) ? 0.7 : 1
          }}
        >
          {loading ? 'Posting...' : 'Post to Facebook'}
        </button>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </div>
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
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '0.5rem',
    borderRadius: '8px',
  },
  profilePic: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  userName: {
    color: '#E2E8F0',
    fontWeight: 'bold',
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
    minHeight: '120px',
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
  postPreviewContainer: {
    margin: '20px 0',
    border: '1px solid #334155',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  previewHeader: {
    borderBottom: '1px solid #334155',
    padding: '10px',
    backgroundColor: '#0F172A',
  },
  previewTitle: {
    color: '#94A3B8',
    fontSize: '1rem',
    margin: 0,
  },
  previewContent: {
    padding: '15px',
  },
  previewText: {
    color: '#E2E8F0',
    margin: '0 0 15px 0',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
  imagePreview: {
    maxWidth: '100%',
    borderRadius: '8px',
    backgroundColor: '#0F172A',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  charCount: {
    color: '#94A3B8',
    fontSize: '0.875rem',
    display: 'block',
    textAlign: 'right',
    marginTop: '5px',
  },
  button: {
    width: '100%',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#1877F2', // Facebook blue
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '20px',
  },
  error: {
    color: '#EF4444',
    marginTop: '10px',
  },
  success: {
    color: '#10B981',
    marginTop: '10px',
  },
};

export default FacebookPostCreator;