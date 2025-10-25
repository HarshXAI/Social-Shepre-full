import React, { useState } from 'react';

const Whatsapp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const phoneNumberId = '623075297554041';
  const recipientPhone = '918080040672';
  const accessToken = 'EAAM9zMmQC2kBOw9t6y3ZAY1ZCqa7mViytsJGxyAF9ZCZCkZBOtPvISWIXZAKnfn8ZCY7Hv8a2PlXDZBKytRXOwxWdG9l9jJRYxjVvCFpkZB5eMGAlD1yRqHhve1GNgKFP4AjUE8VAZATuJuWcZCNmrowZCQfkCHf14i5ghx0pN8kR6beN92cwIdLe93huTmGNdZAcZAERxrZAfIncYYlZBtrmKvvCaOCsmSHlhAZD';

  const sendMessage = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: recipientPhone,
            type: 'text',
            text: { body: message },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setSuccess(true);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Send WhatsApp Message</h1>
      
      <div style={styles.formContainer}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.textarea}
            placeholder="Type your message..."
          />
        </div>

        <button
          onClick={sendMessage}
          disabled={loading || !message}
          style={{
            ...styles.button,
            opacity: (loading || !message) ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>

        {error && <p style={styles.error}>Error: {error}</p>}
        {success && <p style={styles.success}>Message sent successfully!</p>}
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
  inputGroup: {
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#94A3B8',
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
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#25D366', // WhatsApp green
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#128C7E', // Darker WhatsApp green
    },
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

export default Whatsapp;
