const fs = require('fs');
let html = fs.readFileSync('ThinkingWithClaude/setup-claude-modul 1.html', 'utf8');

const fixCSS = `
/* --- PORTAL CLEANUP --- */
.topbar, .mod-chips, .bottom-nav, .float-progress, .sidebar-footer { display: none !important; }
@media (min-width: 1280px) {
  body { display: block !important; }
  .page-content { grid-column: auto !important; min-width: auto !important; }
}
`;

html = html.replace('</style>', fixCSS + '</style>');
fs.writeFileSync('ThinkingWithClaude/setup-claude-modul 1.html', html);
console.log('Fixed setup-claude-modul 1.html');
