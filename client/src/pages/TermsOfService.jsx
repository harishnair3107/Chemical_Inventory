import React from 'react';
import '../styles/global.css';

const TermsOfService = () => {
  return (
    <div className="page legal-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Terms of Service</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the ChemInventory system, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>2. Use License</h2>
        <p>This software is provided for internal corporate use only. You must not use the system for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You must notify your system administrator immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
      </section>

      <section>
        <h2>4. Modifications to Service</h2>
        <p>We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice at any time.</p>
      </section>
    </div>
  );
};

export default TermsOfService;
