import React, { useEffect, useRef, useState } from 'react';
import "./Process.css";

// Importing Material UI icons
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact'; // Multi-Platform Management
import CreateIcon from '@mui/icons-material/Create'; // Content Creation
import EventIcon from '@mui/icons-material/Event'; // Content Scheduling
import SmartToyIcon from '@mui/icons-material/SmartToy'; // AI-Powered Automation
import ForumIcon from '@mui/icons-material/Forum'; // Auto Engagement

const Process = () => {
  const [showCylinders, setShowCylinders] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShowCylinders(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (observer && containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Updated steps for social media management
  const steps = [
    { description: "Connect & Manage Platforms", icon: <ConnectWithoutContactIcon /> },
    { description: "Create Engaging Content", icon: <CreateIcon /> },
    { description: "Plan & Schedule with Calendar", icon: <EventIcon /> },
    { description: "AI-Driven Content Automation", icon: <SmartToyIcon /> },
    { description: "Auto-Engage with Audience", icon: <ForumIcon /> }
  ];

  const cylinderHeights = [200, 250, 300, 350, 400];

  return (
    <div>
      <div className="plain-blue-section">
        <h2 className="custom_heading1">
          Optimize Your <span>Social Media Workflow</span> with AI
        </h2>
        <div className="cylinder-container" ref={containerRef}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`cylinder ${showCylinders ? 'animate' : ''}`}
              style={{
                height: `${cylinderHeights[index]}px`,
                ...(showCylinders && { animationDelay: `${index * 300}ms` }),
              }}
            >
              <div className="cylinder-content">
                <div className="icon">{step.icon}</div>
                <div className="description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Process;
