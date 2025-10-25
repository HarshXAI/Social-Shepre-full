import React, { useState } from 'react';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';

const API_KEY = "87054B13-4D6F4852-ADAF65BC-99B8B62C"; // Replace with your Ayrshare API key

const LinkedInFeed = () => {
  const [feedData, setFeedData] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [platforms, setPlatforms] = useState(['linkedin']); // Default to LinkedIn
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handlePostSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("https://api.ayrshare.com/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          post: postContent,
          platforms,
          mediaUrls: mediaUrls ? mediaUrls.split(',').map((url) => url.trim()) : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post to Ayrshare");
      }

      setSuccess("Post published successfully!");
      console.log("Ayrshare Response:", data);

      // Optionally, update the feed with the new post
      setFeedData((prevFeed) => [
        {
          author: { name: "You", profilePicture: "https://via.placeholder.com/40" },
          createdAt: new Date().toISOString(),
          caption: postContent,
          imageUrl: mediaUrls.split(',')[0] || null,
        },
        ...prevFeed,
      ]);

      // Clear the form
      setPostContent('');
      setMediaUrls('');
    } catch (err) {
      setError(err.message || "Failed to post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '680px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', color: '#1d2129' }}>LinkedIn Feed</h2>

      {/* Post Creation Form */}
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '18px', color: '#1d2129' }}>Create a Post</h3>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write your post here..."
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            fontSize: '14px',
          }}
        />
        <input
          type="text"
          value={mediaUrls}
          onChange={(e) => setMediaUrls(e.target.value)}
          placeholder="Enter media URLs (comma-separated)"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={handlePostSubmit}
          disabled={loading || !postContent.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: loading || !postContent.trim() ? 0.7 : 1,
          }}
        >
          {loading ? 'Posting...' : 'Post to LinkedIn'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>

      {/* Feed Display */}
      {feedData.length > 0 ? (
        feedData.map((post, index) => (
          <div key={index} style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <img
                src={post.author?.profilePicture || 'https://via.placeholder.com/40'}
                alt="Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px' }}
              />
              <div>
                <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1d2129' }}>
                  {post.author?.name || 'Unknown User'}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#606770' }}>
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
              />
            )}

            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#1d2129' }}>
              {post.caption || 'No caption available'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
              <button style={{ border: 'none', backgroundColor: 'transparent', fontSize: '14px', color: '#606770', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FaThumbsUp style={{ marginRight: '4px' }} /> Like
              </button>
              <button style={{ border: 'none', backgroundColor: 'transparent', fontSize: '14px', color: '#606770', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FaComment style={{ marginRight: '4px' }} /> Comment
              </button>
              <button style={{ border: 'none', backgroundColor: 'transparent', fontSize: '14px', color: '#606770', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FaShare style={{ marginRight: '4px' }} /> Share
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#606770', textAlign: 'center' }}>No posts available.</p>
      )}
    </div>
  );
};

export default LinkedInFeed;
