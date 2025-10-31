import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserLists, getCollaboratingLists, ListType } from '../../utils/api';
import './MyLists.css';

const MyLists: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');
  const [ownedLists, setOwnedLists] = useState<ListType[]>([]);
  const [sharedLists, setSharedLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoading(true);
        setError(null);
        const [owned, shared] = await Promise.all([
          getUserLists(),
          getCollaboratingLists(),
        ]);
        setOwnedLists(owned);
        setSharedLists(shared);
      } catch (err: any) {
        setError(err.message || 'Failed to load lists');
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []);

  const displayLists = activeTab === 'owned' ? ownedLists : sharedLists;

  return (
    <div className="my-lists-page">
      <div className="my-lists-container">
        <h1 className="page-title">My Lists</h1>
        
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => setActiveTab('owned')}
          >
            📋 Owned by Me ({ownedLists.length})
          </button>
          <button
            className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            🤝 Shared with Me ({sharedLists.length})
          </button>
        </div>

        <div className="lists-content">
          {loading ? (
            <div className="loading">Loading lists...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : displayLists.length === 0 ? (
            <div className="empty-state">
              <p>
                {activeTab === 'owned'
                  ? "You haven't created any lists yet."
                  : "You haven't been added to any lists yet."}
              </p>
            </div>
          ) : (
            <div className="lists-grid">
              {displayLists.map((list) => (
                <div
                  key={list._id}
                  className="list-card"
                  onClick={() => navigate(`/list/${list._id}`)}
                >
                  <div className="list-header">
                    <h3 className="list-name">{list.name}</h3>
                    {list.isPublic ? (
                      <span className="badge public">Public</span>
                    ) : (
                      <span className="badge private">Private</span>
                    )}
                  </div>
                  <p className="list-description">
                    {list.description || 'No description'}
                  </p>
                  <div className="list-footer">
                    <span className="list-owner">👤 {list.ownerName}</span>
                    <span className="list-date">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLists;

