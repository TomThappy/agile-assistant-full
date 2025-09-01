const express = require('express');
const { marked } = require('marked');
const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (__) {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Agile Assistant CodeRabbit Workflows',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Production-grade Warp workflows',
      'CodeRabbit automation',
      'Bottom-up suggestion patching',
      'Safety gates and guards',
      'DRY_RUN mode',
      'Emergency rollback'
    ]
  });
});

app.get('/api/workflows', (req, res) => {
  try {
    const workflowsPath = path.join(__dirname, '.warp', 'workflows.yaml');
    if (fs.existsSync(workflowsPath)) {
      const workflows = fs.readFileSync(workflowsPath, 'utf8');
      res.json({
        success: true,
        content: workflows,
        file: 'workflows.yaml'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Workflows file not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/documentation', (req, res) => {
  try {
    const docsPath = path.join(__dirname, '.warp', 'README.md');
    if (fs.existsSync(docsPath)) {
      const markdown = fs.readFileSync(docsPath, 'utf8');
      const html = marked(markdown);
      res.json({
        success: true,
        markdown,
        html,
        file: 'README.md'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Documentation not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/script', (req, res) => {
  try {
    const scriptPath = path.join(__dirname, 'scripts', 'apply_coderabbit_suggestions.js');
    if (fs.existsSync(scriptPath)) {
      const script = fs.readFileSync(scriptPath, 'utf8');
      res.json({
        success: true,
        content: script,
        file: 'apply_coderabbit_suggestions.js'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Script not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main documentation route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Agile Assistant CodeRabbit Workflows running on port ${PORT}`);
    console.log(`📖 Documentation: http://localhost:${PORT}`);
    console.log(`🔌 API Status: http://localhost:${PORT}/api/status`);
  });
}

module.exports = app;
