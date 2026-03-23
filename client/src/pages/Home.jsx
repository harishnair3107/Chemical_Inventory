import React from 'react';
import { NavLink } from 'react-router-dom';
import { Beaker, Shield, Zap, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Modern Chemical <span className="highlight">Inventory Management</span></h1>
          <p>Streamline your laboratory workflow with real-time tracking, expiry alerts, and hazardous material management.</p>
          <div className="hero-actions">
            <NavLink to="/register">
              <Button className="cta-btn">Get Started for Free <ArrowRight size={18} /></Button>
            </NavLink>
            <NavLink to="/login">
              <Button variant="outline">Learn More</Button>
            </NavLink>
          </div>
        </div>
        <div className="hero-image">
          <Beaker size={300} strokeWidth={1} className="hero-icon" />
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <Shield size={32} />
          <h3>Safety First</h3>
          <p>Compliance tracking for hazardous materials and SDS management.</p>
        </div>
        <div className="feature-card">
          <Zap size={32} />
          <h3>Real-time Alerts</h3>
          <p>Never miss an expiry date with our automated notification system.</p>
        </div>
        <div className="feature-card">
          <Beaker size={32} />
          <h3>Precision Tracking</h3>
          <p>Accurate stock levels with unit conversions and usage history.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
