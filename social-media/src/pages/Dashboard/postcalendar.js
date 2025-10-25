import React, { useState, useEffect } from 'react';
import './PostCalendarStyles.css';

const PostCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [scheduledPosts, setScheduledPosts] = useState({
    facebook: [],
    instagram: [],
  });

  // Load scheduled posts from localStorage on component mount
  useEffect(() => {
    const fbPosts = localStorage.getItem('scheduledFacebookPosts');
    const igPosts = localStorage.getItem('scheduledInstagramPosts');

    const allPosts = {
      facebook: fbPosts ? JSON.parse(fbPosts) : [],
      instagram: igPosts ? JSON.parse(igPosts) : [],
    };

    setScheduledPosts(allPosts);
  }, []);

  const generateCalendarData = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = Array(42).fill(null); // 6 rows of 7 days

    for (let i = 0; i < daysInMonth; i++) {
      calendar[i + startingDayOfWeek] = i + 1;
    }

    return calendar;
  };

  const getScheduledPostsForDay = (day) => {
    if (!day) return [];

    const dateStart = new Date(selectedYear, selectedMonth, day);
    dateStart.setHours(0, 0, 0, 0);

    const dateEnd = new Date(selectedYear, selectedMonth, day);
    dateEnd.setHours(23, 59, 59, 999);

    const posts = [...scheduledPosts.facebook, ...scheduledPosts.instagram];
    return posts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate >= dateStart && postDate <= dateEnd;
    });
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Social Media Content Calendar</h2>

      <div className="calendar-nav">
        <button
          onClick={() => setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))}
          className="calendar-nav-button"
        >
          ❮
        </button>
        <h3 className="calendar-month-header">
          {new Date(selectedYear, selectedMonth).toLocaleString('default', {
            month: 'long',
          })}{' '}
          {selectedYear}
        </h3>
        <button
          onClick={() => setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))}
          className="calendar-nav-button"
        >
          ❯
        </button>
      </div>

      <div className="calendar">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={`weekday-${index}`} className="weekday-header">
            {day}
          </div>
        ))}

        {generateCalendarData().map((day, index) => {
          const postsForDay = getScheduledPostsForDay(day);
          return (
            <div
              key={`day-${index}`}
              className={`calendar-day ${
                day === null ? 'empty-day' : ''
              } ${day === new Date().getDate() ? 'current-day' : ''}`}
            >
              {day !== null && (
                <>
                  <div className="day-number">{day}</div>
                  {postsForDay.length > 0 && (
                    <div className="post-indicator-container">
                      {postsForDay.map((post, postIndex) => (
                        <div
                          key={`post-${postIndex}`}
                          className={`post-indicator ${
                            post.platform === 'facebook'
                              ? 'facebook-post'
                              : 'instagram-post'
                          }`}
                          title={`${post.platform.toUpperCase()}: ${
                            post.message
                          } at ${post.time}`}
                        >
                          <span className="platform-icon">
                            {post.platform === 'facebook' ? 'f' : '📷'}
                          </span>
                          <span className="post-time">{post.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="platform-icon fb-icon legend-icon">f</span>
          <span>Facebook Post</span>
        </div>
        <div className="legend-item">
          <span className="platform-icon ig-icon legend-icon">📷</span>
          <span>Instagram Post</span>
        </div>
        <div className="legend-item">
          <span className="day-number current-day-number legend-current-day">
            1
          </span>
          <span>Current Day</span>
        </div>
      </div>
    </div>
  );
};

export default PostCalendar;
