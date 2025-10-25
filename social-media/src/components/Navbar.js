import React, { useState } from "react";
import "./Navbar.css";
import logo from "../assets/images/SocialSphereLogo.png";
import search from "../assets/images/search-icon.png";
import { NavLink } from "react-router-dom";

import facebookLogo from "../assets/images/facebook.png";
import twitterLogo from "../assets/images/twitter.png";
import instagramLogo from "../assets/images/instagram24.png";
import linkedinLogo from "../assets/images/linkedin.png";

const INSTAGRAM_CLIENT_ID = "912374694415209";
const INSTAGRAM_REDIRECT_URI = "http://localhost:3000/dashboard"; // Change this in production

const FACEBOOK_APP_ID = "912374694415209";
const FACEBOOK_REDIRECT_URI = "http://localhost:3000/dashboard/dbfacebook"; // Change in production

const Navbar = () => {
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false); // State for dropdown menu

  const handleClick = () => setClick(!click);
  const handleDropdownOpen = () => setDropdown(true);
  const handleDropdownClose = () => setDropdown(false);

  const handleInstagramConnect = () => {
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    window.location.href = instagramAuthUrl; // Redirect to Instagram login
  };

  const handleFacebookConnect = () => {
    const facebookAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=email,public_profile,pages_manage_posts,pages_read_engagement`;
    window.location.href = facebookAuthUrl; // Redirect to Facebook login
  };

  return (
    <>
      <div className="top-portion"></div>
      <div className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <NavLink
              exact
              to="/"
              activeClassName="active"
              className="logo-with-text nav-item-1"
              onClick={handleClick}
            >
              <img src={logo} alt="Navbar" width={"50px"} />
              <span className="path-scout-title">Social Sphere</span>
            </NavLink>
          </div>

          <div className="nav-center">
            <ul className={click ? "nav-menu active" : "nav-menu"}>
              <li className="nav-item">
                <NavLink
                  exact
                  to="/"
                  activeClassName="active"
                  className="nav-links"
                  onClick={handleClick}
                >
                  HOME
                </NavLink>
              </li>
              <li
                className="nav-item"
                onMouseEnter={handleDropdownOpen}
                onMouseLeave={handleDropdownClose}
              >
                <span className="nav-links dropdown-title">CONNECT</span>
                <ul className={dropdown ? "dropdown-menu show" : "dropdown-menu"}>
                  <li className="social-media-item">
                    <img src={facebookLogo} alt="Facebook" className="social-media-logo" />
                    <span className="social-media-name">Facebook</span>
                    <button className="connect-button" onClick={handleFacebookConnect}>Connect</button>
                  </li>
                  <li className="social-media-item">
                    <img src={twitterLogo} alt="Twitter" className="social-media-logo" />
                    <span className="social-media-name">Twitter</span>
                    <button className="connect-button">Connect</button>
                  </li>
                  <li className="social-media-item">
                    <img src={instagramLogo} alt="Instagram" className="social-media-logo" />
                    <span className="social-media-name">Instagram</span>
                    <button className="connect-button" disabled={true} onClick={handleInstagramConnect}>Connected</button>
                  </li>
                  <li className="social-media-item">
                    <img src={linkedinLogo} alt="LinkedIn" className="social-media-logo" />
                    <span className="social-media-name">LinkedIn</span>
                    <button className="connect-button" disabled={true}>Connected</button>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink
                  exact
                  to="/dashboard/dbinstafeed"
                  activeClassName="active"
                  className="nav-links"
                  onClick={handleClick}
                >
                  DASHBOARD
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  exact
                  to="/"
                  activeClassName="active"
                  className="nav-links"
                  onClick={handleClick}
                >
                  <img src={search} className="search-img" alt="Search" />
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="nav-right">
            <NavLink
              exact
              to="/register"
              activeClassName="active"
              className="nav-links login-btn"
              onClick={handleClick}
            >
              Sign Up
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
