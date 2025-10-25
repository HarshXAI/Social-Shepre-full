import React, { useState } from 'react';
import { FaInstagram, FaWhatsapp, FaLinkedin, FaFacebookF } from 'react-icons/fa';

const Profile = () => {
  const [socials, setSocials] = useState({
    instagram: { enabled: false, token: '', showToken: false },
    whatsapp: { enabled: false, token: '', showToken: false },
    linkedin: { enabled: false, token: '', showToken: false },
    facebook: { enabled: false, token: '', showToken: false }
  });

  const socialCards = [
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E1306C' },
    { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366' },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0077B5' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebookF, color: '#1877F2' }
  ];

  const handleToggle = (platform) => {
    setSocials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        enabled: !prev[platform].enabled
      }
    }));
  };

  const handleCardClick = (platform) => {
    setSocials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        showToken: !prev[platform].showToken
      }
    }));
  };

  const handleTokenChange = (platform, value) => {
    setSocials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        token: value
      }
    }));
  };

  // Add this new function to handle token submission
  const handleTokenSubmit = (platform) => {
    // Add your token submission logic here
    console.log(`Token submitted for ${platform}:`, socials[platform].token);
    setSocials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        showToken: false,
        enabled: true
      }
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Social Media Connections</h1>
      
      <div style={styles.cardsGrid}>
        {socialCards.map(({ id, name, icon: Icon, color }) => (
          <div key={id} style={styles.card} className="social-card">
            <div style={styles.cardContent}>
              <Icon size={36} color={color} style={styles.icon} />
              <h3 style={styles.cardTitle}>{name}</h3>
              
              <label style={styles.toggleButton}>
                <input
                  type="checkbox"
                  checked={socials[id].enabled}
                  onChange={() => handleToggle(id)}
                  style={{ display: 'none' }}
                />
                <div style={styles.toggleTrack} className="toggleTrack">
                  <div style={styles.toggleThumb} className="toggleThumb" />
                </div>
                <span style={{
                  ...styles.toggleLabel,
                  color: socials[id].enabled ? '#10B981' : '#94A3B8'
                }}>
                  {socials[id].enabled ? 'Connected' : 'Connect'}
                </span>
              </label>

              <button 
                style={styles.tokenButton}
                onClick={() => handleCardClick(id)}
              >
                {socials[id].showToken ? 'Hide Token' : 'Show Token'}
              </button>
            </div>

            {socials[id].showToken && (
              <div style={styles.tokenSection} className="token-section">
                <div style={styles.tokenInputGroup}>
                  <input
                    type="text"
                    value={socials[id].token}
                    onChange={(e) => handleTokenChange(id, e.target.value)}
                    placeholder={`Enter ${name} access token`}
                    style={styles.tokenInput}
                  />
                  {socials[id].token && (
                    <button
                      onClick={() => handleTokenSubmit(id)}
                      style={styles.submitButton}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#070E1E',
    minHeight: '100vh',
    color: '#E2E8F0',
  },
  title: {
    color: '#E2E8F0',
    marginBottom: '2rem',
    fontSize: '2rem',
    textAlign: 'center',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
    padding: '1rem',
    maxWidth: '1200px',
    margin: '0 auto',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  icon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    margin: '0',
    color: '#E2E8F0',
    fontSize: '1.2rem',
    fontWeight: '500',
  },
  toggleButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  toggleTrack: {
    width: '48px',
    height: '24px',
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '2px',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },
  toggleThumb: {
    width: '20px',
    height: '20px',
    backgroundColor: '#E2E8F0',
    borderRadius: '50%',
    transition: 'transform 0.3s ease',
    position: 'absolute',
    top: '50%',
    left: '2px', // Starting position
    transform: 'translateY(-50%)',
  },
  toggleLabel: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  tokenButton: {
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    
  },
  tokenSection: {
    marginTop: '1rem',
    borderTop: '1px solid #334155',
    paddingTop: '1rem',
  },
  tokenInput: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#E2E8F0',
    fontSize: '0.875rem',
    flex: 1,
  },
  tokenInputGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  submitButton: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    opacity: 1,
    animation: 'fadeIn 0.3s ease-out',
  },
};

const cssAnimations = `
  .token-section {
    animation: slideDown 0.3s ease-out;
  }

  input[type="checkbox"]:checked + .toggleTrack {
    background-color: #10B981 !important;
    border-color: #059669;
  }

  input[type="checkbox"]:checked + .toggleTrack .toggleThumb {
    transform: translate(24px, -50%) !important; // Move right when checked
  }

  input[type="checkbox"]:not(:checked) + .toggleTrack {
    background-color: #1E293B;
  }

  input[type="checkbox"]:not(:checked) + .toggleTrack .toggleThumb {
    transform: translate(2px, -50%) !important; // Stay left when unchecked
  }

  .toggleThumb {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); // Smoother animation
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = cssAnimations;
document.head.appendChild(styleSheet);

export default Profile;
