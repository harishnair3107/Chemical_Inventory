import React, { useState, useEffect } from 'react';
import { X, Check, Truck, CreditCard, Info } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import '../styles/Modal.css';

const UpdateStockModal = ({ isOpen, onClose, onUpdate, chemical, role }) => {
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isDelivered, setIsDelivered] = useState(false);
  const [isPaymentReceived, setIsPaymentReceived] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (chemical) {
      setNewQuantity(role === 'admin' ? chemical.quantity : 0);
      setReason('');
      setIsDelivered(false);
      setIsPaymentReceived(false);
      setError('');
    }
  }, [chemical, role]);

  if (!isOpen || !chemical) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number(newQuantity);
    
    if (role !== 'admin') {
        if (val > chemical.quantity) {
            setError(`Cannot sell more than available (${chemical.quantity} ${chemical.unit})`);
            return;
        }
        onUpdate({
            soldQuantity: val,
            reason,
            isDelivered,
            isPaymentReceived
        });
    } else {
        onUpdate({
            newQuantity: val,
            reason,
            isDelivered,
            isPaymentReceived
        });
    }
  };

  const remaining = role === 'admin' ? Number(newQuantity) : (chemical.quantity - Number(newQuantity));

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px', background: '#FFFFFF' }}>
        <header className="modal-header" style={{ background: '#f9fafb' }}>
          <div className="header-title">
            <h2 style={{ color: '#111827', margin: 0 }}>{role === 'admin' ? 'Refill / Override Stock' : 'Record Sale / Usage'}</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>{chemical.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form" style={{ background: '#FFFFFF' }}>
          {error && <div className="error-msg" style={{ marginBottom: '1rem', padding: '0.5rem', fontSize: '0.85rem' }}>{error}</div>}
          
          <div className="quantity-input-wrapper" style={{ marginBottom: '1.5rem' }}>
            <Input
                label={role === 'admin' ? `New Total Quantity (${chemical.unit})` : `Quantity Sold/Used (${chemical.unit})`}
                type="number"
                value={newQuantity}
                onChange={(e) => {
                    setNewQuantity(e.target.value);
                    if (error) setError('');
                }}
                required
                min="0"
                max={role === 'admin' ? undefined : chemical.quantity}
                icon={<Info size={18} />}
            />
            <div className="stock-preview" style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.85rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                color: 'var(--text-secondary)',
                padding: '0 0.5rem'
            }}>
                <span>Initial: {chemical.quantity}</span>
                <span style={{ fontWeight: '600', color: remaining < 10 ? '#ef4444' : 'var(--accent-primary)' }}>
                    Remaining: {remaining} {chemical.unit}
                </span>
            </div>
          </div>

          <div className="reason-field" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Reason for Update</label>
            <textarea
              className="input-field"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sold to Lab A, Research usage, etc."
              required
              rows="3"
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          <div className="status-toggles" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="toggle-field">
                <div className="toggle-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={16} color={isDelivered ? '#3b82f6' : 'var(--text-secondary)'} />
                        <span className="toggle-label">Chemical Delivered</span>
                    </div>
                    <span className="toggle-desc">Mark if item has reached destination</span>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={isDelivered} onChange={(e) => setIsDelivered(e.target.checked)} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="toggle-field">
                <div className="toggle-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={16} color={isPaymentReceived ? '#10b981' : 'var(--text-secondary)'} />
                        <span className="toggle-label">Payment Received</span>
                    </div>
                    <span className="toggle-desc">Mark if transaction is complete</span>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={isPaymentReceived} onChange={(e) => setIsPaymentReceived(e.target.checked)} />
                    <span className="slider"></span>
                </label>
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flex: 2 }}>Confirm Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
