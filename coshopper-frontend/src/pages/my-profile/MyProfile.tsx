import React, { useEffect, useState } from 'react';
import { getCurrentUser, updateUserName, updateUserCountry, UserType } from '../../utils/api';
import './MyProfile.css';

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [editingCountry, setEditingCountry] = useState(false);
  const [countryDraft, setCountryDraft] = useState('');
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await getCurrentUser();
        setUser(userData);
        setNameDraft(userData.name);
        setCountryDraft(userData.country);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveName = async () => {
    if (!nameDraft.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    try {
      setNameLoading(true);
      setNameError(null);
      await updateUserName(nameDraft);
      setUser((prev) => (prev ? { ...prev, name: nameDraft } : prev));
      setEditingName(false);
      // Dispatch auth changed event to update header
      window.dispatchEvent(new CustomEvent('auth:changed'));
    } catch (err: any) {
      setNameError(err.message || 'Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  const handleCancelName = () => {
    setNameDraft(user?.name || '');
    setEditingName(false);
    setNameError(null);
  };

  const handleSaveCountry = async () => {
    if (!countryDraft.trim()) {
      setCountryError('Country cannot be empty');
      return;
    }
    try {
      setCountryLoading(true);
      setCountryError(null);
      await updateUserCountry(countryDraft);
      setUser((prev) => (prev ? { ...prev, country: countryDraft } : prev));
      setEditingCountry(false);
    } catch (err: any) {
      setCountryError(err.message || 'Failed to update country');
    } finally {
      setCountryLoading(false);
    }
  };

  const handleCancelCountry = () => {
    setCountryDraft(user?.country || '');
    setEditingCountry(false);
    setCountryError(null);
  };

  if (loading) {
    return (
      <div className="my-profile-page">
        <div className="my-profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="my-profile-page">
        <div className="my-profile-container">
          <div className="error">{error || 'Profile not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page">
      <div className="my-profile-container">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-content">
          <div className="profile-section">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-details">
            {/* Name Section */}
            <div className="detail-card">
              <div className="detail-header">
                <h3>Full Name</h3>
                {!editingName && (
                  <button
                    className="edit-btn"
                    onClick={() => setEditingName(true)}
                  >
                    ✎ Edit
                  </button>
                )}
              </div>
              {editingName ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="Enter your name"
                    disabled={nameLoading}
                    autoFocus
                  />
                  {nameError && <div className="field-error">{nameError}</div>}
                  <div className="button-group">
                    <button
                      onClick={handleSaveName}
                      disabled={nameLoading}
                      className="save-btn"
                    >
                      {nameLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelName}
                      disabled={nameLoading}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="detail-value">{user.name}</p>
              )}
            </div>

            {/* Country Section */}
            <div className="detail-card">
              <div className="detail-header">
                <h3>Country</h3>
                {!editingCountry && (
                  <button
                    className="edit-btn"
                    onClick={() => setEditingCountry(true)}
                  >
                    ✎ Edit
                  </button>
                )}
              </div>
              {editingCountry ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={countryDraft}
                    onChange={(e) => setCountryDraft(e.target.value)}
                    placeholder="Enter your country"
                    disabled={countryLoading}
                    autoFocus
                  />
                  {countryError && <div className="field-error">{countryError}</div>}
                  <div className="button-group">
                    <button
                      onClick={handleSaveCountry}
                      disabled={countryLoading}
                      className="save-btn"
                    >
                      {countryLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelCountry}
                      disabled={countryLoading}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="detail-value">{user.country}</p>
              )}
            </div>

            {/* Account Info Section (Read-only) */}
            <div className="detail-card">
              <div className="detail-header">
                <h3>Account Information</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Joined:</span>
                  <span className="info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

