const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
      cb(null, true);
    } else {
      cb(new Error('Only text files are allowed'), false);
    }
  }
});

// Routes
app.post('/api/summarize', upload.single('transcript'), async (req, res) => {
  try {
    const { customPrompt, transcript } = req.body;
    let transcriptText = '';

    if (req.file) {
      // File upload
      transcriptText = req.file.buffer.toString('utf-8');
    } else if (transcript) {
      // Direct text input
      transcriptText = transcript;
    } else {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    if (!transcriptText.trim()) {
      return res.status(400).json({ error: 'Transcript is empty' });
    }

    // Call AI service for summarization
    const summary = await generateSummary(transcriptText, customPrompt);
    
    res.json({ 
      success: true, 
      summary: summary,
      originalText: transcriptText
    });

  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

app.post('/api/share', async (req, res) => {
  try {
    const { summary, recipients, subject, sender } = req.body;
    
    if (!summary || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Send email
    await sendEmail(recipients, subject, summary, sender);
    
    res.json({ success: true, message: 'Summary shared successfully' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// AI Summarization function
async function generateSummary(transcript, customPrompt) {
  try {
    // Using Groq API (you can replace with any AI service)
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      // Fallback to a simple summary if no API key
      return generateSimpleSummary(transcript, customPrompt);
    }

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a professional meeting summarizer. Create clear, structured summaries based on user instructions.'
        },
        {
          role: 'user',
          content: `Transcript: ${transcript}\n\nInstructions: ${customPrompt || 'Provide a clear summary of the key points discussed in this meeting.'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      }
    });

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error('AI service error:', error);
    // Fallback to simple summary
    return generateSimpleSummary(transcript, customPrompt);
  }
}

// Fallback simple summarization
function generateSimpleSummary(transcript, customPrompt) {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyPoints = sentences.slice(0, 5).map(s => `• ${s.trim()}`);
  
  let summary = 'Summary:\n' + keyPoints.join('\n');
  
  if (customPrompt) {
    summary = `Custom Instructions: ${customPrompt}\n\n${summary}`;
  }
  
  return summary;
}

// Email sending function
async function sendEmail(recipients, subject, summary, sender = 'amanbhagat.191@gmail.com') {
  try {
    // Check if SendGrid API key is configured
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    
    console.log('Debug: SENDGRID_API_KEY =', sendgridApiKey ? sendgridApiKey.substring(0, 10) + '...' : 'NOT FOUND');
    console.log('Debug: All environment variables:', Object.keys(process.env).filter(key => key.includes('SENDGRID')));
    
    if (!sendgridApiKey) {
      // Fallback to console logging if no SendGrid API key
      console.log('Email would be sent to:', recipients);
      console.log('Subject:', subject);
      console.log('Content:', summary);
      console.log('Note: To send real emails, configure SENDGRID_API_KEY in .env file');
      
      // Simulate email delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    // Validate API key format
    if (!sendgridApiKey.startsWith('SG.')) {
      console.log('Error: SendGrid API key must start with "SG."');
      console.log('Current API key format:', sendgridApiKey ? sendgridApiKey.substring(0, 10) + '...' : 'EMPTY');
      throw new Error('Invalid SendGrid API key format');
    }

    // Use SendGrid for real email sending
    sgMail.setApiKey(sendgridApiKey);

    // Send email to each recipient
    for (const recipient of recipients) {
      const msg = {
        to: recipient,
        from: sender, // Use the sender email from the request
        subject: subject,
        text: summary,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Meeting Summary</h2>
          <div style="white-space: pre-wrap;">${summary}</div>
        </div>`
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to: ${recipient}`);
    }
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 