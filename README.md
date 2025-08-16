# AI Meeting Notes Summarizer

A full-stack MERN application that uses AI to summarize meeting transcripts and allows users to share the summaries via email.

## Features

- **Text Upload**: Upload .txt or .md files or paste text directly
- **Custom Prompts**: Provide specific instructions for AI summarization
- **AI Summarization**: Powered by Groq API (with fallback to simple summarization)
- **Editable Summaries**: Edit generated summaries before sharing
- **Email Sharing**: Share summaries with multiple recipients
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React.js with modern hooks
- **Backend**: Node.js with Express.js
- **AI Service**: Groq API (configurable)
- **File Handling**: Multer for file uploads
- **Email**: Nodemailer (simulated for demo)
- **Styling**: CSS with responsive design

## Project Structure

```
ai-meeting-summarizer/
├── backend/                 # Node.js/Express server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Component styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Groq API key (optional, for AI features)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ai-meeting-summarizer
   npm run install-all
   ```

2. **Configure environment variables:**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `.env` file and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_api_key_here
   ```

3. **Start the application:**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This will start both backend (port 5000) and frontend (port 3000) simultaneously.

### Alternative: Run separately

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm start
```

## API Endpoints

### POST `/api/summarize`
Generates AI summary from transcript text.

**Request:**
- `transcript`: Text content (file or direct text)
- `customPrompt`: Optional custom instructions

**Response:**
```json
{
  "success": true,
  "summary": "Generated summary text",
  "originalText": "Original transcript text"
}
```

### POST `/api/share`
Shares summary via email.

**Request:**
- `summary`: The summary text to share
- `recipients`: Array of email addresses
- `subject`: Email subject line

**Response:**
```json
{
  "success": true,
  "message": "Summary shared successfully"
}
```

### GET `/api/health`
Health check endpoint.

## Usage

1. **Upload or paste transcript text**
2. **Add custom instructions** (optional)
3. **Click "Generate Summary"**
4. **Edit the summary** if needed
5. **Add recipients and share** via email

## Configuration

### AI Service
The application is configured to use Groq API by default. You can modify the `generateSummary` function in `backend/server.js` to use other AI services like:
- OpenAI GPT
- Anthropic Claude
- Local AI models

### Email Service
Currently simulates email sending. For production, integrate with:
- SendGrid
- AWS SES
- Nodemailer with SMTP

## Development

### Adding new features
- **Backend**: Add routes in `server.js` or create separate route files
- **Frontend**: Add components in `src/` directory
- **Styling**: Modify CSS files or add new style modules

### Testing
```bash
# Backend tests (if implemented)
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Production Deployment

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Set production environment variables**
3. **Use PM2 or similar for Node.js process management**
4. **Configure reverse proxy (nginx/Apache)**
5. **Set up SSL certificates**

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` files
2. **CORS errors**: Check backend CORS configuration
3. **File upload issues**: Verify file type and size limits
4. **AI service errors**: Check API key and service status

### Logs
- Backend logs appear in the terminal
- Frontend errors show in browser console
- Check network tab for API request/response details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Create an issue in the repository 