const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-\[#050506\]/g, 'bg-nexus-bg');
  content = content.replace(/bg-\[#0A0A0C\]/g, 'bg-nexus-surface');
  
  // Borders
  content = content.replace(/border-white\/10/g, 'border-nexus-border');
  content = content.replace(/border-white\/5/g, 'border-nexus-border');
  content = content.replace(/border-white\/\[0\.03\]/g, 'border-nexus-border');
  
  // Text
  content = content.replace(/text-white\/40/g, 'text-nexus-ink-muted');
  content = content.replace(/text-white\/20/g, 'text-nexus-ink-muted opacity-50');
  content = content.replace(/text-white/g, 'text-nexus-ink');
  
  // Other backgrounds
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-nexus-border');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-nexus-border opacity-50');
  content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-nexus-border');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk('src');
