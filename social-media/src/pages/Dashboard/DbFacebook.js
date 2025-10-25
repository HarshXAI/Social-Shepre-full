import React, { useState, useEffect } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaChartBar, FaHashtag, FaCalendarAlt, FaImage } from 'react-icons/fa';

const FacebookFeed = () => {
  const [userData, setUserData] = useState(null);
  const [feedData, setFeedData] = useState(null);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'insights'

  const accessToken = 'EAAM9zMmQC2kBO24NGSZALikxqySvVqRQF5i1NdzHUrJHhQEKegwpWeh4zCTdTQHZC9xT1f63LdCH3QSzdWPlIVYw4njqt4A8ZCgq1Y7fks790ZC1ERAgzs937PpFp7IBU9rwhOZCtcJZCBlBN6tLQQcH6ZB7EaQ2Rcc0JskB38XO1vw2lp5mBVhlFxryvlxZAz13bsZAe474NprgUOoD0HOz4pd3G'; // Replace with your actual Facebook access token

  // Function to calculate insights from feed data
  const calculateInsights = (data) => {
    if (!data || data.length === 0) return null;
    
    // Total posts
    const totalPosts = data.length;
    
    // Count posts with images
    const postsWithImages = data.filter(post => post.full_picture).length;
    
    // Average reactions
    const totalReactions = data.reduce((sum, post) => sum + (post.reactions?.summary?.total_count || 0), 0);
    const avgReactions = (totalReactions / totalPosts).toFixed(1);
    
    // Most reacted post
    const mostReactedPost = [...data].sort((a, b) => 
      (b.reactions?.summary?.total_count || 0) - (a.reactions?.summary?.total_count || 0)
    )[0];
    
    // Posts by month
    const postsByMonth = data.reduce((acc, post) => {
      const date = new Date(post.created_time);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear]++;
      return acc;
    }, {});
    
    // Extract hashtags from messages
    const hashtagRegex = /#(\w+)/g;
    const hashtags = {};
    data.forEach(post => {
      if (!post.message) return;
      
      const matches = post.message.match(hashtagRegex);
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
    
    // Message length analysis
    const messageLengths = data
      .filter(post => post.message)
      .map(post => post.message.length);
    
    const avgMessageLength = messageLengths.length > 0 
      ? (messageLengths.reduce((sum, len) => sum + len, 0) / messageLengths.length).toFixed(0) 
      : 0;
    
    // Posts over time analysis
    const postsOverTime = [];
    const sortedPosts = [...data].sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
    
    if (sortedPosts.length > 0) {
      const firstDate = new Date(sortedPosts[0].created_time);
      const lastDate = new Date(sortedPosts[sortedPosts.length - 1].created_time);
      const daysSinceFirstPost = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) || 1;
      
      const postsPerDay = (totalPosts / daysSinceFirstPost).toFixed(2);
      
      postsOverTime.push({
        firstPost: firstDate.toLocaleDateString(),
        lastPost: lastDate.toLocaleDateString(),
        daysSinceFirstPost,
        postsPerDay
      });
    }
    
    return {
      totalPosts,
      postsWithImages,
      avgReactions,
      mostReactedPost,
      postsByMonth,
      topHashtags,
      avgMessageLength,
      postsOverTime
    };
  };

  useEffect(() => {
    const fetchFacebookData = async () => {
      try {
        const userResponse = await fetch(`https://graph.facebook.com/v19.0/591873497331588?fields=id,name&access_token=${accessToken}`);
        if (!userResponse.ok) {
          throw new Error(`Error fetching user data: ${userResponse.status} ${userResponse.statusText}`);
        }
        const userData = await userResponse.json();
        setUserData(userData);

        const feedResponse = await fetch(`https://graph.facebook.com/v19.0/591873497331588/feed?fields=id,message,created_time,full_picture,reactions.summary(true)&access_token=${accessToken}`);
        if (!feedResponse.ok) {
          throw new Error(`Error fetching feed data: ${feedResponse.status} ${feedResponse.statusText}`);
        }
        const feedData = await feedResponse.json();
        setFeedData(feedData);
        
        // Calculate insights
        const insightsData = calculateInsights(feedData.data);
        setInsights(insightsData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching Facebook data:', error);
      }
    };

    fetchFacebookData();
  }, [accessToken]);

  // Render Facebook Feed Tab
  const renderFeedTab = () => (
    <div style={styles.feedContainer}>
      {error && <p style={styles.error}>{error}</p>}

      {feedData ? (
        feedData.data.map((post, index) => (
          <div key={index} style={styles.post}>
            <div style={styles.postHeader}>
              <img 
                src={`https://graph.facebook.com/${userData?.id}/picture`} 
                alt="Profile" 
                style={styles.profileImage} 
              />
              <div>
                <p style={styles.username}>{userData?.name}</p>
                <p style={styles.timestamp}>
                  {new Date(post.created_time).toLocaleString()}
                </p>
              </div>
            </div>

            {post.full_picture && (
              <img src={post.full_picture} alt="Post" style={styles.postImage} />
            )}

            <p style={styles.postMessage}>{post.message || 'No message content'}</p>

            {post.reactions && (
              <div style={styles.reactionsBar}>
                <span style={styles.reactionCount}>
                  👍 {post.reactions.summary.total_count} Likes
                </span>
              </div>
            )}

            <div style={styles.actionBar}>
              <button style={styles.actionButton}>
                <FaThumbsUp /> Like
              </button>
              <button style={styles.actionButton}>
                <FaComment /> Comment
              </button>
              <button style={styles.actionButton}>
                <FaShare /> Share
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={styles.loading}>Loading feed...</p>
      )}
    </div>
  );

  // Render Facebook Insights Tab
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
              <h3>Average Reactions</h3>
              <p style={styles.insightValue}>{insights.avgReactions}</p>
              <FaThumbsUp style={styles.insightIcon} size={24} />
            </div>
            
            <div style={styles.summaryCard}>
              <h3>Posting Frequency</h3>
              <p style={styles.insightValue}>
                {insights.postsOverTime[0]?.postsPerDay || 0} posts/day
              </p>
              <FaCalendarAlt style={styles.insightIcon} size={24} />
            </div>
          </div>

          {/* Content Distribution */}
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>
              <FaImage /> Content Distribution
            </h3>
            <div style={styles.contentDistribution}>
              <div style={styles.distributionItem}>
                <div style={styles.distributionLabel}>Posts with images</div>
                <div style={styles.distributionBarContainer}>
                  <div 
                    style={{
                      ...styles.distributionBar, 
                      width: `${(insights.postsWithImages / insights.totalPosts) * 100}%`,
                      backgroundColor: '#4267B2' // Facebook blue
                    }}
                  />
                  <span style={styles.distributionCount}>{insights.postsWithImages}</span>
                </div>
              </div>
              <div style={styles.distributionItem}>
                <div style={styles.distributionLabel}>Text-only posts</div>
                <div style={styles.distributionBarContainer}>
                  <div 
                    style={{
                      ...styles.distributionBar, 
                      width: `${((insights.totalPosts - insights.postsWithImages) / insights.totalPosts) * 100}%`,
                      backgroundColor: '#898F9C' // Facebook gray
                    }}
                  />
                  <span style={styles.distributionCount}>{insights.totalPosts - insights.postsWithImages}</span>
                </div>
              </div>
            </div>
            <div style={styles.insightStat}>
              <span>Average message length: </span>
              <strong>{insights.avgMessageLength} characters</strong>
            </div>
          </div>

          {/* Top Hashtags */}
          {insights.topHashtags.length > 0 && (
            <div style={styles.insightCard}>
              <h3 style={styles.insightTitle}>
                <FaHashtag /> Top Hashtags
              </h3>
              <div style={styles.hashtagCloud}>
                {insights.topHashtags.map((item, index) => (
                  <div key={index} style={styles.hashtagItem}>
                    #{item.tag} <span style={styles.hashtagCount}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Popular Post */}
          {insights.mostReactedPost && insights.mostReactedPost.reactions?.summary?.total_count > 0 && (
            <div style={styles.insightCard}>
              <h3 style={styles.insightTitle}>
                <FaChartBar /> Most Popular Post
              </h3>
              <div style={styles.popularPost}>
                {insights.mostReactedPost.full_picture && (
                  <img
                    src={insights.mostReactedPost.full_picture}
                    alt="Most Popular"
                    style={styles.popularPostImage}
                  />
                )}
                <div style={styles.popularPostDetails}>
                  <p>
                    <FaThumbsUp /> {insights.mostReactedPost.reactions?.summary?.total_count || 0} reactions
                  </p>
                  <p style={styles.popularPostCaption}>
                    {insights.mostReactedPost.message || 'No message'}
                  </p>
                  <p>
                    {new Date(insights.mostReactedPost.created_time).toLocaleDateString()}
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
        </>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Facebook Analytics</h1>
      
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
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  feedContainer: {
    marginBottom: '20px',
  },
  error: {
    color: 'red',
  },
  post: {
    backgroundColor: '#2D3748',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    marginBottom: '16px',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  username: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#E2E8F0',
  },
  timestamp: {
    margin: '0',
    fontSize: '12px',
    color: '#94A3B8',
  },
  postImage: {
    width: '100%',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  postMessage: {
    color: '#E2E8F0',
    fontSize: '14px',
    padding: '1rem',
    margin: 0,
  },
  reactionsBar: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #1E293B',
  },
  reactionCount: {
    color: '#94A3B8',
    fontSize: '14px',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0',
  },
  actionButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    fontSize: '14px',
  },
  loading: {
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Toggle switch styles
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  toggleWrapper: {
    display: 'flex',
    position: 'relative',
    background: '#2D3748',
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
    background: '#4267B2', // Facebook blue
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 5px rgba(66, 103, 178, 0.5)',
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
    backgroundColor: '#2D3748',
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
    color: '#4267B2', // Facebook blue
    opacity: 0.7,
  },
  insightCard: {
    backgroundColor: '#2D3748',
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
  insightStat: {
    marginTop: '1rem',
    color: '#E2E8F0',
  },
  
  // Content distribution
  contentDistribution: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  distributionItem: {
    display: 'flex',
    alignItems: 'center',
  },
  distributionLabel: {
    width: '120px',
    color: '#E2E8F0',
    fontSize: '0.9rem',
  },
  distributionBarContainer: {
    flex: 1,
    height: '24px',
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  },
  distributionBar: {
    height: '100%',
    borderRadius: '12px',
  },
  distributionCount: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFFFFF',
    fontSize: '0.85rem',
  },
  
  // Hashtag cloud styles
  hashtagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  hashtagItem: {
    backgroundColor: '#4267B2', // Facebook blue
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
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  },
  monthBar: {
    height: '100%',
    backgroundColor: '#4267B2', // Facebook blue
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
};

const App = () => (
  <div style={{ backgroundColor: '#1E293B', minHeight: '100vh', padding: '20px' }}>
    <FacebookFeed />
  </div>
);

export default App;
