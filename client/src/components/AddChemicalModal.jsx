import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import '../styles/Modal.css';

const AddChemicalModal = ({ isOpen, onClose, onAdd, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    formula: initialData?.formula || '',
    quantity: initialData?.quantity || '',
    unit: initialData?.unit || 'ml',
    category: initialData?.category || 'General',
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
    storageLocation: initialData?.storageLocation || ''
  });

  React.useEffect(() => {
    if (initialData) {
        setFormData({
            name: initialData.name,
            formula: initialData.formula,
            quantity: initialData.quantity,
            unit: initialData.unit,
            category: initialData.category,
            expiryDate: new Date(initialData.expiryDate).toISOString().split('T')[0],
            storageLocation: initialData.storageLocation
        });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData, initialData?._id);
    if (!initialData) {
        setFormData({
            name: '',
            formula: '',
            quantity: '',
            unit: 'ml',
            category: 'General',
            expiryDate: '',
            storageLocation: ''
        });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Chemical' : 'Add New Chemical'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <Input 
              label="Chemical Name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
            <Input 
              label="Formula" 
              value={formData.formula} 
              onChange={(e) => setFormData({...formData, formula: e.target.value})} 
            />
            <Input 
              label="Quantity" 
              type="number" 
              value={formData.quantity} 
              onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
              required 
            />
            <div className="input-group">
                <label>Unit</label>
                <select 
                    value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="custom-select"
                >
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="mg">mg</option>
                    <option value="kg">kg</option>
                </select>
            </div>
            <Input 
              label="Category" 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
            />
            <Input 
              label="Expiry Date" 
              type="date" 
              value={formData.expiryDate} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
              required 
            />
            <Input 
              label="Storage Location" 
              value={formData.storageLocation} 
              onChange={(e) => setFormData({...formData, storageLocation: e.target.value})} 
              required 
            />
          </div>
          <div className="modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? 'Update Chemical' : 'Add Chemical'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChemicalModal;
