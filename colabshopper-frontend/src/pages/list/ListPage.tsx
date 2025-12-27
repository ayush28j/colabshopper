import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './list.css';
import {
  getList,
  ListDetail,
  ListItem,
  addAdditionalColumnApi,
  removeAdditionalColumnApi,
  updateListDescription,
  findCollaboratorByEmail,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorPermissions,
  addListItemApi,
  updateListItemApi,
  deleteListItemApi,
  isLoggedIn,
  getCurrentUser,
  getAccessToken,
  deleteListApi,
} from '../../utils/api';

const ListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'not-found' | 'access-denied' | 'other' | null>(null);

  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [addColName, setAddColName] = useState('');
  const [addColType, setAddColType] = useState('text');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPerms, setCollabPerms] = useState<string[]>(['addItem', 'editItem', 'deleteItem']);
  const [collabName, setCollabName] = useState<string>('');
  const [publicUserName, setPublicUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showPermsModal, setShowPermsModal] = useState(false);
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);
  const [collabListExpanded, setCollabListExpanded] = useState(true);
  const [newItem, setNewItem] = useState<{ [k: string]: any }>({ name: '', qty: '', unit: 'pcs' });
  
  // WhoBrings editor state
  const [showWhoBringsModal, setShowWhoBringsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [whoBringers, setWhoBringers] = useState<Array<{ name: string; qty: string; userId?: string }>>([]);

  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  
  // Delete column confirmation
  const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  // Delete item confirmation
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [dontShowDeleteItemModalAgain, setDontShowDeleteItemModalAgain] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{itemId: string, itemName: string} | null>(null);
  
  // Column filters
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  
  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mobile collapsible pane
  const [isActionsPaneOpen, setIsActionsPaneOpen] = useState<boolean>(false);
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseColumns = useMemo(() => ['name', 'qty', 'unit', 'whoBrings'], []);
  const dynamicColumns = useMemo(() => list?.additionalColumns?.map(c => c.name) || [], [list]);
  const allColumns = useMemo(() => [...baseColumns, ...dynamicColumns], [baseColumns, dynamicColumns]);
  
  const getColumnType = useCallback((colName: string): string => {
    if (colName === 'qty') return 'number';
    if (colName === 'whoBrings') return 'whoBrings';
    const col = list?.additionalColumns?.find(c => c.name === colName);
    return col?.type || 'text';
  }, [list?.additionalColumns]);
  
  const whoBringsOptions = useMemo(() => {
    if (!list) return [];
    if (list.isPublic) {
      // Collect all unique userNames from whoBrings across all items
      const names = new Set<string>();
      // Add current user's name first (if logged in or has public username)
      if (publicUserName) {
        names.add(publicUserName);
      }
      list.items?.forEach(item => {
        item.whoBrings?.forEach(w => w.userName && names.add(w.userName));
      });
      return Array.from(names);
    } else {
      // List all collaborators + owner
      const options = new Set<string>();
      if (list.ownerName) options.add(list.ownerName);
      list.collaborators?.forEach(c => options.add(c.userName));
      // Add current user if they're logged in and have a name
      if (publicUserName && (list.ownerId === currentUserId || list.collaborators?.some(c => c.userId === currentUserId))) {
        options.add(publicUserName);
      }
      return Array.from(options);
    }
  }, [list, publicUserName, currentUserId]);
  
  // Get unique values for a filterable column
  const getColumnFilterOptions = (colName: string): string[] => {
    if (!list?.items) return [];
    const values = new Set<string>();
    const colType = getColumnType(colName);
    
    if (colName === 'whoBrings') {
      list.items.forEach(item => {
        item.whoBrings?.forEach(w => w.userName && values.add(w.userName));
      });
    } else if (colType === 'checkbox') {
      // For checkbox columns, show boolean values
      values.add('true');
      values.add('false');
    } else {
      list.items.forEach(item => {
        const value = (item as any)[colName];
        if (value !== undefined && value !== null && value !== '') {
          values.add(String(value));
        }
      });
    }
    
    return Array.from(values).sort();
  };
  
  // Check if a column is filterable
  const isFilterableColumn = (colName: string): boolean => {
    const colType = getColumnType(colName);
    return !['name', 'qty', 'unit'].includes(colName) && colType !== 'price';
  };

  // Check if column is a price type
  const isPriceColumn = (colName: string): boolean => {
    const colType = getColumnType(colName);
    return colType === 'price';
  }

  // Calculate total price for a price column
  const getTotalPriceForColumn = (colName: string): number => {
    if (!list?.items) return 0;
    return list.items.map(v => Number(v[colName]) || 0).reduce((a, b) => a + b, 0);
  };

  // Format price to locale with commas and 2 decimals
  const formatPrice = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Filter items based on active filters and search query
  const filteredItems = useMemo(() => {
    if (!list?.items) return [];
    
    let items = list.items;
    
    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(query)
      );
    }
    
    // Then apply column filters
    const activeFilters = Object.entries(columnFilters).filter(([_, value]) => value);
    if (activeFilters.length === 0) return items;
    
    return items.filter(item => {
      return activeFilters.every(([col, filterValue]) => {
        if (col === 'whoBrings') {
          return item.whoBrings?.some(w => w.userName === filterValue);
        } else {
          const colType = getColumnType(col);
          const itemValue = (item as any)[col];
          if (colType === 'checkbox') {
            // For checkbox, compare boolean values
            const itemBool = itemValue === true || itemValue === 'true';
            const filterBool = filterValue === 'true';
            return itemBool === filterBool;
          }
          return String(itemValue) === filterValue;
        }
      });
    });
  }, [list?.items, columnFilters, searchQuery, getColumnType]);

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
    { value: 'addListItem', label: 'Add Items' },
    { value: 'updateListItem', label: 'Edit Items' },
    { value: 'deleteListItem', label: 'Delete Items' },
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
          const savedName = localStorage.getItem('colabshopper_public_username');
          savedName ? setPublicUserName(savedName) : setShowUsernameModal(true);
        }
      } catch (e: any) {
        const errorMsg = e?.message || 'Failed to load list';
        const status = e?.status || 0;
        setError(errorMsg);
        // Determine error type based on status code or message
        if (status === 404 || errorMsg.toLowerCase().includes('not found')) {
          setErrorType('not-found');
        } else if (status === 401 || status === 403 || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('access denied') || errorMsg.toLowerCase().includes('permission')) {
          setErrorType('access-denied');
        } else {
          setErrorType('other');
        }
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [listId]);


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
        if (msg.action === 'deleteList') {
          setError('This list has been deleted');
          setErrorType('not-found');
          return null;
        }
        return actions[msg.action]?.(prev) || prev;
      });
    };
    
    const connect = () => {
      if (cleanup || attempts >= MAX) return;
      
      socket = new WebSocket('wss://backend.colabshopper.com/ws');
      
      socket.onopen = () => {
        attempts = 0;
        const token = isLoggedIn() ? getAccessToken() : undefined;
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

  const onDeleteListClick = async () => {
    setShowDeleteListModal(true);
  }

  const onCancelDeleteList = () => {
    setShowDeleteListModal(false);
  };

  const onConfirmDeleteList = async () => {
    if (!listId) return;
    try {
      await deleteListApi(listId);
      setShowDeleteListModal(false);
      // Redirect to home or my-lists page
      window.location.href = '/my-lists';
    } catch (e: any) {
      handleError(e, 'Failed to remove column');
    }
  }

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

  const onRemoveColumnClick = (name: string) => {
    setColumnToDelete(name);
    setShowDeleteColumnModal(true);
  };

  const onConfirmDeleteColumn = async () => {
    if (!listId || !columnToDelete) return;
    try {
      await removeAdditionalColumnApi(listId, columnToDelete);
      setShowDeleteColumnModal(false);
      setColumnToDelete(null);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to remove column');
    }
  };

  const onCancelDeleteColumn = () => {
    setShowDeleteColumnModal(false);
    setColumnToDelete(null);
  };
  

  const onDeleteItemClick = async (itemId: string, itemName: string) => {
    setItemToDelete({itemId, itemName});
    if(dontShowDeleteItemModalAgain)
      onConfirmDeleteItem(itemId, true)
    else
      setShowDeleteItemModal(true);

  };

  const onConfirmDeleteItem = async (itemId: string, dontShowAgain: boolean = false) => {
    if (!listId || !itemId) return;
    if(dontShowAgain && !dontShowDeleteItemModalAgain)
      setDontShowDeleteItemModalAgain(true);
    try {
      await deleteItem(itemId);
      setItemToDelete(null);
      setShowDeleteItemModal(false);
    } catch (e: any) {
      handleError(e, 'Failed to remove column');
    }
  };
  
  const onCancelDeleteItem = () => {
    setShowDeleteItemModal(false);
    setItemToDelete(null);
  };

  const toggleFilterDropdown = (colName: string) => {
    setShowFilterDropdown(showFilterDropdown === colName ? null : colName);
  };
  
  const applyFilter = (colName: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [colName]: value }));
    setShowFilterDropdown(null);
  };
  
  const clearFilter = (colName: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[colName];
      return newFilters;
    });
    setShowFilterDropdown(null);
  };
  
  const clearAllFilters = () => {
    setColumnFilters({});
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-container')) {
        setShowFilterDropdown(null);
      }
    };
    
    if (showFilterDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFilterDropdown]);

  const onAddCollaboratorClick = async () => {
    if (!collabEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
    
    try {
      // Fetch collaborator name from backend
      const result = await findCollaboratorByEmail(collabEmail.trim());
      
      if (result.collaboratorName) {
        // User exists - proceed to permissions modal
        setCollabName(result.collaboratorName);
        setEditingCollabId(null);
        setShowPermsModal(true);
      } else {
        // User doesn't exist - ask for name first
        setNameInput('');
        setShowNameModal(true);
      }
    } catch (e: any) {
      handleError(e, 'Failed to lookup collaborator');
    }
  };

  const onNameModalSubmit = () => {
    if (!nameInput.trim()) {
      alert('Please enter a name');
      return;
    }
    setCollabName(nameInput.trim());
    setShowNameModal(false);
    setEditingCollabId(null);
    setShowPermsModal(true);
  };

  const onAddCollaborator = async () => {
    if (!listId || !collabEmail.trim() || collabPerms.length === 0) return;
    try {
      // Pass collaboratorName only if it was manually entered (user doesn't exist)
      const nameToSend = collabName && !editingCollabId ? collabName : undefined;
      await addCollaborator(listId, collabEmail.trim(), collabPerms, nameToSend);
      setCollabEmail('');
      setCollabName('');
      setCollabPerms(['addItem', 'editItem', 'deleteItem']);
      setShowPermsModal(false);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to add collaborator');
    }
  };

  const onEditPermissionsClick = (userId: string, currentPerms: string[], userName: string) => {
    setEditingCollabId(userId);
    setCollabName(userName);
    setCollabPerms([...currentPerms]);
    setShowPermsModal(true);
  };

  const onUpdatePermissions = async () => {
    if (!listId || !editingCollabId || collabPerms.length === 0) return;
    try {
      await updateCollaboratorPermissions(listId, editingCollabId, collabPerms);
      setShowPermsModal(false);
      setEditingCollabId(null);
      setCollabPerms(['addItem', 'editItem', 'deleteItem']);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to update permissions');
    }
  };

  const togglePermission = (permission: string) => {
    setCollabPerms(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const closePermsModal = () => {
    setShowPermsModal(false);
    setEditingCollabId(null);
    setCollabName('');
    if (!editingCollabId) {
      setCollabPerms(['addItem', 'editItem', 'deleteItem']);
    }
  };

  const closeNameModal = () => {
    setShowNameModal(false);
    setNameInput('');
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
      const colType = getColumnType(col);
      if (colType === 'checkbox') {
        // For checkbox, include the value (true/false) only if it's checked
        if (newItem[col] === true || newItem[col] === 'true') {
          payload[col] = true;
        }
      } else if (newItem[col]) {
        payload[col] = newItem[col];
      }
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
      // Reset new item form, but preserve dynamic columns structure
      const resetItem: { [k: string]: any } = { name: '', qty: '', unit: 'pcs' };
      dynamicColumns.forEach(col => {
        const colType = getColumnType(col);
        if (colType === 'checkbox') {
          resetItem[col] = false;
        } else {
          resetItem[col] = '';
        }
      });
      setNewItem(resetItem);
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

  const onToggleCompleted = async (item: ListItem) => {
    if (!listId) return;
    try {
      const newCompleted = !(item.completed ?? false);
      await updateListItemApi(listId, item._id, 'completed', newCompleted);
      // No need to refresh - WebSocket will handle the update
    } catch (e: any) {
      handleError(e, 'Failed to update completed status');
    }
  };

  const deleteItem = async (itemId: string) => {
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
    localStorage.setItem('colabshopper_public_username', name);
    setShowUsernameModal(false);
    setUsernameInput('');
  };

  const onEditWhoBrings = (item: ListItem) => {
    setEditingItem(item);
    
    // Initialize whoBringers from existing data or with default
    if (item.whoBrings && item.whoBrings.length > 0) {
      setWhoBringers(item.whoBrings.map(w => ({
        name: w.userName,
        qty: String(w.qty),
        userId: w.userId
      })));
    } else {
      // Default: current user with full quantity
      const defaultName = list?.isPublic ? publicUserName : (list?.ownerName || '');
      const defaultUserId = list?.isPublic ? undefined : currentUserId || undefined;
      setWhoBringers([{ name: defaultName, qty: String(item.qty), userId: defaultUserId }]);
    }
    
    setShowWhoBringsModal(true);
  };

  const onAddWhoBringer = () => {
    const defaultName = list?.isPublic ? publicUserName : (list?.ownerName || '');
    const defaultUserId = list?.isPublic ? undefined : currentUserId || undefined;
    const remainingQty = calculateRemainingQty();
    setWhoBringers([...whoBringers, { name: defaultName, qty: String(remainingQty), userId: defaultUserId }]);
  };

  const onRemoveWhoBringer = (index: number) => {
    setWhoBringers(whoBringers.filter((_, i) => i !== index));
  };

  const updateWhoBringer = (index: number, field: 'name' | 'qty', value: string) => {
    const updated = [...whoBringers];
    updated[index][field] = value;
    
    // If name changed and it's a private list, find the userId
    if (field === 'name' && !list?.isPublic) {
      const collab = list?.collaborators?.find(c => c.userName === value);
      if (collab) {
        updated[index].userId = collab.userId;
      } else if (list?.ownerName === value && list?.ownerId) {
        updated[index].userId = list.ownerId;
      }
    }
    
    setWhoBringers(updated);
  };

  const calculateRemainingQty = () => {
    if (!editingItem) return 0;
    const totalQty = editingItem.qty;
    const assignedQty = whoBringers.reduce((sum, w) => sum + (Number(w.qty) || 0), 0);
    return Math.max(0, totalQty - assignedQty);
  };

  const onSaveWhoBrings = async () => {
    if (!listId || !editingItem) return;
    
    try {
      // Format whoBrings data for API
      const formattedWhoBrings = whoBringers
        .filter(w => w.name.trim() && Number(w.qty) > 0)
        .map(w => {
          if (list?.isPublic) {
            return { userName: w.name, qty: w.qty };
          } else {
            return { userId: w.userId, userName: w.name, qty: w.qty };
          }
        });

      await updateListItemApi(listId, editingItem._id, 'whoBrings', formattedWhoBrings);
      setShowWhoBringsModal(false);
      setEditingItem(null);
      setWhoBringers([]);
      await refresh();
    } catch (e: any) {
      handleError(e, 'Failed to update who brings');
    }
  };

  const closeWhoBringsModal = () => {
    setShowWhoBringsModal(false);
    setEditingItem(null);
    setWhoBringers([]);
  };

  if (loading) {
    return (
      <div className="list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading list...</p>
        </div>
      </div>
    );
  }
  
  if (error || !list) {
    return (
      <div className="list-page">
        <div className="error-container">
          <div className="error-icon">
            {errorType === 'not-found' ? (
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : errorType === 'access-denied' ? (
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V10C20 8.89543 19.1046 8 18 8H17M6 21C4.89543 21 4 20.1046 4 19V10C4 8.89543 4.89543 8 6 8H7M6 21H4M17 8V5C17 3.89543 16.1046 3 15 3H9C7.89543 3 7 3.89543 7 5V8M17 8H7M9 12H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h1 className="error-title">
            {errorType === 'not-found' 
              ? "List Not Found" 
              : errorType === 'access-denied'
              ? "Access Denied"
              : "Error Loading List"}
          </h1>
          <p className="error-message">
            {errorType === 'not-found'
              ? "The list you're looking for doesn't exist or may have been deleted."
              : errorType === 'access-denied'
              ? "You don't have permission to access this list. Please make sure you're logged in with the correct account or request access from the list owner."
              : error || "An unexpected error occurred while loading the list."}
          </p>
          <div className="error-actions">
            <Link to="/" className="error-button primary">
              Go to Home
            </Link>
            {isLoggedIn() && (
              <Link to="/my-lists" className="error-button secondary">
                My Lists
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

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
        {isMobile ? (
          <>
            {/* Mobile: List name and description outside settings */}
            <div className="mobile-list-header">
              <div className='list-title-section'>
                <div className="list-title-details">
                  <h2>{list.name}</h2>
                  <div className="list-meta">
                    {isPrivate ? '🔒 Private List' : '🌐 Public List'} • {list.items?.length || 0} items
                  </div>
                </div>
                {list && !list.isPublic && list.ownerId === currentUserId && (
                  <div className="list-title-actions">
                    <button onClick={() => onDeleteListClick()} title="Delete List">🗑️</button>
                  </div>
                )}
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
               {/* Mobile: Settings button */}
              <button 
                className="mobile-toggle-pane-btn"
                onClick={() => setIsActionsPaneOpen(!isActionsPaneOpen)}
                aria-label="Toggle actions pane"
              >
                <span>{isActionsPaneOpen ? '▼' : '▶'}</span>
                <span>{isActionsPaneOpen ? 'Hide' : 'Show'} Settings</span>
              </button>
            </div>

           

            {/* Mobile: Separate settings pane */}
            <div className={`mobile-settings-pane ${isActionsPaneOpen ? 'open' : ''}`}>
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
                    style={{ width: '100%' }}
                  />
                  <button 
                    onClick={onAddCollaboratorClick}
                    style={{ width: '100%', marginTop: '0.75rem' }}
                  >
                    Add Collaborator
                  </button>
                  
                  {list.collaborators && list.collaborators.length > 0 && (
                    <>
                      <div 
                        className="collab-list-header"
                        onClick={() => setCollabListExpanded(!collabListExpanded)}
                      >
                        <span>Current Collaborators ({list.collaborators.length})</span>
                        <span className={`expand-arrow ${collabListExpanded ? 'expanded' : ''}`}>▼</span>
                      </div>
                      {collabListExpanded && (
                        <ul className="collab-list">
                          {list.collaborators.map(c => (
                            <li key={c.userId}>
                              <div className="collab-info">
                                <span className="collab-name">{c.userName}</span>
                                <div className="collab-perms">
                                  {c.permissions.map(p => {
                                    const perm = permissionOptions.find(po => po.value === p);
                                    return perm ? perm.label : p;
                                  }).join(', ')}
                                </div>
                              </div>
                              <div className="collab-actions-vertical">
                                <button 
                                  onClick={() => onEditPermissionsClick(c.userId, c.permissions, c.userName)}
                                  className="edit-btn-small"
                                  title="Edit Permissions"
                                >
                                  ✎
                                </button>
                                <button 
                                  onClick={() => onRemoveCollaborator(c.userId)}
                                  className="remove-btn-small"
                                  title="Remove Collaborator"
                                >
                                  🗑️
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
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
                      <option value="price">Price/Cost</option>
                      <option value="person">Person</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  <button onClick={onAddColumn} style={{ width: '100%' }}>Add Column</button>
                  <div className="chips">
                    {dynamicColumns.map(col => (
                      <span key={col} className="chip">
                        {col}
                        <button onClick={() => onRemoveColumnClick(col)} title="Remove">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Desktop: Original actions pane with everything */
          <div className="actions-pane">
            <div className='list-title-section'>
              <div className="list-title-details">
                <h2>{list.name}</h2>
                <div className="list-meta">
                  {isPrivate ? '🔒 Private List' : '🌐 Public List'} • {list.items?.length || 0} items
                </div>
              </div>
              {list && !list.isPublic && list.ownerId === currentUserId && (
                <div className="list-title-actions">
                  <button onClick={() => onDeleteListClick()} title="Delete List">🗑️</button>
                </div>
              )}
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
                  style={{ width: '100%' }}
                />
                <button 
                  onClick={onAddCollaboratorClick}
                  style={{ width: '100%', marginTop: '0.75rem' }}
                >
                  Add Collaborator
                </button>
                
                {list.collaborators && list.collaborators.length > 0 && (
                  <>
                    <div 
                      className="collab-list-header"
                      onClick={() => setCollabListExpanded(!collabListExpanded)}
                    >
                      <span>Current Collaborators ({list.collaborators.length})</span>
                      <span className={`expand-arrow ${collabListExpanded ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {collabListExpanded && (
                      <ul className="collab-list">
                        {list.collaborators.map(c => (
                          <li key={c.userId}>
                            <div className="collab-info">
                              <span className="collab-name">{c.userName}</span>
                              <div className="collab-perms">
                                {c.permissions.map(p => {
                                  const perm = permissionOptions.find(po => po.value === p);
                                  return perm ? perm.label : p;
                                }).join(', ')}
                              </div>
                            </div>
                            <div className="collab-actions-vertical">
                              <button 
                                onClick={() => onEditPermissionsClick(c.userId, c.permissions, c.userName)}
                                className="edit-btn-small"
                                title="Edit Permissions"
                              >
                                ✎
                              </button>
                              <button 
                                onClick={() => onRemoveCollaborator(c.userId)}
                                className="remove-btn-small"
                                title="Remove Collaborator"
                              >
                                🗑️
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
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
                    <option value="price">Price/Cost</option>
                    <option value="person">Person</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <button onClick={onAddColumn} style={{ width: '100%' }}>Add Column</button>
                <div className="chips">
                  {dynamicColumns.map(col => (
                    <span key={col} className="chip">
                      {col}
                      <button onClick={() => onRemoveColumnClick(col)} title="Remove">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="table-pane">
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search items by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {Object.keys(columnFilters).length > 0 && (
            <div className="active-filters-bar">
              <span className="filter-count">
                {Object.keys(columnFilters).length} filter{Object.keys(columnFilters).length > 1 ? 's' : ''} active
              </span>
              <button className="clear-all-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}
          <div className="table-wrapper">
            <table className="list-table">
              <thead>
                <tr>
                  <th className="completed-header">
                    <span>✓</span>
                  </th>
                  {allColumns.map(col => (
                    <th key={col}>
                      <div className="th-content">
                        <span>{col}</span>
                        {isFilterableColumn(col) && (
                          <div className="filter-container">
                            <button 
                              className={`filter-btn ${columnFilters[col] ? 'active' : ''}`}
                              onClick={() => toggleFilterDropdown(col)}
                              title="Filter"
                            >
                              🔍
                            </button>
                            {showFilterDropdown === col && (
                              <div className="filter-dropdown">
                                <div className="filter-header">
                                  Filter by {col}
                                  {columnFilters[col] && (
                                    <button 
                                      className="clear-filter-btn"
                                      onClick={() => clearFilter(col)}
                                      title="Clear filter"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <div className="filter-options">
                                  {getColumnFilterOptions(col).map(value => (
                                    <button
                                      key={value}
                                      className={`filter-option ${columnFilters[col] === value ? 'selected' : ''}`}
                                      onClick={() => applyFilter(col, value)}
                                    >
                                      {value}
                                    </button>
                                  ))}
                                  {getColumnFilterOptions(col).length === 0 && (
                                    <div className="no-options">No values to filter</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="new-row">
                  <td className="completed-cell"></td>
                  {allColumns.map(col => {
                    const colType = getColumnType(col);
                    return (
                      <td key={col}>
                        {colType === 'whoBrings' || colType === 'person' ? (
                          <select
                            value={newItem[col] ?? ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, [col]: e.target.value }))}
                            className="table-select"
                          >
                            <option value="">-- Select (optional) --</option>
                            {whoBringsOptions.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        ) : colType === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={newItem[col] === true || newItem[col] === 'true'}
                            onChange={(e) => setNewItem(prev => ({ ...prev, [col]: e.target.checked }))}
                            className="table-checkbox"
                          />
                        ) : (
                          <input
                            type={colType === 'number' || colType === 'price' ? 'number' : 'text'}
                            value={newItem[col] ?? ''}
                            onChange={(e) => setNewItem(prev => ({ ...prev, [col]: e.target.value }))}
                            placeholder={col}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <button onClick={onAddItem} title="Add">＋</button>
                  </td>
                </tr>

                {filteredItems.map(item => (
                  <tr key={item._id} className={item.completed ? 'completed-row' : ''}>
                    <td className="completed-cell">
                      <input
                        type="checkbox"
                        checked={item.completed ?? false}
                        onChange={() => onToggleCompleted(item)}
                        className="completed-checkbox"
                        title="Mark as completed"
                      />
                    </td>
                    {allColumns.map(col => {
                      const colType = getColumnType(col);
                      return (
                        <td key={col}>
                          {colType === 'whoBrings' ? (
                            <div className="who-brings-cell">
                              <span className="muted">
                                {Array.isArray(item.whoBrings) && item.whoBrings.length
                                  ? item.whoBrings.map(w => `${w.userName} (${w.qty})`).join(', ')
                                  : '-'}
                              </span>
                              <button 
                                onClick={() => onEditWhoBrings(item)} 
                                className="edit-who-brings-btn"
                                title="Edit Who Brings"
                              >
                                ✎
                              </button>
                            </div>
                          ) : colType === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={(item as any)[col] === true || (item as any)[col] === 'true'}
                              onChange={(e) => onUpdateCell(item, col, e.target.checked)}
                              className="table-checkbox"
                            />
                          ) : colType === 'person' ? (
                            <PersonEditable
                              value={String((item as any)[col] ?? '')}
                              options={whoBringsOptions}
                              onSave={(val) => onUpdateCell(item, col, val)}
                            />
                          ) : (
                            <InlineEditable
                              value={String((item as any)[col] ?? '')}
                              inputType={colType === 'number' || colType === 'price' ? 'number' : 'text'}
                              onSave={(val) => onUpdateCell(item, col, colType === 'number' || colType === 'price' ? Number(val) : val)}
                            />
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <button onClick={() => onDeleteItemClick(item._id, item.name)} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="completed-header">
                  </td>
                  {allColumns.map(col => (
                    <td key={col}>
                      <div className="tf-content">
                        {col === 'name' && (
                          <span>Total: </span>
                        )}
                        {isPriceColumn(col) && (
                          <span>
                            {formatPrice(getTotalPriceForColumn(col))}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* WhoBrings Editor Modal */}
      {showWhoBringsModal && editingItem && (
        <div className="perms-modal-overlay" onClick={closeWhoBringsModal}>
          <div className="perms-modal who-brings-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Who Brings</h2>
            <p className="modal-subtitle">
              Item: {editingItem.name} (Total: {editingItem.qty} {editingItem.unit})
            </p>

            <div className="who-brings-list">
              {whoBringers.map((bringer, index) => (
                <div key={index} className="who-bringer-row">
                  <div className="bringer-fields">
                    {list.isPublic ? (
                      <div className="public-name-field">
                        <label>Name:</label>
                        <select
                          value={bringer.name}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              // User wants to enter custom name
                              updateWhoBringer(index, 'name', '');
                            } else {
                              updateWhoBringer(index, 'name', e.target.value);
                            }
                          }}
                          className="bringer-name-select"
                        >
                          {whoBringsOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          <option value="__custom__">-- Enter new name --</option>
                        </select>
                        {(!whoBringsOptions.includes(bringer.name) || bringer.name === '') && (
                          <input
                            type="text"
                            value={bringer.name}
                            onChange={(e) => updateWhoBringer(index, 'name', e.target.value)}
                            placeholder="Enter name"
                            className="bringer-name-input"
                            autoFocus
                          />
                        )}
                      </div>
                    ) : (
                      <div className="private-name-field">
                        <label>Collaborator:</label>
                        <select
                          value={bringer.name}
                          onChange={(e) => updateWhoBringer(index, 'name', e.target.value)}
                          className="bringer-name-select"
                        >
                          {list.ownerName && <option value={list.ownerName}>{list.ownerName}</option>}
                          {list.collaborators?.map(c => (
                            <option key={c.userId} value={c.userName}>{c.userName}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="qty-field">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        value={bringer.qty}
                        onChange={(e) => updateWhoBringer(index, 'qty', e.target.value)}
                        placeholder="Quantity"
                        className="bringer-qty-input"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  {whoBringers.length > 1 && (
                    <button
                      onClick={() => onRemoveWhoBringer(index)}
                      className="remove-bringer-btn"
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {calculateRemainingQty() > 0 && (
              <div className="remaining-qty-info">
                Remaining quantity: {calculateRemainingQty()} {editingItem.unit}
              </div>
            )}

            {calculateRemainingQty() > 0 && (
              <button onClick={onAddWhoBringer} className="add-bringer-btn">
                + Add Another Person
              </button>
            )}

            <div className="modal-actions">
              <button 
                onClick={onSaveWhoBrings}
                className="primary-btn"
              >
                Save
              </button>
              <button onClick={closeWhoBringsModal} className="secondary-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Input Modal */}
      {showNameModal && (
        <div className="perms-modal-overlay" onClick={closeNameModal}>
          <div className="perms-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Collaborator Name</h2>
            <p className="modal-subtitle">
              This email is not registered. Please enter the collaborator's name:
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter full name"
              className="name-input"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && onNameModalSubmit()}
            />
            <div className="modal-actions">
              <button 
                onClick={onNameModalSubmit}
                disabled={!nameInput.trim()}
                className="primary-btn"
              >
                Continue
              </button>
              <button onClick={closeNameModal} className="secondary-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermsModal && (
        <div className="perms-modal-overlay" onClick={closePermsModal}>
          <div className="perms-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCollabId ? 'Edit Permissions' : 'Select Permissions'}</h2>
            <p className="modal-subtitle">
              {editingCollabId 
                ? `Update permissions for: ${collabName}` 
                : `Setting permissions for: ${collabName}`
              }
            </p>
            <div className="perms-grid">
              {permissionOptions.map(perm => (
                <label key={perm.value} className="perm-option">
                  <input
                    type="checkbox"
                    checked={collabPerms.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button 
                onClick={editingCollabId ? onUpdatePermissions : onAddCollaborator}
                disabled={collabPerms.length === 0}
                className="primary-btn"
              >
                {editingCollabId ? 'Update' : 'Add Collaborator'}
              </button>
              <button onClick={closePermsModal} className="secondary-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Column Confirmation Modal */}
      {showDeleteColumnModal && (
        <div className="perms-modal-overlay" onClick={onCancelDeleteColumn}>
          <div className="perms-modal delete-column-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete Column</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete the column <strong>"{columnToDelete}"</strong>?
            </p>
            <p className="warning-text">
              Once the column is removed, all values in this column will be permanently deleted. 
              This action is irreversible.
            </p>
            <div className="modal-actions">
              <button 
                onClick={onConfirmDeleteColumn}
                className="danger-btn"
              >
                Yes, Delete
              </button>
              <button onClick={onCancelDeleteColumn} className="secondary-btn">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Delete Item Confirmation Modal */}
       {showDeleteListModal && (
        <div className="perms-modal-overlay" onClick={onCancelDeleteList}>
          <div className="perms-modal delete-column-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete List</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete this entire list <strong>"{list.name}"</strong>? 
            </p>
            <p className="warning-text">
              Once the list is deleted, all data related to this list will be permanently removed. 
              This action is irreversible.
            </p>
            <div className="modal-actions">
              <button 
                onClick={onConfirmDeleteList}
                className="danger-btn"
              >
                Yes, Delete
              </button>
              <button onClick={onCancelDeleteList} className="secondary-btn">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {showDeleteItemModal && itemToDelete && (
        <div className="perms-modal-overlay" onClick={onCancelDeleteItem}>
          <div className="perms-modal delete-column-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete Item</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete this item <strong>"{itemToDelete.itemName}"</strong>? 
            </p>
            <div className="modal-actions">
            <button 
                onClick={() => onConfirmDeleteItem(itemToDelete.itemId, true)}
                className="danger-btn"
              >
                Delete and don't show again
              </button>
              <button 
                onClick={() => onConfirmDeleteItem(itemToDelete.itemId)}
                className="danger-btn"
              >
                Yes, Delete
              </button>
              <button onClick={onCancelDeleteItem} className="secondary-btn">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InlineEditable: React.FC<{ 
  value: string; 
  inputType?: string;
  onSave: (v: string) => void;
}> = ({ value, inputType = 'text', onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return editing ? (
    <span className="inline-edit">
      <input 
        type={inputType} 
        value={draft} 
        onChange={(e) => setDraft(e.target.value)} 
      />
      <button onClick={() => { onSave(draft); setEditing(false); }} title="Save">✓</button>
      <button onClick={() => { setDraft(value); setEditing(false); }} title="Cancel">×</button>
    </span>
  ) : (
    <span className="inline-view" onDoubleClick={() => setEditing(true)}>
      {value || '-'} <button onClick={() => setEditing(true)} title="Edit">✎</button>
    </span>
  );
};

const PersonEditable: React.FC<{ 
  value: string; 
  options: string[];
  onSave: (v: string) => void;
}> = ({ value, options, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return editing ? (
    <span className="inline-edit">
      <select 
        value={draft} 
        onChange={(e) => setDraft(e.target.value)}
        className="table-select"
      >
        <option value="">-- Select --</option>
        {options.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
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
