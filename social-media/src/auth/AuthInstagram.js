import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const INSTAGRAM_CLIENT_ID = "604804838827231";
const INSTAGRAM_CLIENT_SECRET = "5e363d12f8c94be262d20069add385e9";
const INSTAGRAM_REDIRECT_URI = "http://localhost:3000/auth/instagram"; // Change for production

const AuthInstagram = () => {
  const location = useLocation();

  useEffect(() => {
    const fetchAccessToken = async (code) => {
      try {
        const response = await fetch("https://api.instagram.com/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: INSTAGRAM_CLIENT_ID,
            client_secret: INSTAGRAM_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: INSTAGRAM_REDIRECT_URI,
            code,
          }),
        });

        const data = await response.json();
        console.log("Access Token:", data.access_token);
        localStorage.setItem("instagram_access_token", data.access_token);
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    if (code) {
      fetchAccessToken(code);
    }
  }, [location.search]);

  return <div>Authenticating with Instagram...</div>;
};

export default AuthInstagram;
