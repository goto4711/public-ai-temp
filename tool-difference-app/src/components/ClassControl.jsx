import React from 'react';

const ClassControl = ({
    id,
    name,
    count,
    onTrain,
    onNameChange,
    onDelete,
    color
}) => {
    return (
        <div className="control-group" style={{ borderLeft: `5px solid ${color}` }}>
            <div className="class-info">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(id, e.target.value)}
                    className="class-name-input"
                    placeholder={`Class ${id + 1}`}
                />
                <span className="example-count">{count} examples</span>
            </div>
            <button
                onClick={() => onTrain(id)}
                className="train-btn"
                style={{ backgroundColor: color, color: '#000' }} // Ensure text is readable on colored buttons
            >
                Add Data
            </button>
            <button
                onClick={() => onDelete(id)}
                className="btn delete-btn"
                style={{ marginLeft: '0.5rem', backgroundColor: '#666' }}
            >
                X
            </button>
        </div>
    );
};

export default ClassControl;
