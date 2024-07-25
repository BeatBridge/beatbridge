import React from 'react';
import './custommodal.css';

const CustomModal = ({ isOpen, onRequestClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onRequestClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="delete-button">Delete</button>
                    <button onClick={onRequestClose} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
