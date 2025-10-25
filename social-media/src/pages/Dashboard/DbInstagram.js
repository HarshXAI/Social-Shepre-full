import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaPaperPlane, FaBookmark, FaChartBar, FaHashtag, FaCalendarAlt, FaImage } from 'react-icons/fa';

const InstagramFeed = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [mediaData, setMediaData] = useState([]);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'insights'

  const ACCESS_TOKEN = "IGAAImERmTpN9BZAE9UNW9zZAWdYZATgwZAHJyVDF5d0Y4ZA2pZARWp0OHhJdDZAIaW4ycWlON3lpNDVnM2NUQ1NyQW9qanNRMno3ZAGN1RkRwYmFOazI5VVBjWVNUa2JJby1YX3ZAyZA04zX0xTTmN1RTlsTnEtOUZAleU9ueVZAHU3dZAd2Y0MAZDZD"; // Replace with your Instagram access token

  // Function to calculate insights from media data
  const calculateInsights = (data) => {
    if (!data || data.length === 0) return null;
    
    // Total posts
    const totalPosts = data.length;
    
    // Average likes
    const totalLikes = data.reduce((sum, post) => sum + (post.like_count || 0), 0);
    const avgLikes = (totalLikes / totalPosts).toFixed(1);
    
    // Most liked post
    const mostLikedPost = [...data].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))[0];
    
    // Posts by month
    const postsByMonth = data.reduce((acc, post) => {
      const date = new Date(post.timestamp);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear]++;
      return acc;
    }, {});
    
    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags = {};
    data.forEach(post => {
      if (!post.caption) return;
      
      const matches = post.caption.match(hashtagRegex);
      if (matches) {
        matches.forEach(tag => {
          const cleanTag = tag.substring(1);
          hashtags[cleanTag] = (hashtags[cleanTag] || 0) + 1;
        });
      }
    });
    
    // Top 5 hashtags
    const topHashtags = Object.entries(hashtags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    // Media types distribution
    const mediaTypes = data.reduce((acc, post) => {
      acc[post.media_type] = (acc[post.media_type] || 0) + 1;
      return acc;
    }, {});

    // Posts over time (simplified)
    const postsOverTime = [];
    const sortedPosts = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sortedPosts.length > 0) {
      const firstDate = new Date(sortedPosts[0].timestamp);
      const lastDate = new Date(sortedPosts[sortedPosts.length - 1].timestamp);
      const daysSinceFirstPost = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
      
      const postsPerDay = (totalPosts / (daysSinceFirstPost || 1)).toFixed(2);
      
      postsOverTime.push({
        firstPost: firstDate.toLocaleDateString(),
        lastPost: lastDate.toLocaleDateString(),
        daysSinceFirstPost,
        postsPerDay
      });
    }
    
    return {
      totalPosts,
      avgLikes,
      mostLikedPost,
      postsByMonth,
      topHashtags,
      mediaTypes,
      postsOverTime
    };
  };

  useEffect(() => {
    const fetchInstagramData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch(
          `https://graph.instagram.com/me?fields=id,username,media_count,profile_picture_url&access_token=${ACCESS_TOKEN}`
        );
        if (!profileResponse.ok) {
          throw new Error(`Error fetching profile: ${profileResponse.status} ${profileResponse.statusText}`);
        }
        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        // Fetch user media (posts)
        const mediaResponse = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count&access_token=${ACCESS_TOKEN}`
        );
        if (!mediaResponse.ok) {
          throw new Error(`Error fetching media: ${mediaResponse.status} ${mediaResponse.statusText}`);
        }
        const mediaData = await mediaResponse.json();
        const posts = mediaData.data || [];
        setMediaData(posts);
        
        // Calculate insights
        const insightsData = calculateInsights(posts);
        setInsights(insightsData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching Instagram data:', error);
      }
    };

    fetchInstagramData();
  }, [ACCESS_TOKEN]);

  // Render Instagram Feed Tab
  const renderFeedTab = () => (
    <div style={styles.feedContainer}>
      {error && <p style={styles.error}>{error}</p>}

      {mediaData.length > 0 ? (
        mediaData.map((post, index) => (
          <div key={index} style={styles.post}>
            {/* Post Header */}
            <div style={styles.postHeader}>
              <img
                src={userProfile?.profile_picture_url}
                alt="Profile"
                style={styles.profileImage}
              />
              <div>
                <p style={styles.username}>{userProfile?.username}</p>
                <p style={styles.timestamp}>
                  {new Date(post.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Post Media */}
            {post.media_url && (
              <img src={post.media_url} alt="Post" style={styles.postImage} />
            )}

            {/* Post Actions */}
            <div style={styles.actionBar}>
              <div style={styles.actionButtons}>
                <button style={styles.iconButton}><FaHeart size={20} /></button>
                <button style={styles.iconButton}><FaComment size={20} /></button>
                <button style={styles.iconButton}><FaPaperPlane size={20} /></button>
              </div>
              <button style={styles.iconButton}><FaBookmark size={20} /></button>
            </div>

            {/* Post Details */}
            <div style={styles.postContent}>
              {post.like_count && (
                <p style={styles.likeCount}>{post.like_count} likes</p>
              )}
              <p style={styles.caption}>
                <span style={styles.username}>{userProfile?.username}</span>
                {' '}{post.caption || 'No caption'}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p style={styles.loading}>Loading feed...</p>
      )}
    </div>
  );

  // Render Instagram Insights Tab
  const renderInsightsTab = () => (
    <div style={styles.insightsContainer}>
      {!insights ? (
        <p style={styles.loading}>Calculating insights...</p>
      ) : (
        <>
          <div style={styles.insightsSummary}>
            <div style={styles.summaryCard}>
              <h3>Total Posts</h3>
              <p style={styles.insightValue}>{insights.totalPosts}</p>
              <FaImage style={styles.insightIcon} size={24} />
            </div>
            
            <div style={styles.summaryCard}>
              <h3>Average Likes</h3>
              <p style={styles.insightValue}>{insights.avgLikes}</p>
              <FaHeart style={styles.insightIcon} size={24} />
            </div>
            
            <div style={styles.summaryCard}>
              <h3>Posting Frequency</h3>
              <p style={styles.insightValue}>
                {insights.postsOverTime[0]?.postsPerDay || 0} posts/day
              </p>
              <FaCalendarAlt style={styles.insightIcon} size={24} />
            </div>
          </div>

          {/* Top Hashtags */}
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>
              <FaHashtag /> Top Hashtags
            </h3>
            <div style={styles.hashtagCloud}>
              {insights.topHashtags.length > 0 ? (
                insights.topHashtags.map((item, index) => (
                  <div key={index} style={styles.hashtagItem}>
                    #{item.tag} <span style={styles.hashtagCount}>{item.count}</span>
                  </div>
                ))
              ) : (
                <p>No hashtags found</p>
              )}
            </div>
          </div>

          {/* Most Popular Post */}
          {insights.mostLikedPost && (
            <div style={styles.insightCard}>
              <h3 style={styles.insightTitle}>
                <FaChartBar /> Most Popular Post
              </h3>
              <div style={styles.popularPost}>
                {insights.mostLikedPost.media_url && (
                  <img
                    src={insights.mostLikedPost.media_url}
                    alt="Most Popular"
                    style={styles.popularPostImage}
                  />
                )}
                <div style={styles.popularPostDetails}>
                  <p>
                    <FaHeart /> {insights.mostLikedPost.like_count || 0} likes
                  </p>
                  <p style={styles.popularPostCaption}>
                    {insights.mostLikedPost.caption || 'No caption'}
                  </p>
                  <p>
                    {new Date(insights.mostLikedPost.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Posts by Month */}
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>
              <FaCalendarAlt /> Posts by Month
            </h3>
            <div style={styles.postsByMonth}>
              {Object.entries(insights.postsByMonth).map(([month, count], index) => (
                <div key={index} style={styles.monthItem}>
                  <div style={styles.monthLabel}>{month}</div>
                  <div style={styles.monthBarContainer}>
                    <div 
                      style={{
                        ...styles.monthBar, 
                        width: `${Math.min(count * 10, 100)}%`
                      }}
                    />
                    <span style={styles.monthCount}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Media Types */}
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>Media Types</h3>
            <div style={styles.mediaTypes}>
              {Object.entries(insights.mediaTypes).map(([type, count], index) => (
                <div key={index} style={styles.mediaTypeItem}>
                  <div style={styles.mediaTypeLabel}>{type}</div>
                  <div style={styles.mediaTypeValue}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Instagram Analytics</h1>
      
      <div style={styles.toggleContainer}>
        <div style={styles.toggleWrapper}>
          <div 
            style={{
              ...styles.toggleOption,
              color: activeTab === 'feed' ? '#FFFFFF' : '#94A3B8',
              fontWeight: activeTab === 'feed' ? '600' : '400',
            }}
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </div>
          <div 
            style={{
              ...styles.toggleOption,
              color: activeTab === 'insights' ? '#FFFFFF' : '#94A3B8',
              fontWeight: activeTab === 'insights' ? '600' : '400',
            }}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </div>
          <div 
            style={{
              ...styles.toggleSlider,
              transform: activeTab === 'feed' ? 'translateX(0)' : 'translateX(100%)'
            }}
          />
        </div>
      </div>
      
      {activeTab === 'feed' ? renderFeedTab() : renderInsightsTab()}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#070E1E',
    minHeight: '100vh',
    padding: '2rem',
    color: '#E2E8F0',
  },
  title: {
    color: '#E2E8F0',
    marginBottom: '2rem',
    fontSize: '2rem',
    textAlign: 'center',
  },
  feedContainer: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  post: {
    backgroundColor: '#0F172A',
    borderRadius: '12px',
    marginBottom: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #1E293B',
  },
  profileImage: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    marginRight: '12px',
  },
  username: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: '14px',
  },
  timestamp: {
    color: '#94A3B8',
    fontSize: '12px',
  },
  postImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #1E293B',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
  },
  iconButton: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#E2E8F0',
    padding: '4px',
  },
  postContent: {
    padding: '1rem',
  },
  likeCount: {
    color: '#E2E8F0',
    fontWeight: '600',
    marginBottom: '8px',
  },
  caption: {
    color: '#E2E8F0',
    fontSize: '14px',
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  loading: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  
  // Replace tab styles with toggle styles
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  toggleWrapper: {
    display: 'flex',
    position: 'relative',
    background: '#1E293B',
    borderRadius: '30px',
    height: '40px',
    width: '200px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  toggleOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '50%',
    zIndex: 1,
    transition: 'color 0.3s ease',
    userSelect: 'none',
  },
  toggleSlider: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    height: 'calc(100% - 6px)',
    width: 'calc(50% - 6px)',
    borderRadius: '27px',
    background: '#3B82F6',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 5px rgba(59, 130, 246, 0.5)',
  },
  
  // Insights styles
  insightsContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  insightsSummary: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    flex: '1 0 200px',
    maxWidth: '250px',
    position: 'relative',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  insightValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '1rem 0',
    color: '#FFFFFF',
  },
  insightIcon: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    color: '#3B82F6',
    opacity: 0.7,
  },
  insightCard: {
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  },
  insightTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#FFFFFF',
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  
  // Hashtag cloud styles
  hashtagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  hashtagItem: {
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
  hashtagCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    marginLeft: '0.5rem',
  },
  
  // Popular post styles
  popularPost: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  popularPostImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  popularPostDetails: {
    flex: 1,
  },
  popularPostCaption: {
    margin: '0.5rem 0',
    fontSize: '0.9rem',
    color: '#E2E8F0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  
  // Posts by month styles
  postsByMonth: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  monthItem: {
    display: 'flex',
    alignItems: 'center',
  },
  monthLabel: {
    width: '100px',
    color: '#E2E8F0',
    fontSize: '0.9rem',
  },
  monthBarContainer: {
    flex: 1,
    height: '24px',
    backgroundColor: '#0F172A',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  },
  monthBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '12px',
  },
  monthCount: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFFFFF',
    fontSize: '0.85rem',
  },
  
  // Media types styles
  mediaTypes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  mediaTypeItem: {
    backgroundColor: '#0F172A',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    minWidth: '120px',
    flex: '1',
  },
  mediaTypeLabel: {
    color: '#94A3B8',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  mediaTypeValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
};

const App = () => (
  <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '20px' }}>
    <InstagramFeed />
  </div>
);

export default App;
