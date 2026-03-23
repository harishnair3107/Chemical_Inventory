import React from 'react';
import '../styles/Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
