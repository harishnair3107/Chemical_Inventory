import React from 'react';
import '../styles/global.css';

const PrivacyPolicy = () => {
  return (
    <div className="page legal-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you register for an account, update your inventory, or communicate with us. This may include your name, email address, and activity logs within the ChemInventory system.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to operate, maintain, and provide the features and functionality of the Chemical Inventory Management System. This includes tracking inventory changes, maintaining audit logs, and authenticating users.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>3. Data Security</h2>
        <p>We implement appropriate technical and organizational security measures to protect the security of your internal company data. However, please be aware that no security measures are perfect or impenetrable.</p>
      </section>

      <section>
        <h2>4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact your system administrator.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
