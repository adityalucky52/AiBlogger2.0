const fs = require('fs');

// Read the file
const content = fs.readFileSync('PROJECT_REPORT.md', 'utf8');

// Remove all emojis and special symbols
const cleanContent = content
  .replace(/[✅📊🎯🛠️💡📈🧪🚀💰📚🚧🏆🔮📋📝📞⏰📸💬🤖✍️⚡🛡️❌⏳🎓🌟]/g, '')
  .replace(/©/g, '(c)');

// Write to new file
fs.writeFileSync('PROJECT_REPORT_CLEAN.md', cleanContent, 'utf8');

console.log('✓ Clean report created: PROJECT_REPORT_CLEAN.md');
