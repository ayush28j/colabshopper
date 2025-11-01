import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: October 31, 2025</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>Introduction</h2>
            <p>
              Welcome to ColabShopper. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              application and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you create an account, we collect your name, 
                email address, and password.
              </li>
              <li>
                <strong>Shopping Lists:</strong> We store the shopping lists you create, including list names, 
                items, and any notes or descriptions you add.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect information about how you use ColabShopper, including 
                features you access and actions you take.
              </li>
              <li>
                <strong>Device Information:</strong> We may collect information about the device you use to 
                access ColabShopper, including device type, operating system, and browser type.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our service</li>
              <li>Allow you to create and manage shopping lists</li>
              <li>Enable collaboration features with other users</li>
              <li>Send you important updates about our service</li>
              <li>Improve and optimize our application</li>
              <li>Ensure the security of your account and data</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Data Sharing</h2>
            <p>
              We do not sell your personal information to third parties. We only share your data in the 
              following circumstances:
            </p>
            <ul>
              <li>
                <strong>With Other Users:</strong> When you share a shopping list, the list contents and 
                your name are visible to invited collaborators.
              </li>
              <li>
                <strong>Service Providers:</strong> We may share data with trusted service providers who 
                help us operate our application, subject to strict confidentiality agreements.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information if required by law or to 
                protect our rights and safety.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data 
              against unauthorized access, alteration, disclosure, or destruction. All data transmission is 
              encrypted using SSL/TLS protocols, and passwords are securely hashed.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to certain data processing activities</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide 
              our services. If you delete your account, we will delete your personal data within 30 days, 
              except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Children's Privacy</h2>
            <p>
              ColabShopper is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date. We encourage you 
              to review this policy periodically.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@colabshopper.com</p>
              <p><strong>Address:</strong> 123 Shopping Lane, Tech City, TC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

