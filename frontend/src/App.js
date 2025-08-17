import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Get API base URL from environment or use localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareSubject, setShareSubject] = useState('');
  const [shareSender, setShareSender] = useState('amanbhagat.191@gmail.com');
  const [shareRecipients, setShareRecipients] = useState('');
  const [recipientTags, setRecipientTags] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscript(e.target.result);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) {
      setError('Please enter or upload a transcript');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/summarize`, {
        transcript: transcript,
        customPrompt: customPrompt
      });

      if (response.data.success) {
        setSummary(response.data.summary);
        setEditableSummary(response.data.summary);
        setSuccess('Summary generated successfully! You can now edit it if needed.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError(error.response?.data?.error || 'Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!editableSummary.trim() || recipientTags.length === 0) {
      setError('Please enter a summary and at least one recipient');
      return;
    }

    setIsSharing(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/share`, {
        summary: editableSummary,
        recipients: recipientTags,
        subject: shareSubject || 'Meeting Summary Shared',
        sender: shareSender
      });

      if (response.data.success) {
        setSuccess('Summary shared successfully!');
        setShowShare(false);
        setShareSubject('');
        setShareRecipients('');
        setRecipientTags([]);
      }
    } catch (error) {
      console.error('Error sharing summary:', error);
      setError(error.response?.data?.error || 'Failed to share summary. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const addRecipient = () => {
    const email = shareRecipients.trim();
    if (email && !recipientTags.includes(email)) {
      setRecipientTags([...recipientTags, email]);
      setShareRecipients('');
    }
  };

  const removeRecipient = (email) => {
    setRecipientTags(recipientTags.filter(r => r !== email));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addRecipient();
    }
  };

  const resetForm = () => {
    setTranscript('');
    setCustomPrompt('');
    setSummary('');
    setEditableSummary('');
    setError('');
    setSuccess('');
    setShowShare(false);
    setShareSubject('');
    setShareRecipients('');
    setRecipientTags([]);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI Meeting Notes Summarizer</h1>
        <p>Upload a transcript, customize your prompt, and get AI-powered summaries</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-section">
        <h2>1. Upload Transcript</h2>
        <div className="form-group">
          <label>Upload Text File (Optional):</label>
          <div className="file-upload" onClick={() => document.getElementById('fileInput').click()}>
            <input
              id="fileInput"
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
            />
            <p>Click to upload a .txt or .md file</p>
          </div>
        </div>
        
        <div className="form-group">
          <label>Or Paste Transcript Directly:</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript, call notes, or any text content here..."
          />
        </div>

        <div className="form-group">
          <label>Custom Instructions (Optional):</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
          />
        </div>

        <button 
          className="btn" 
          onClick={handleGenerateSummary}
          disabled={isLoading || !transcript.trim()}
        >
          {isLoading ? 'Generating Summary...' : 'Generate Summary'}
        </button>
      </div>

      {summary && (
        <div className="summary-section">
          <h2>2. Generated Summary</h2>
          <div className="form-group">
            <label>Edit Summary (if needed):</label>
            <textarea
              value={editableSummary}
              onChange={(e) => setEditableSummary(e.target.value)}
              className="summary-content"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowShare(!showShare)}
            >
              {showShare ? 'Hide Share Options' : 'Share Summary'}
            </button>
            <button className="btn btn-secondary" onClick={resetForm}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {showShare && (
        <div className="share-section">
          <h2>3. Share Summary</h2>
          <div className="form-group">
            <label>From Email (Sender):</label>
            <input
              type="email"
              value={shareSender}
              onChange={(e) => setShareSender(e.target.value)}
              placeholder="sender@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Email Subject:</label>
            <input
              type="text"
              value={shareSubject}
              onChange={(e) => setShareSubject(e.target.value)}
              placeholder="Meeting Summary - [Date]"
            />
          </div>

          <div className="form-group">
            <label>Recipients:</label>
            <div className="recipients-input">
              <input
                type="email"
                value={shareRecipients}
                onChange={(e) => setShareRecipients(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address and press Enter"
              />
              <button 
                className="btn btn-secondary" 
                onClick={addRecipient}
                style={{ marginTop: '10px' }}
              >
                Add Recipient
              </button>
            </div>
            
            {recipientTags.length > 0 && (
              <div>
                <strong>Recipients:</strong>
                {recipientTags.map((email, index) => (
                  <span key={index} className="recipient-tag">
                    {email}
                    <span className="remove" onClick={() => removeRecipient(email)}>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button 
            className="btn" 
            onClick={handleShare}
            disabled={isSharing || recipientTags.length === 0}
          >
            {isSharing ? 'Sharing...' : 'Share Summary'}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <p>AI is processing your transcript...</p>
        </div>
      )}
    </div>
  );
}

export default App; 