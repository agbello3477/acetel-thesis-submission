const fs = require('fs');
const path = require('path');

const targetFile = '/Users/abdulgaffarbello/ACETEL Thesis Submission system (ATSS)/frontend/src/pages/Admin/AdminDashboard.tsx';
const content = fs.readFileSync(targetFile, 'utf-8');

const topSplit = content.split('return (');
const bottomSplit = topSplit[1].split('function ReviewComponent');

const headerLogic = topSplit[0] + 'return (\n';
const footerLogic = '\n    );\n}\n\nfunction ReviewComponent' + bottomSplit[1];

const usersTabRegex = /{activeTab === 'users' \? \([\s\S]*?Master User Directory[\s\S]*?<\/div>\n                    <\/div>\n                \) : \(\n                    <>\n/;
const usersMatch = content.match(usersTabRegex);
let usersBlock = '';
if (usersMatch) {
    usersBlock = usersMatch[0].replace(/{activeTab === 'users' \? \(/, '').replace(/\) : \(\n                    <>\n/, '').trim();
}

const statsRegex = /{stats && \([\s\S]*?Status Breakdown Bar Chart[\s\S]*?<\/div>\n                        <\/div>\n                    <\/div>\n                \)}/;
const statsMatch = content.match(statsRegex);
let statsBlock = '';
if (statsMatch) {
    statsBlock = statsMatch[0];
}

const tableRegex = /{\/\* Submissions List \*\/}[\s\S]*?<\/ul>\n                <\/div>/;
const tableMatch = content.match(tableRegex);
let tableBlock = '';
if (tableMatch) {
    tableBlock = tableMatch[0];
}

const activityRegex = /<div id="activity-logs"[\s\S]*?New interactive clicks will appear here instantly.[\s\S]*?<\/div>\n                    \)}\n                <\/div>/;
const activityMatch = content.match(activityRegex);
let activityBlock = '';
if (activityMatch) {
    activityBlock = activityMatch[0];
}

const newLayout = `
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Elegant Sidebar Navigation */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-40 flex-shrink-0">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="p-1.5 rounded-xl shadow-lg bg-white w-fit mb-6">
                        <LogoSlider className="h-8 w-24" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white mb-1">ATSS Portal</h2>
                    {user && (
                        <p className="text-xs font-medium text-slate-400">
                            Welcome, <span className="text-indigo-400">{user.full_name}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 p-4 flex-1">
                    <button onClick={() => setActiveTab('overview' as any)} className={\`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all \${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}\`}>
                        <FileText className="h-5 w-5" /> Analytics Overview
                    </button>
                    <button onClick={() => setActiveTab('submissions' as any)} className={\`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all \${activeTab === 'submissions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}\`}>
                        <CheckCircle className="h-5 w-5" /> Review Queue
                    </button>
                    <button onClick={() => setActiveTab('activity' as any)} className={\`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all \${activeTab === 'activity' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}\`}>
                        <Clock className="h-5 w-5" /> Global Activity
                    </button>
                    
                    {isSuperAdmin && (
                        <div className="mt-6">
                            <div className="px-4 text-[10px] uppercase font-extrabold text-slate-500 mb-2 tracking-widest">Master Auth</div>
                            <button onClick={() => setActiveTab('users')} className={\`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-1 w-full \${activeTab === 'users' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-900/30 border border-transparent hover:border-rose-800/50'}\`}>
                                <Shield className="h-5 w-5" /> User Directory
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400">
                        <LogOut className="h-5 w-5 mr-3" /> Secure Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
                {/* Dynamic Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center z-30 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {activeTab === 'overview' && 'System Analytics'}
                            {activeTab === 'submissions' && 'Submission Queue'}
                            {activeTab === 'activity' && 'Global Activity Stream'}
                            {activeTab === 'users' && 'Master User Directory'}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {activeTab === 'overview' && 'Real-time performance metrics and charts'}
                            {activeTab === 'submissions' && 'Review, manage, and process student theses'}
                            {activeTab === 'activity' && 'Live tracking of system-wide interactions'}
                            {activeTab === 'users' && 'Danger Zone: Absolute authority to manage system access'}
                        </p>
                    </div>
                    
                    <div className="flex gap-3 items-center">
                        <Button onClick={handleSendNotifications} disabled={sendingEmails} className="rounded-full shadow-md shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 font-bold transition-all hover:scale-105 active:scale-95">
                            {sendingEmails ? 'Working...' : 'Notify Reviewers'}
                        </Button>
                        <Button onClick={downloadCSV} variant="outline" className="rounded-full shadow-sm bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </header>

                {/* Scrollable Context Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-fade-in-up pb-12 space-y-8">
                        
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <>
                                ${statsBlock}
                            </>
                        )}

                        {/* 2. SUBMISSIONS TAB */}
                        {activeTab === 'submissions' && (
                            <div className="animate-fade-in-up">
                                ${tableBlock}
                            </div>
                        )}

                        {/* 3. ACTIVITY TAB */}
                        {activeTab === 'activity' && (
                            <div className="animate-fade-in-up">
                                ${activityBlock}
                            </div>
                        )}

                        {/* 4. USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="animate-fade-in-up">
                                ${usersBlock}
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
`;

// Also fix activeTab initialization!
const updatedHeader = headerLogic.replace(
    /const \[activeTab, setActiveTab\] = useState<'overview' \| 'users'>\('overview'\);/,
    "const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'activity' | 'users'>('overview');"
);

fs.writeFileSync(targetFile, updatedHeader + newLayout + footerLogic);
console.log("Successfully overhauled the AdminDashboard.tsx layout array structures.");
