import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { Plus, Search, Filter, MoreVertical, RefreshCcw, CheckCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddChemicalModal from '../components/AddChemicalModal';
import UpdateStockModal from '../components/UpdateStockModal';
import '../styles/InventoryList.css';

const InventoryList = () => {
  const { user } = useAuth();
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState(null);
  const [updatingChemical, setUpdatingChemical] = useState(null);

  useEffect(() => {
    fetchChemicals();
    const interval = setInterval(fetchChemicals, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchChemicals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      setChemicals(res.data);
    } catch (err) {
      console.error('Failed to fetch chemicals');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/inventory/${id}/status`, {
        status: newStatus,
        userId: user.id,
        username: user.username
      });
      fetchChemicals();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddChemical = async (formData, id) => {
    try {
      if (id) {
          // Edit mode
          await axios.put(`http://localhost:5000/api/inventory/${id}`, {
              ...formData,
              userId: user.id,
              username: user.username,
              role: user.role
          });
      } else {
          // Add mode
          await axios.post('http://localhost:5000/api/inventory', {
            ...formData,
            userId: user.id,
            username: user.username,
            role: user.role
          });
      }
      setIsModalOpen(false);
      setEditingChemical(null);
      fetchChemicals();
    } catch (err) {
      alert(`Failed to ${id ? 'update' : 'add'} chemical: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateStock = async (updateData) => {
    try {
      await axios.post(`http://localhost:5000/api/inventory/${updatingChemical._id}/update`, {
        ...updateData,
        userId: user.id,
        username: user.username,
        role: user.role
      });
      setIsUpdateModalOpen(false);
      setUpdatingChemical(null);
      fetchChemicals();
    } catch (err) {
      alert(`Failed to update stock: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteChemical = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chemical?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
          data: { userId: user.id, username: user.username, role: user.role }
      });
      fetchChemicals();
    } catch (err) {
      alert(`Failed to delete chemical: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="page inventory-page">
      <header className="page-header">
        <div>
          <h1>Chemical Inventory</h1>
          <p>Manage and track your chemical stock records.</p>
        </div>
        {user?.role === 'admin' && (
          <Button className="add-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Chemical</span>
          </Button>
        )}
      </header>

      <div className="inventory-controls">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search chemicals..." />
        </div>
        <Button variant="outline" className="filter-btn">
          <Filter size={18} />
          <span>Filter</span>
        </Button>
      </div>

      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Chemical Name</th>
              <th>Formula</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Expiry Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading chemicals...</td></tr>
            ) : chemicals.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No chemicals found.</td></tr>
            ) : (
                chemicals.map((chem) => (
                    <tr key={chem._id}>
                      <td className="chem-name">{chem.name}</td>
                      <td>{chem.formula}</td>
                      <td>{chem.quantity} {chem.unit}</td>
                      <td><span className="category-tag">{chem.category || 'General'}</span></td>
                      <td>{new Date(chem.expiryDate).toLocaleDateString()}</td>
                      <td>{chem.storageLocation}</td>
                      <td>
                        <span className={`status-badge ${(chem.status || 'Available').toLowerCase()}`}>
                          {chem.status || 'Available'}
                        </span>
                      </td>
                       <td>
                        <div className="action-group">
                          {(user?.role === 'employee' || user?.role === 'admin') && (
                            <button onClick={() => { setUpdatingChemical(chem); setIsUpdateModalOpen(true); }} title="Update Stock" className="action-btn refill">
                              <RefreshCcw size={16} />
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <>
                              <button onClick={() => { setEditingChemical(chem); setIsModalOpen(true); }} className="action-btn edit" title="Edit Item">
                                <MoreVertical size={16} />
                              </button>
                              <button onClick={() => handleDeleteChemical(chem._id)} className="action-btn delete" title="Delete Item">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <AddChemicalModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingChemical(null); }} 
        onAdd={handleAddChemical}
        initialData={editingChemical}
      />

      <UpdateStockModal
        isOpen={isUpdateModalOpen}
        onClose={() => { setIsUpdateModalOpen(false); setUpdatingChemical(null); }}
        onUpdate={handleUpdateStock}
        chemical={updatingChemical}
      />
    </div>
  );
};

export default InventoryList;
