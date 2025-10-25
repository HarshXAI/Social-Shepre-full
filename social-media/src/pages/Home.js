import React from "react";
import Carousel from "react-bootstrap/Carousel";
import slider from "../assets/images/Slider2.jpg";
import Process from "./Process";
import AlumCon from "./Testimonial";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css"; // Importing custom styles

const Home = () => (
  <>
    <Carousel className="custom-carousel">
      <Carousel.Item>
        <div className="carousel-slide slide-1">
          <div className="overlay"></div>
          <div className="left-portion">
            <h1>SocialSphere</h1>
            <h2>Streamlining Social Media Management with AI</h2>
            <p>
              SocialSphere makes social media management seamless. Connect, create, and automate with AI-driven tools.
            </p>
            <div className="btn-box">
              <a href="/get-started" className="btn-primary">Get Started</a>
              <a href="/features" className="btn-secondary">Know More</a>
            </div>
          </div>
          <div className="right-portion">
            <img className="img-fluid" src={slider} alt="SocialSphere Overview" />
          </div>
        </div>
      </Carousel.Item>

      <Carousel.Item>
        <div className="carousel-slide slide-2">
          <div className="overlay"></div>
          <div className="left-portion">
            <h1>Manage Multiple Platforms</h1>
            <h2>Seamlessly Connect All Your Accounts</h2>
            <p>
              SocialSphere unifies your social media accounts in one intuitive dashboard, allowing real-time tracking and insights.
            </p>
            <div className="btn-box">
              <a href="/platforms" className="btn-primary">View Platforms</a>
              <a href="/contact" className="btn-secondary">Learn More</a>
            </div>
          </div>
          <div className="right-portion">
            <img className="img-fluid" src={slider} alt="Platform Integration" />
          </div>
        </div>
      </Carousel.Item>
      
      <Carousel.Item>
        <div className="carousel-slide slide-3">
          <div className="overlay"></div>
          <div className="left-portion">
            <h1>AI-Powered Content Creation</h1>
            <h2>Automate Posts and Engage Your Audience</h2>
            <p>
              Plan your content strategy effortlessly with AI automation. Schedule posts and boost audience engagement.
            </p>
            <div className="btn-box">
              <a href="/ai-tools" className="btn-primary">Explore AI Features</a>
              <a href="/contact" className="btn-secondary">Get More Info</a>
            </div>
          </div>
          <div className="right-portion">
            <img className="img-fluid" src={slider} alt="AI Automation" />
          </div>
        </div>
      </Carousel.Item>
      
      <Carousel.Item>
        <div className="carousel-slide slide-4">
          <div className="overlay"></div>
          <div className="left-portion">
            <h1>Content Strategy Calendar</h1>
            <h2>Plan and Organize Your Posts</h2>
            <p>
              Use our intuitive content calendar to schedule posts, plan themes, and maximize engagement.
            </p>
            <div className="btn-box">
              <a href="/calendar" className="btn-primary">Try the Calendar</a>
              <a href="/features" className="btn-secondary">Learn More</a>
            </div>
          </div>
          <div className="right-portion">
            <img className="img-fluid" src={slider} alt="Content Calendar" />
          </div>
        </div>
      </Carousel.Item>
    </Carousel>

    <Process />
    <AlumCon />
  </>
);

export default Home;
