#!/usr/bin/env node

/**
 * CodeRabbit Suggestion Applier
 * 
 * This script automatically applies CodeRabbit's "suggested changes" comments
 * to the corresponding files in a robust, bottom-up manner to maintain
 * stable line offsets during patching.
 * 
 * Usage:
 *   export PR=123 BOT=coderabbitai[bot]
 *   node apply_coderabbit_suggestions.js
 * 
 * Environment Variables:
 *   - PR: Pull request number (required)
 *   - BOT: Bot username (default: coderabbitai[bot])
 * 
 * Output:
 *   Logs applied changes and outputs APPLIED_COUNT=<number> for parsing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) { 
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }); 
  } catch (error) {
    console.error(`❌ Command failed: ${cmd}`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

function main() {
  try {
    // Get repository and environment info
    const repo = JSON.parse(sh('gh repo view --json owner,name'));
    const owner = repo.owner.login;
    const name  = repo.name;
    const pr    = process.env.PR;
    const bot   = process.env.BOT || 'coderabbitai[bot]';

    if (!pr) {
      console.error('❌ PR environment variable not set');
      console.error('   Usage: export PR=123 && node apply_coderabbit_suggestions.js');
      process.exit(1);
    }

    console.log(`🔍 Fetching suggestions from ${bot} for PR #${pr}...`);
    console.log(`📍 Repository: ${owner}/${name}`);

    // Fetch all PR comments
    const comments = JSON.parse(sh(`gh api repos/${owner}/${name}/pulls/${pr}/comments --paginate`));
    
    console.log(`💬 Found ${comments.length} total comments`);

    // Extract suggestions from CodeRabbit comments
    const suggestions = comments
      .filter(c => c.user && c.user.login === bot)
      .map(c => {
        // Look for ```suggestion blocks in the comment body
        const match = c.body && c.body.match(/```suggestion\s*\n([\s\S]*?)```/m);
        if (!match) return null;
        
        // Extract line information (GitHub API provides various line fields)
        const start = c.start_line || c.original_start_line || c.line || c.original_line;
        const end   = c.line || c.original_line || start;
        
        if (!c.path || !start || !end) {
          console.warn(`⚠️  Skipping suggestion ${c.id}: missing path/line info`);
          console.warn(`    Path: ${c.path}, Start: ${start}, End: ${end}`);
          return null;
        }
        
        return {
          path: c.path,
          start: Number(start),
          end: Number(end),
          text: match[1].replace(/\r/g, ''), // Normalize line endings
          id: c.id,
          url: c.html_url
        };
      })
      .filter(Boolean);

    if (!suggestions.length) {
      console.log('ℹ️  No suggestions found');
      console.log('APPLIED_COUNT=0');
      process.exit(0);
    }

    console.log(`✅ Found ${suggestions.length} suggestions to apply:`);
    suggestions.forEach(s => {
      console.log(`   📄 ${s.path}:${s.start}-${s.end} (ID: ${s.id})`);
    });
    console.log('');

    // Group suggestions by file for efficient processing
    const byFile = {};
    for (const s of suggestions) {
      if (!byFile[s.path]) byFile[s.path] = [];
      byFile[s.path].push(s);
    }

    console.log(`📁 Processing ${Object.keys(byFile).length} files...`);

    let applied = 0;
    let skipped = 0;

    // Process each file
    for (const [filePath, fileSuggestions] of Object.entries(byFile)) {
      console.log(`\n🔧 Processing ${filePath} (${fileSuggestions.length} suggestions)...`);
      
      if (!fs.existsSync(filePath)) { 
        console.warn(`⚠️  Skip missing file: ${filePath}`); 
        skipped += fileSuggestions.length;
        continue; 
      }
      
      // Read file content
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const lines = originalContent.split('\n');
      
      console.log(`   📏 File has ${lines.length} lines`);
      
      // Sort suggestions by line number DESC (bottom to top)
      // This maintains stable line offsets as we apply changes
      fileSuggestions.sort((a, b) => (b.start - a.start) || (b.end - a.end));
      
      console.log('   🔄 Applying suggestions from bottom to top...');
      
      for (const s of fileSuggestions) {
        try {
          // Convert to 0-based indexing
          const startIdx = Math.max(1, s.start) - 1;
          const endIdx = Math.max(1, s.end) - 1;
          
          // Validate line ranges
          if (startIdx >= lines.length || endIdx >= lines.length) {
            console.warn(`   ⚠️  Skip suggestion ${s.id}: line range ${s.start}-${s.end} exceeds file length (${lines.length})`);
            skipped++;
            continue;
          }
          
          // Prepare replacement content
          const newLines = s.text.replace(/\n$/, '').split('\n');
          
          // Apply the replacement
          const oldLength = endIdx - startIdx + 1;
          lines.splice(startIdx, oldLength, ...newLines);
          
          console.log(`   ✅ Applied suggestion ${s.id} at lines ${s.start}-${s.end} (${oldLength} → ${newLines.length} lines)`);
          applied++;
          
        } catch (error) {
          console.warn(`   ❌ Failed to apply suggestion ${s.id} at ${s.start}-${s.end}: ${error.message}`);
          skipped++;
        }
      }
      
      // Write back the modified file
      const newContent = lines.join('\n');
      if (newContent !== originalContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`   💾 Updated ${filePath}`);
      } else {
        console.log(`   📝 No changes made to ${filePath}`);
      }
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`   ✅ Successfully applied: ${applied} suggestions`);
    console.log(`   ⚠️  Skipped: ${skipped} suggestions`);
    console.log(`   📊 Success rate: ${suggestions.length > 0 ? Math.round((applied / suggestions.length) * 100) : 0}%`);
    
    // Output for script parsing
    console.log(`APPLIED_COUNT=${applied}`);
    
  } catch (error) {
    console.error(`💥 Script error: ${error.message}`);
    console.error(`📋 Stack trace:`);
    console.error(error.stack);
    console.log('APPLIED_COUNT=0');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
