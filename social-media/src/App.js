import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Process from "./pages/Process";

import AlumCon from "./pages/Testimonial";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from './pages/Dashboard';
import AuthInstagram from "../src/auth/AuthInstagram";
import { AssessmentProvider } from "./context/AssessmentContext";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const location = useLocation();
  const hideNavbarAndFooter = location.pathname.startsWith('/dashboard');
  return (
    <div>
      <AuthProvider>
      {!hideNavbarAndFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/process" element={<Process />} />
        <Route path="/alumcon" element={<AlumCon />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/instagram" element={<AuthInstagram />} /> {/* Instagram auth route */}
        <Route
          path="/dashboard/*"
          element={
            <AssessmentProvider>
              <Dashboard />
            </AssessmentProvider>
          }
        />
        
      </Routes>
      {!hideNavbarAndFooter && <Footer />}
      </AuthProvider>
      
    </div>
  );
};


export default App;
