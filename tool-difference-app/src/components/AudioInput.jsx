import React from 'react';

const AudioInput = ({ isListening }) => {
    return (
        <div className="audio-input-container">
            <div className={`mic-icon ${isListening ? 'listening' : ''}`}>
                🎤
            </div>
            <p>{isListening ? "Listening..." : "Ready to record"}</p>
            <p className="hint">Click a class button to record a sound sample.</p>
        </div>
    );
};

export default AudioInput;
