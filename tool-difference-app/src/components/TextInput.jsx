import React, { useState } from 'react';

const TextInput = ({ onAddExample }) => {
    const [text, setText] = useState('');
    const [selectedClass, setSelectedClass] = useState(0);

    // We need to know which class to add to. 
    // But the design in App.jsx is that each ClassControl has its own "Train" button.
    // So this component might just be the *Input* source, like WebcamInput.
    // But unlike Webcam, Text is discrete.
    // So maybe we don't need a "Train" button here, but the "Train" button in ClassControl 
    // should trigger the read from this input.

    // However, to keep it simple and consistent with the "Stream" idea:
    // We can expose the current text value to the parent.

    return (
        <div className="text-input-container">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type something here to train..."
                rows={4}
                className="text-area"
                id="text-input-source" // ID for easy access if needed, but React state is better
            />
        </div>
    );
};

export default TextInput;
