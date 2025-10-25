import React, { useState, useEffect } from 'react';
import './uploading.css';
import PostCalendar from './postcalendar'; // Import the calendar component

const UnifiedPostingPage = () => {
  // Platform selection state
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'calendar'

  // Common state variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Facebook specific state variables
  const [fbMessage, setFbMessage] = useState('');
  const [fbImageUrl, setFbImageUrl] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Instagram specific state variables
  const [igCaption, setIgCaption] = useState('');
  const [igImageUrl, setIgImageUrl] = useState('');

  // AI post generation states
  const [showAiModal, setShowAiModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Scheduled posts state
  const [scheduledPosts, setScheduledPosts] = useState([]);

  // Load scheduled posts from localStorage on component mount
  useEffect(() => {
    const facebookPosts = JSON.parse(localStorage.getItem('scheduledFacebookPosts')) || [];
    const instagramPosts = JSON.parse(localStorage.getItem('scheduledInstagramPosts')) || [];
    setScheduledPosts([...facebookPosts, ...instagramPosts]);
  }, []);

  // Save scheduled posts to localStorage
  const saveScheduledPost = (platform, post) => {
    const storageKey = platform === 'facebook' ? 'scheduledFacebookPosts' : 'scheduledInstagramPosts';
    const existingPosts = JSON.parse(localStorage.getItem(storageKey)) || [];
    localStorage.setItem(storageKey, JSON.stringify([...existingPosts, post]));
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
      if (selectedPlatform === 'facebook') {
        setFbMessage(data.post);
        setFbImageUrl(data.image_url);
      } else if (selectedPlatform === 'instagram') {
        setIgCaption(data.post);
        setIgImageUrl(data.image_url);
      }

      setShowAiModal(false);
      setPrompt('');
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
            placeholder="E.g., 'Create a motivational post about persistence'"
          />

          {generationError && <p style={styles.error}>{generationError}</p>}

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
                opacity: generatingPost || !prompt ? 0.7 : 1,
              }}
            >
              {generatingPost ? 'Generating...' : 'Generate Post'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle Post Submission
  const handlePostSubmission = async () => {
    if (!isScheduled) {
      // Immediate post logic
      const newPost = {
        platform: selectedPlatform,
        message: selectedPlatform === 'facebook' ? fbMessage : igCaption,
        imageUrl: selectedPlatform === 'facebook' ? fbImageUrl : igImageUrl || null, // Optional image URL
        date: new Date().toISOString().split('T')[0], // Today's date
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Current time
      };

      saveScheduledPost(selectedPlatform, newPost);

      setScheduledPosts((prevPosts) => [...prevPosts, newPost]);
      setSuccess('Post published successfully!');
      setTimeout(() => setSuccess(null), 3000);

      // Clear form fields
      setFbMessage('');
      setFbImageUrl('');
      setIgCaption('');
      setIgImageUrl('');
      return;
    }

    // Scheduled post logic
    if (!scheduledDate || !scheduledTime) {
      setError('Please select a date and time for scheduling.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newScheduledPost = {
      platform: selectedPlatform,
      message: selectedPlatform === 'facebook' ? fbMessage : igCaption,
      imageUrl: selectedPlatform === 'facebook' ? fbImageUrl : igImageUrl || null, // Optional image URL
      date: scheduledDate,
      time: scheduledTime,
    };

    saveScheduledPost(selectedPlatform, newScheduledPost);

    setScheduledPosts((prevPosts) => [...prevPosts, newScheduledPost]);
    setSuccess('Post scheduled successfully!');
    setTimeout(() => setSuccess(null), 3000);

    // Clear form fields
    setFbMessage('');
    setFbImageUrl('');
    setIgCaption('');
    setIgImageUrl('');
    setScheduledDate('');
    setScheduledTime('');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Social Media Post Creator</h1>

      <div style={styles.viewToggle}>
        <button
          onClick={() => setViewMode('form')}
          style={{
            ...styles.toggleButton,
            backgroundColor: viewMode === 'form' ? '#6D28D9' : '#1E293B',
          }}
        >
          Form View
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          style={{
            ...styles.toggleButton,
            backgroundColor: viewMode === 'calendar' ? '#6D28D9' : '#1E293B',
          }}
        >
          Calendar View
        </button>
      </div>

      {viewMode === 'form' ? (
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
            <label style={styles.label}>Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              style={styles.input}
            >
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          {selectedPlatform === 'facebook' ? (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Message</label>
                <textarea
                  value={fbMessage}
                  onChange={(e) => {
                    setFbMessage(e.target.value);
                    setCharCount(e.target.value.length);
                  }}
                  style={styles.textarea}
                  placeholder="What's on your mind?"
                  maxLength="63206"
                />
                <p style={styles.charCounter}>{charCount}/63206</p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Image URL (Optional)</label>
                <input
                  type="text"
                  value={fbImageUrl}
                  onChange={(e) => setFbImageUrl(e.target.value)}
                  style={styles.input}
                  placeholder="Enter image URL (optional)"
                />
              </div>
            </>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Caption</label>
                <textarea
                  value={igCaption}
                  onChange={(e) => setIgCaption(e.target.value)}
                  style={styles.textarea}
                  placeholder="Write your caption"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Image URL (Optional)</label>
                <input
                  type="text"
                  value={igImageUrl}
                  onChange={(e) => setIgImageUrl(e.target.value)}
                  style={styles.input}
                  placeholder="Enter image URL (optional)"
                />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={() => setIsScheduled(!isScheduled)}
                style={styles.checkbox}
              />
              Schedule for later
            </label>

            {isScheduled && (
              <div style={styles.schedulingContainer}>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          <button
            onClick={handlePostSubmission}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          {/* Scheduled Posts Section */}
          <div style={styles.scheduledPostsContainer}>
            <h3 style={styles.scheduledPostsTitle}>Scheduled Posts</h3>
            {scheduledPosts.length > 0 ? (
              <ul style={styles.scheduledPostsList}>
                {scheduledPosts.map((post, index) => (
                  <li key={index} style={styles.scheduledPostItem}>
                    <p>
                      <strong>Platform:</strong> {post.platform}
                    </p>
                    <p>
                      <strong>Message:</strong> {post.message}
                    </p>
                    <p>
                      <strong>Date:</strong> {post.date} <strong>Time:</strong>{' '}
                      {post.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.noScheduledPosts}>No scheduled posts yet.</p>
            )}
          </div>
        </div>
      ) : (
        <PostCalendar />
      )}

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
  viewToggle: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  toggleButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    color: '#E2E8F0',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
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
    fontSize: '1rem',
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
    minHeight: '100px',
    resize: 'vertical',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  schedulingContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#8B5CF6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  error: {
    color: '#EF4444',
    marginTop: '10px',
  },
  success: {
    color: '#10B981',
    marginTop: '10px',
  },
  scheduledPostsContainer: {
    marginTop: '2rem',
    backgroundColor: '#1E293B',
    padding: '1rem',
    borderRadius: '8px',
    color: '#E2E8F0',
  },
  scheduledPostsTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#E2E8F0',
  },
  scheduledPostsList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  scheduledPostItem: {
    backgroundColor: '#0F172A',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    color: '#E2E8F0',
  },
  noScheduledPosts: {
    color: '#94A3B8',
  },
};

export default UnifiedPostingPage;
