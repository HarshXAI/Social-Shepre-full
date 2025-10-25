import React from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Testimonial.css";

// Importing placeholder images for testimonials (replace with real images)
import testimonialImage1 from "../assets/images/testimonial1.jpg";
import testimonialImage2 from "../assets/images/testimonial1.jpg";
import testimonialImage3 from "../assets/images/testimonial1.jpg";

const testimonials = [
  {
    name: "Jessica Thompson",
    text: "SocialSphere has completely revolutionized our social media strategy. The ability to manage multiple platforms and schedule content ahead of time has saved us countless hours!",
    img: testimonialImage1,
  },
  {
    name: "David Wilson",
    text: "The AI-driven content creation tool is a game-changer! It has helped us create engaging posts faster while also increasing our engagement rates.",
    img: testimonialImage2,
  },
  {
    name: "Sarah Lee",
    text: "Managing multiple accounts on a single dashboard has never been easier. The streamlined process has helped us grow our social presence exponentially.",
    img: testimonialImage3,
  },
];

const Testimonial = () => (
  <section className="testimonial-section">
    <div className="container">
      <h2 className="custom_heading text-center">
        What Our <span>Users Say</span>
      </h2>
      <p className="text-center sub-heading">
        See how SocialSphere has transformed social media management for businesses and influencers.
      </p>

      <Carousel controls={false} indicators={false} interval={1000} fade>
        {testimonials.map((testimonial, index) => {
          return (
            <Carousel.Item key={index}>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="front">
                    <div className="img-box">
                      <img src={testimonial.img} alt={testimonial.name} />
                    </div>
                    <div className="detail-box">
                      <h5>{testimonial.name}</h5>
                      <p>{testimonial.text}</p>
                    </div>
                  </div>
                  <div className="back">
                    <p>⭐⭐⭐⭐⭐</p>
                    <p>Follow me: @social_handle</p>
                  </div>
                </div>
              </div>

            </Carousel.Item>
          );
        })}
      </Carousel>
    </div>
  </section>
);

export default Testimonial;
