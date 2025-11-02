import React, { useState } from 'react';
import './CreateListModal.css';
import { isLoggedIn as authIsLoggedIn, createList as apiCreateList } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import logo from '../../logo.svg';

interface CreateListModalProps {
  show: boolean;
  onClose: () => void;
  onLoginRequired: () => void;
}

type ModalStep = 'listType' | 'listDetails';
type ListType = 'private' | 'public' | null;

const CreateListModal: React.FC<CreateListModalProps> = ({ show, onClose, onLoginRequired }) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('listType');
  const [listType, setListType] = useState<ListType>(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Authentication check
  const isLoggedIn = authIsLoggedIn();

  const handleListTypeSelect = (type: ListType) => {
    setListType(type);
    
    if (type === 'private' && !isLoggedIn) {
      // Close this modal and open login modal
      onClose();
      onLoginRequired();
    } else {
      // Move to list details step
      setCurrentStep('listDetails');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!listType) return;
    try {
      setLoading(true);
      const created = await apiCreateList(listName, listDescription, listType === 'public');
      resetModal();
      onClose();
      navigate(`/list/${created._id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('listType');
    setListType(null);
    setListName('');
    setListDescription('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleBack = () => {
    setCurrentStep('listType');
    setListType(null);
  };

  if (!show) return null;

  return (
    <div className="create-modal-overlay" onClick={handleBackdropClick}>
      <div className="create-modal-content">
        <button className="create-modal-close" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        

        {currentStep === 'listType' ? (
          <>
            <div className="create-modal-header">
              <div className="create-modal-icon">
                <img src={logo} alt="ColabShopper Logo" />
              </div>
              <h2>Choose List Type</h2>
              <p>Select whether you want a private or public list</p>
            </div>

            <div className="list-type-options">
              <button
                className="list-type-card"
                onClick={() => handleListTypeSelect('private')}
              >
                <div className="list-type-icon private">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Private List</h3>
                <p>Only you and invited members can view and edit</p>
                <span className="list-type-badge">Login Required</span>
              </button>

              <button
                className="list-type-card"
                onClick={() => handleListTypeSelect('public')}
              >
                <div className="list-type-icon public">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Public List</h3>
                <p>Anyone with the link can view and contribute</p>
                <span className="list-type-badge public">No Login Needed</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="create-modal-header">
              <div className="create-modal-icon">
                <img src={logo} alt="ColabShopper Logo" />
              </div>
              <h2>List Details</h2>
              <p>Creating a {listType} shopping list</p>
            </div>

            <form className="create-list-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="listName">List Name *</label>
                <input
                  type="text"
                  id="listName"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g., Weekly Groceries"
                  required
                />
              </div>



              <div className="form-group">
                <label htmlFor="listDescription">Description (Optional)</label>
                <textarea
                  id="listDescription"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Add any notes or details about this list..."
                  rows={3}
                />
              </div>

              <div className="create-modal-actions">
                <button type="button" className="back-btn" onClick={handleBack}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                {error && (
                  <div className="error-text" role="alert">{error}</div>
                )}
                <button type="submit" className="create-btn" disabled={loading}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {loading ? 'Creating…' : 'Create List'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateListModal;

