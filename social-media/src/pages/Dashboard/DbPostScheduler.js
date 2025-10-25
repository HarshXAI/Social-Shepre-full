import { useState } from "react";

const PostScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [textIdea, setTextIdea] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [imageurl, setimageurl] = useState("");
  const [tags, setTags] = useState("");
  const [timeZone, setTimeZone] = useState("UTC");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("once");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [charCount, setCharCount] = useState(0);

  const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 9}:00 AM`).concat(
    Array.from({ length: 9 }, (_, i) => `${i + 1}:00 PM`)
  );

  const accessToken = 'EAAM9zMmQC2kBOyqyguIrQ527ZCUwbskjBzyaEmU067VLTesZCLDCqbOUlZAIVNfpqkNDrX0tskZCvRlNM3sbEhwVjZBZBEepdwL6lXqT5tiPEZCkVEUAYaIzqXAuhyDpyddZCOZABPFJ4jK0akdm1FriB8vq9UTZBVbQRq6crkaFC2tf7ZCl2pdX57L11cVv4ZCyJ0hYAYcaPT7Xdq8sSqekCWZACt5B7'; // Replace with your actual Facebook access token
  const userProfilePicture = `https://graph.facebook.com/me/picture?access_token=${accessToken}`;

  const platforms = ["Facebook", "Twitter", "Instagram", "LinkedIn"];
  const textIdeas = [
    "Boost your engagement with this post!",
    "Share your thoughts on this topic.",
    "Check out our latest update!",
    "New product launch incoming!",
  ];
  const timeZones = ["UTC", "PST", "EST", "GMT", "IST"];
  const frequencies = ["Once", "Daily", "Weekly", "Monthly"];

  const handleSchedulePost = () => {
    if (!selectedDate || !selectedTime || !selectedPlatform || !postTitle || !postContent) {
      alert("Please fill all the required fields before scheduling the post.");
      return;
    }
    setShowConfirmation(true);
  };

  // const confirmSchedule = () => {
  //   // Here you would typically send the data to an API or handle it as needed
  //   console.log("Post Scheduled:", {
  //     title: postTitle,
  //     date: selectedDate,
  //     time: selectedTime,
  //     platform: selectedPlatform,
  //     content: postContent,
  //     textIdea,
  //     mediaFile,
  //     tags: tags.split(",").map((tag) => tag.trim()),
  //     timeZone,
  //     recurring,
  //     frequency,
  //   });
  //   setShowConfirmation(false);
  //   alert("Post scheduled successfully!");
  // };
  const confirmSchedule = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!postContent.trim() && !imageurl.trim()) {
      setError('Post must contain either a message or an image.');
      return;
    }

    try {
      let postData;
      let apiUrl;

      if (imageurl.trim()) {
        // Post with an image
        apiUrl = `https://graph.facebook.com/v22.0/591873497331588/photos?access_token=${accessToken}`;
        postData = {
          url: imageurl,
          caption: postContent,
        };
      } else {
        // Post only text
        apiUrl = `https://graph.facebook.com/v22.0/591873497331588/feed?access_token=${accessToken}`;
        postData = {
          message: postContent,
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
        setShowConfirmation(false);
        setPostContent('');
        setimageurl('');
        setCharCount(0);
        console.log('Successful');
      } else {
        throw new Error(data.error?.message || 'Failed to post.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>Advanced Post Scheduler</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Left Side: Input Fields */}
        <div style={{ border: "1px solid #ddd", padding: "24px", borderRadius: "8px", background: "#fff" }}>
          <h3 style={{ marginBottom: "16px" }}>Post Details</h3>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Select Platform:
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
            >
              <option value="">Select a platform</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Post Title:
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
              placeholder="Enter post title"
            />
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Post Content:
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "150px", marginTop: "8px" }}
              placeholder="Write your post content here..."
            />
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Text Idea/Hashtags:
            <select
              value={textIdea}
              onChange={(e) => setTextIdea(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
            >
              <option value="">Select a text idea</option>
              {textIdeas.map((idea, index) => (
                <option key={index} value={idea}>
                  {idea}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Image URL (Optional)"
            value={imageurl}
            onChange={(e) => setimageurl(e.target.value)}
          />

          <div className="relative border p-3 rounded-lg flex items-center gap-2 cursor-pointer">
            <label htmlFor="file-upload" className="cursor-pointer">
              Upload Image (Optional)
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={setMediaFile}
              disabled={!!imageurl} // Disable if an image URL is provided
            />
          </div>
        </div>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Tags (comma-separated):
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
              placeholder="e.g., marketing, socialmedia, tips"
            />
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Time Zone:
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
            >
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Recurring Post:
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              style={{ marginLeft: "8px" }}
            />
          </label>

          {recurring && (
            <label style={{ display: "block", marginBottom: "16px" }}>
              Frequency:
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
              >
                {frequencies.map((freq) => (
                  <option key={freq} value={freq.toLowerCase()}>
                    {freq}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* Right Side: Date, Time Slots, and Preview */}
        <div style={{ border: "1px solid #ddd", padding: "24px", borderRadius: "8px", background: "#fff" }}>
          <h3 style={{ marginBottom: "16px" }}>Schedule Post</h3>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Select Date:
            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
            />
          </label>

          <h3 style={{ marginBottom: "16px" }}>Select a Time Slot</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                style={{
                  padding: "8px",
                  background: selectedTime === time ? "#007bff" : "#f0f0f0",
                  color: selectedTime === time ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background 0.3s ease",
                }}
              >
                {time}
              </button>
            ))}
          </div>

          {selectedTime && (
            <div style={{ marginTop: "24px" }}>
              <h3>Post Preview</h3>
              <div style={{ border: "1px solid #ddd", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
                <h4>{postTitle || "Your Post Title"}</h4>
                <p>{postContent || "Your post content will appear here."}</p>
                {mediaFile && (
                  <div style={{ marginTop: "16px" }}>
                    {mediaFile.type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(mediaFile)}
                        alt="Uploaded Media"
                        style={{ maxWidth: "100%", borderRadius: "8px" }}
                      />
                    ) : (
                      <video controls style={{ maxWidth: "100%", borderRadius: "8px" }}>
                        <source src={URL.createObjectURL(mediaFile)} type={mediaFile.type} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
                <div style={{ marginTop: "16px", textAlign: "right" }}>
                  <button
                    onClick={handleSchedulePost}
                    style={{
                      padding: "12px 24px",
                      background: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "background 0.3s ease",
                    }}
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "8px",
            maxWidth: "400px",
            textAlign: "center",
          }}>
            <h3>Confirm Schedule</h3>
            <p>Are you sure you want to schedule this post?</p>
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={confirmSchedule}
                style={{
                  padding: "8px 16px",
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "8px",
                }}
              >
                Yes, Schedule
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  padding: "8px 16px",
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostScheduler;
