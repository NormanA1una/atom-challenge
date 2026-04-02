'use strict';

const fs = require('fs');
const path = require('path');

// Monorepo root: this file lives in atom-todo-list-backend/scripts/
const root = path.join(__dirname, '..', '..');
const src = path.join(root, 'local-dev.firebase.json');
const json = JSON.parse(fs.readFileSync(src, 'utf8'));
const content = `API_SECRET_KEY=${json.API_SECRET_KEY}\nALLOWED_ORIGIN=${json.ALLOWED_ORIGIN}\n`;
const functionsDir = path.join(root, 'atom-todo-list-backend', 'functions');

fs.mkdirSync(functionsDir, { recursive: true });
fs.writeFileSync(path.join(functionsDir, '.env'), content);
fs.writeFileSync(path.join(functionsDir, '.secret.local'), content);
