import React from 'react';
import '../styles/Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
        {...props}
      />
    </div>
  );
};

export default Input;
