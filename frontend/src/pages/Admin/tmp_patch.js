const fs = require('fs');
const file = '/Users/abdulgaffarbello/ACETEL Thesis Submission system (ATSS)/frontend/src/pages/Admin/AdminDashboard.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace ternary start with logical AND
data = data.replace(/{activeTab === 'users' \? \(/g, "{activeTab === 'users' && (");

// Replace ternary middle separator with end of users AND start of overview
data = data.replace(/\n                \) : \(\n                    <>\n/g, "\n                )}\n                {activeTab === 'overview' && (\n                    <>\n");

// Replace bottom closure
data = data.replace(/\n                    <\/>\n                \)}\n\n            <\/main>/g, "\n                    </>\n                )}\n\n            </main>");

fs.writeFileSync(file, data);
