import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './list.css';
import {
  getList,
  ListDetail,
  ListItem,
  addAdditionalColumnApi,
  removeAdditionalColumnApi,
  updateListDescription,
  addCollaborator,
  removeCollaborator,
  addListItemApi,
  updateListItemApi,
  deleteListItemApi,
  isLoggedIn,
  getCurrentUser,
} from '../../utils/api';

const ListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [addColName, setAddColName] = useState('');
  const [addColType, setAddColType] = useState('text');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPerms, setCollabPerms] = useState<string[]>(['addItem', 'editItem', 'deleteItem']);
  const [publicUserName, setPublicUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [showPermsDropdown, setShowPermsDropdown] = useState(false);
  const [newItem, setNewItem] = useState<{ [k: string]: any }>({ name: '', qty: '', unit: 'pcs' });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseColumns = useMemo(() => ['name', 'qty', 'unit', 'whoBrings'], []);
  const dynamicColumns = useMemo(() => list?.additionalColumns?.map(c => c.name) || [], [list]);
  const allColumns = useMemo(() => [...baseColumns, ...dynamicColumns], [baseColumns, dynamicColumns]);
  
  const whoBringsOptions = useMemo(() => {
    if (!list) return [];
    if (list.isPublic) {
      // Collect all unique userNames from whoBrings across all items
      const names = new Set<string>();
      list.items?.forEach(item => {
        item.whoBrings?.forEach(w => w.userName && names.add(w.userName));
      });
      return Array.from(names);
    } else {
      // List all collaborators + owner
      const options = [];
      if (list.ownerName) options.push(list.ownerName);
      list.collaborators?.forEach(c => options.push(c.userName));
      return options;
    }
  }, [list]);

  // Check if current user can add collaborators
  const canAddCollaborator = useMemo(() => {
    if (!list || !currentUserId) return false;
    // Owner can always add collaborators
    if (list.ownerId === currentUserId) return true;
    // Check if user is a collaborator with addCollaborator permission
    const userCollab = list.collaborators?.find(c => c.userId === currentUserId);
    return userCollab?.permissions?.includes('addCollaborator') || false;
  }, [list, currentUserId]);

  // Permission options with better names
  const permissionOptions = [
    { value: 'addItem', label: 'Add Items' },
    { value: 'editItem', label: 'Edit Items' },
    { value: 'deleteItem', label: 'Delete Items' },
    { value: 'editDescription', label: 'Edit Description' },
    { value: 'addCollaborator', label: 'Add Collaborators' },
    { value: 'updateCollaboratorPermissions', label: 'Update Collaborator Permissions' },
    { value: 'removeCollaborator', label: 'Remove Collaborators' },
    { value: 'addAdditionalColumn', label: 'Add Columns' },
    { value: 'removeAdditionalColumn', label: 'Remove Columns' },
  ];

  useEffect(() => {
    const loadList = async () => {
      if (!listId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getList(listId);
        setList(data);
        setDescriptionDraft(data.description || '');
        
        if (isLoggedIn()) {
          try {
            const user = await getCurrentUser();
            setPublicUserName(user.name);
            setCurrentUserId(user._id);
          } catch {}
        } else {
          const savedName = localStorage.getItem('coshopper_public_username');
          savedName ? setPublicUserName(savedName) : setShowUsernameModal(true);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load list');
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [listId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPermsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!listId) return;
    
    let socket: WebSocket | null = null;
    let attempts = 0;
    let timer: NodeJS.Timeout | null = null;
    let cleanup = false;
    const MAX = 10, DELAY = 3000;
    
    const handleUpdate = (msg: any) => {
      const actions: Record<string, (prev: ListDetail) => ListDetail> = {
        updateDescription: (p) => ({ ...p, description: msg.description }),
        addCollaborator: (p) => ({ ...p, collaborators: [...(p.collaborators || []), msg.collaborator] }),
        updateCollaboratorPermissions: (p) => ({
          ...p,
          collaborators: (p.collaborators || []).map(c => 
            c.userId === msg.collaboratorUserId ? { ...c, permissions: msg.permissions } : c
          )
        }),
        removeCollaborator: (p) => ({ ...p, collaborators: (p.collaborators || []).filter(c => c.userId !== msg.collaboratorUserId) }),
        addAdditionalColumn: (p) => ({ ...p, additionalColumns: [...(p.additionalColumns || []), msg.column] }),
        removeAdditionalColumn: (p) => ({
          ...p,
          additionalColumns: (p.additionalColumns || []).filter(c => c.name !== msg.columnName),
          items: (p.items || []).map(it => {
            const { [msg.columnName]: _, ...rest } = it as any;
            return rest;
          })
        } as any),
        addListItem: (p) => ({ ...p, items: [...(p.items || []), msg.item] }),
        updateListItem: (p) => ({
          ...p,
          items: (p.items || []).map(it => it._id === msg.itemId ? { ...it, [msg.updateKey]: msg.value } : it)
        }),
        deleteListItem: (p) => ({ ...p, items: (p.items || []).filter(it => it._id !== msg.itemId) }),
      };

      setList(prev => {
        if (!prev) return prev;
        if (msg.action === 'deleteList') return null;
        return actions[msg.action]?.(prev) || prev;
      });
    };
    
    const connect = () => {
      if (cleanup || attempts >= MAX) return;
      
      socket = new WebSocket('ws://localhost:8000/ws');
      
      socket.onopen = () => {
        attempts = 0;
        const token = isLoggedIn() ? localStorage.getItem('coshopper_access_token') : undefined;
        socket?.send(JSON.stringify({ listId, token }));
      };
      
      socket.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'connected' && msg.list) setList(msg.list);
        else if (msg.type === 'update') handleUpdate(msg);
      };
      
      socket.onclose = () => {
        if (!cleanup && attempts < MAX) {
          attempts++;
          timer = setTimeout(connect, DELAY);
        }
      };
    };
    
    connect();

    return () => {
      cleanup = true;
      timer && clearTimeout(timer);
      socket?.close();
    };
  }, [listId]);

  const refresh = async () => {
    if (!listId) return;
    try {
      setList(await getList(listId));
    } catch {}
  };

  const handleError = (err: any, msg: string) => {
    alert(err?.message || msg);
  };

  const onSaveDescription = async () => {
    if (!list || !listId) return;
    try {
      await updateListDescription(listId, descriptionDraft);
      setEditingDescription(false);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to update description');
    }
  };

  const onCancelDescription = () => {
    setDescriptionDraft(list?.description || '');
    setEditingDescription(false);
  };

  const onAddColumn = async () => {
    if (!listId || !addColName.trim()) return;
    try {
      await addAdditionalColumnApi(listId, addColName.trim(), addColType);
      setAddColName('');
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to add column');
    }
  };

  const onRemoveColumn = async (name: string) => {
    if (!listId) return;
    try {
      await removeAdditionalColumnApi(listId, name);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to remove column');
    }
  };

  const onAddCollaborator = async () => {
    if (!listId || !collabEmail.trim() || collabPerms.length === 0) return;
    try {
      await addCollaborator(listId, collabEmail.trim(), collabPerms);
      setCollabEmail('');
      setCollabPerms(['addItem', 'editItem', 'deleteItem']);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to add collaborator');
    }
  };

  const togglePermission = (permission: string) => {
    setCollabPerms(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const onRemoveCollaborator = async (userId: string) => {
    if (!listId) return;
    try {
      await removeCollaborator(listId, userId);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to remove collaborator');
    }
  };

  const onAddItem = async () => {
    if (!listId || !list) return;
    const payload: any = {
      name: newItem.name,
      qty: Number(newItem.qty) || 0,
      unit: newItem.unit || 'pcs',
    };
    dynamicColumns.forEach(col => {
      if (newItem[col]) payload[col] = newItem[col];
    });
    
    // Handle whoBrings
    if (newItem.whoBrings) {
      if (list.isPublic) {
        payload.whoBrings = [{ userName: newItem.whoBrings, qty: String(payload.qty) }];
      } else {
        // For private list, find the userId from collaborators or owner
        const selectedName = newItem.whoBrings;
        let userId = '';
        if (list.ownerName === selectedName && list.ownerId) {
          userId = list.ownerId;
        } else {
          const collab = list.collaborators?.find(c => c.userName === selectedName);
          if (collab) userId = collab.userId;
        }
        if (userId) {
          payload.whoBrings = [{ userId, userName: selectedName, qty: String(payload.qty) }];
        }
      }
    }
    
    try {
      await addListItemApi(listId, payload);
      setNewItem({ name: '', qty: '', unit: 'pcs' });
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to add item');
    }
  };

  const onUpdateCell = async (item: ListItem, key: string, value: any) => {
    if (!listId) return;
    try {
      await updateListItemApi(listId, item._id, key, value);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to update item');
    }
  };

  const onDeleteItem = async (itemId: string) => {
    if (!listId) return;
    try {
      await deleteListItemApi(listId, itemId);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to delete item');
    }
  };

  const handleUsernameSubmit = () => {
    if (!usernameInput.trim()) return;
    const name = usernameInput.trim();
    setPublicUserName(name);
    localStorage.setItem('coshopper_public_username', name);
    setShowUsernameModal(false);
    setUsernameInput('');
  };

  if (loading) return <div className="list-page">Loading…</div>;
  if (error) return <div className="list-page">{error}</div>;
  if (!list) return <div className="list-page">List not found</div>;

  const isPrivate = !list.isPublic;
  const userLoggedIn = isLoggedIn();

  return (
    <div className="list-page">
      {showUsernameModal && (
        <div className="username-modal-overlay">
          <div className="username-modal">
            <h2>Welcome!</h2>
            <p>Please enter your name to use this list</p>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
              placeholder="Your name"
              autoFocus
            />
            <button onClick={handleUsernameSubmit} disabled={!usernameInput.trim()}>
              Continue
            </button>
          </div>
        </div>
      )}
      <div className="list-container">
        <div className="actions-pane">
          <h2>{list.name}</h2>
          <div className="list-meta">
            {isPrivate ? '🔒 Private List' : '🌐 Public List'} • {list.items?.length || 0} items
          </div>
          
          <div className="section">
            <h3>
              Description 
              {!list.isPublic && !editingDescription && (
                <button 
                  onClick={() => setEditingDescription(true)} 
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  disabled={isPrivate && !userLoggedIn}
                >
                  ✎ Edit
                </button>
              )}
            </h3>
            {editingDescription ? (
              <>
                <textarea
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  rows={3}
                  placeholder="Describe this list"
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={onSaveDescription}>Save</button>
                  <button onClick={onCancelDescription} style={{ background: '#fc8181' }}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ color: list.description ? '#2d3748' : '#a0aec0', fontStyle: list.description ? 'normal' : 'italic', margin: '0.5rem 0 0 0', lineHeight: '1.6' }}>
                {list.description || 'No description available'}
              </p>
            )}
          </div>

          {!isPrivate && (
            <div className="section">
              <h3>Your name {userLoggedIn && '(from account)'}</h3>
              <input
                type="text"
                value={publicUserName}
                onChange={(e) => setPublicUserName(e.target.value)}
                placeholder="Enter your display name"
                readOnly={userLoggedIn}
                disabled={userLoggedIn}
                style={userLoggedIn ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
              />
            </div>
          )}

          {isPrivate && canAddCollaborator && (
            <div className="section">
              <h3>Collaborators</h3>
              <input
                type="email"
                value={collabEmail}
                onChange={(e) => setCollabEmail(e.target.value)}
                placeholder="Collaborator email address"
                style={{ width: '100%', marginBottom: '0.75rem' }}
              />
              <div className="row">
                <div className="custom-dropdown-wrapper" ref={dropdownRef}>
                  <button
                    type="button"
                    className="dropdown-trigger"
                    onClick={() => setShowPermsDropdown(!showPermsDropdown)}
                  >
                    {`Permissions (${collabPerms.length})`}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {showPermsDropdown && (
                    <div className="dropdown-menu">
                      {permissionOptions.map(perm => (
                        <label key={perm.value} className="dropdown-option">
                          <input
                            type="checkbox"
                            className="dropdown-checkbox"
                            checked={collabPerms.includes(perm.value)}
                            onChange={() => togglePermission(perm.value)}
                          />
                          <span>{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={onAddCollaborator}
                  disabled={!collabEmail.trim() || collabPerms.length === 0}
                >
                  Add Collaborator
                </button>
              </div>
              
              {list.collaborators && list.collaborators.length > 0 && (
                <ul className="collab-list">
                  {list.collaborators.map(c => (
                    <li key={c.userId}>
                      <div>
                        <span className="collab-name">{c.userName}</span>
                        <div className="collab-perms">
                          {c.permissions.map(p => {
                            const perm = permissionOptions.find(po => po.value === p);
                            return perm ? perm.label : p;
                          }).join(', ')}
                        </div>
                      </div>
                      <button onClick={() => onRemoveCollaborator(c.userId)}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!list.isPublic && (
            <div className="section">
              <h3>Columns</h3>
              <div className="row">
                <input
                  type="text"
                  value={addColName}
                  onChange={(e) => setAddColName(e.target.value)}
                  placeholder="Column name"
                />
                <select 
                  value={addColType} 
                  onChange={(e) => setAddColType(e.target.value)}
                  className="styled-select"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <button onClick={onAddColumn} style={{ width: '100%' }}>Add Column</button>
              <div className="chips">
                {dynamicColumns.map(col => (
                  <span key={col} className="chip">
                    {col}
                    <button onClick={() => onRemoveColumn(col)} title="Remove">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="table-pane">
          <div className="table-wrapper">
            <table className="list-table">
              <thead>
                <tr>
                  {allColumns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="new-row">
                  {allColumns.map(col => (
                    <td key={col}>
                      {col === 'whoBrings' ? (
                        <select
                          value={newItem.whoBrings ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, whoBrings: e.target.value }))}
                          className="table-select"
                        >
                          <option value="">-- Select (optional) --</option>
                          {whoBringsOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={col === 'qty' ? 'number' : 'text'}
                          value={newItem[col] ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, [col]: e.target.value }))}
                          placeholder={col}
                        />
                      )}
                    </td>
                  ))}
                  <td>
                    <button onClick={onAddItem} title="Add">＋</button>
                  </td>
                </tr>

                {list.items?.map(item => (
                  <tr key={item._id}>
                    {allColumns.map(col => (
                      <td key={col}>
                        {col === 'whoBrings' ? (
                          <span className="muted">
                            {Array.isArray(item.whoBrings) && item.whoBrings.length
                              ? item.whoBrings.map(w => `${w.userName} (${w.qty})`).join(', ')
                              : '-'}
                          </span>
                        ) : (
                          <InlineEditable
                            value={String((item as any)[col] ?? '')}
                            onSave={(val) => onUpdateCell(item, col, col === 'qty' ? Number(val) : val)}
                          />
                        )}
                      </td>
                    ))}
                    <td>
                      <button onClick={() => onDeleteItem(item._id)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const InlineEditable: React.FC<{ value: string; onSave: (v: string) => void }> = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return editing ? (
    <span className="inline-edit">
      <input value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button onClick={() => { onSave(draft); setEditing(false); }} title="Save">✓</button>
      <button onClick={() => { setDraft(value); setEditing(false); }} title="Cancel">×</button>
    </span>
  ) : (
    <span className="inline-view" onDoubleClick={() => setEditing(true)}>
      {value || '-'} <button onClick={() => setEditing(true)} title="Edit">✎</button>
    </span>
  );
};

export default ListPage;
