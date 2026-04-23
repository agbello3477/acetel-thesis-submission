import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { LogOut, FileText, CheckCircle, Clock, XCircle, ChevronRight, Download, Search, User, Calendar, DownloadCloud, Shield } from 'lucide-react';
import { LogoSlider } from '@/components/LogoSlider';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [submissions, setSubmissions] = useState([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [systemUsers, setSystemUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'activity' | 'users'>('overview');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    const [programFilter, setProgramFilter] = useState('All');
    const [user, setUser] = useState<any>(null);

    const [, setLatestSubId] = useState<string | null>(null);

    useEffect(() => {
        // Request desktop notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userData) {
            let parsedUser = JSON.parse(userData);
            // Self-healing: If email was missing from old login response, recover it from JWT
            if (!parsedUser.email && token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decoded = JSON.parse(window.atob(base64));
                    if (decoded.email) {
                        parsedUser.email = decoded.email;
                        localStorage.setItem('user', JSON.stringify(parsedUser));
                    }
                } catch (e) {
                    console.error('Session recovery failed', e);
                }
            }
            setUser(parsedUser);
        }
        
        fetchData(false);

        // Live polling every 30 seconds for optimization vs UX
        const interval = setInterval(() => {
            fetchData(true);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (isPolling: boolean = false) => {
        try {
            const [statsRes, subsRes, logsRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/submissions'),
                api.get('/analytics/activity')
            ]);
            setStats(statsRes.data);
            setActivityLogs(logsRes.data || []);
            
            const newSubs = subsRes.data;
            if (newSubs.length > 0) {
                const newestId = newSubs[0].id;
                
                // If this is a poll, and we have a new ID that we haven't seen before
                setLatestSubId(prev => {
                    if (isPolling && prev && newestId !== prev) {
                        toast.success('New thesis submission just arrived!', { icon: '🔔' });
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('New ATSS Submission', {
                                body: `${newSubs[0].full_name} submitted "${newSubs[0].title}"`,
                                icon: '/vite.svg'
                            });
                        }
                    }
                    return newestId;
                });
            }
            setSubmissions(newSubs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        api.post('/analytics/activity', { action_type: 'LOGOUT', target: 'User explicitly logged out of the admin panel' }).finally(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success('Logged out successfully');
            navigate('/');
        });
    };

    const downloadCSV = () => {
        if (submissions.length === 0) return;

        const headers = ["S/N", "Title", "Student", "Matric Number", "Program", "Status", "Supervisor", "Submission Year"];
        const csvRows = [headers.join(',')];

        submissions.forEach((sub: any, index: number) => {
            const rawRow = [
                index + 1,
                `"${sub.title.replace(/"/g, '""')}"`,
                `"${sub.full_name}"`,
                sub.matric_number,
                sub.program_type,
                sub.status,
                `"${sub.supervisor_name || ''}"`,
                sub.submission_year
            ];
            csvRows.push(rawRow.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ATSS_Submissions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported as CSV');
    };

    const isSuperAdmin = user?.email?.toLowerCase() === 'agbello@noun.edu.ng';

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setSystemUsers(res.data);
        } catch (err) {
            toast.error('Failed to load system users');
        }
    };

    useEffect(() => {
        if (activeTab === 'users' && isSuperAdmin) {
            fetchUsers();
        }
    }, [activeTab, isSuperAdmin]);

    const handleBlockUser = async (id: string, currentlyBlocked: boolean) => {
        try {
            await api.put(`/auth/users/${id}/block`, { is_blocked: !currentlyBlocked });
            toast.success(`User successfully ${!currentlyBlocked ? 'suspended' : 'unsuspended'}`);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("CRITICAL WARNING: Are you sure you want to completely erase this user from the system? This action cannot be reversed!")) return;
        try {
            await api.delete(`/auth/users/${id}`);
            toast.success('User permanently deleted');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const uniqueYears = Array.from(new Set(submissions.map((s: any) => s.submission_year))).sort().reverse();
    const uniquePrograms = Array.from(new Set(submissions.map((s: any) => s.program_type)));

    let filteredSubmissions = submissions;
    if (filter !== 'All') filteredSubmissions = filteredSubmissions.filter((sub: any) => sub.status === filter);
    if (yearFilter !== 'All') filteredSubmissions = filteredSubmissions.filter((sub: any) => sub.submission_year?.toString() === yearFilter);
    if (programFilter !== 'All') filteredSubmissions = filteredSubmissions.filter((sub: any) => sub.program_type === programFilter);
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filteredSubmissions = filteredSubmissions.filter((sub: any) => 
            sub.title.toLowerCase().includes(q) || 
            sub.full_name.toLowerCase().includes(q) ||
            sub.matric_number?.toLowerCase().includes(q)
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Elegant Sidebar Navigation */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-40 flex-shrink-0">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="p-1.5 rounded-xl shadow-lg bg-white w-fit mb-6 animate-pulse-slow">
                        <LogoSlider className="h-8 w-24" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white mb-1">ATSS Admin</h2>
                    {user && (
                        <p className="text-xs font-medium text-slate-400">
                            Welcome, <span className="text-indigo-400">{user.full_name}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 p-4 flex-1">
                    <button onClick={() => setActiveTab('overview' as any)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <FileText className="h-5 w-5" /> Analytics Overview
                    </button>
                    <button onClick={() => setActiveTab('submissions' as any)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'submissions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <CheckCircle className="h-5 w-5" /> Review Queue
                    </button>
                    <button onClick={() => setActiveTab('activity' as any)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Clock className="h-5 w-5" /> Global Activity
                    </button>
                    
                    {isSuperAdmin && (
                        <div className="mt-6">
                            <div className="px-4 text-[10px] uppercase font-extrabold text-slate-500 mb-2 tracking-widest">Master Auth</div>
                            <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-1 w-full ${activeTab === 'users' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-900/30 border border-transparent hover:border-rose-800/50'}`}>
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
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center z-30 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {activeTab === 'overview' && 'System Analytics Overview'}
                            {activeTab === 'submissions' && 'Active Review Queue'}
                            {activeTab === 'activity' && 'Global Activity Stream'}
                            {activeTab === 'users' && 'Master User Directory'}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {activeTab === 'overview' && 'Real-time performance metrics and submission trends'}
                            {activeTab === 'submissions' && 'Evaluate, manage, and verify pending student theses'}
                            {activeTab === 'activity' && 'Live tracking of system-wide component interactions'}
                            {activeTab === 'users' && 'Danger Zone: Absolute authority to suspend or erase system records'}
                        </p>
                    </div>
                    
                    <div className="flex gap-3 items-center">
                        <Button onClick={downloadCSV} variant="outline" className="rounded-full shadow-sm bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold hover:shadow-md transition-shadow">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </header>

                {/* Scrollable Body Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto pb-12 space-y-8">
                        
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && stats && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden group">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</h3>
                                            </div>
                                            <p className="text-5xl font-extrabold text-slate-900">{stats.totalSubmissions}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden group">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-600">
                                                    <CheckCircle className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Approval Rate</h3>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-5xl font-extrabold text-emerald-600">{stats.approvalRate}</p>
                                                <span className="text-2xl font-bold text-emerald-600/70">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 h-56 flex flex-col">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Program Breakdown</h3>
                                        <div className="flex-1 min-h-0 relative -ml-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={stats.submissionRatio}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%" cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={5}
                                                    >
                                                        {stats.submissionRatio.map((_entry: any, index: number) => (
                                                            <Cell key={'cell-' + index} fill={index === 0 ? '#6366f1' : '#14b8a6'} className="outline-none" />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        itemStyle={{ color: '#334155', fontWeight: 600 }}
                                                    />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80 flex flex-col">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Submission Status Overview</h3>
                                        <div className="flex-1 min-h-0 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                                                        {stats.statusBreakdown?.map((entry: any, index: number) => {
                                                            const colors: Record<string, string> = {
                                                                'Approved': '#10b981',
                                                                'Rejected': '#f43f5e',
                                                                'Correction Required': '#f59e0b',
                                                                'Submitted': '#6366f1',
                                                                'Under Review': '#3b82f6'
                                                            };
                                                            return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#94a3b8'} />;
                                                        })}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80 flex flex-col">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Submission Trends (Monthly)</h3>
                                        <div className="flex-1 min-h-0 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 2. SUBMISSIONS TAB */}
                        {activeTab === 'submissions' && (
                            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Review Queue</h3>
                                        <p className="text-sm text-slate-500 mt-1">Manage and assess recent thesis submissions</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search topic, student..."
                                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64 font-medium"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            title="Filter by year"
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-medium text-slate-600"
                                            value={yearFilter}
                                            onChange={(e) => setYearFilter(e.target.value)}
                                        >
                                            <option value="All">All Years</option>
                                            {uniqueYears.map((year: any) => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                        <select
                                            title="Filter by program"
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-medium text-slate-600"
                                            value={programFilter}
                                            onChange={(e) => setProgramFilter(e.target.value)}
                                        >
                                            <option value="All">All Programs</option>
                                            {uniquePrograms.map((prog: any) => <option key={prog} value={prog}>{prog}</option>)}
                                        </select>
                                        <select
                                            title="Filter by status"
                                            className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm outline-none focus:border-indigo-500 font-bold text-indigo-700"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            {['All', 'Submitted', 'Under Review', 'Approved', 'Correction Required', 'Rejected'].map((status) => (
                                                <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <ul className="divide-y divide-slate-100">
                                    {filteredSubmissions.length === 0 ? (
                                        <li className="p-8 text-center text-slate-500 font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} submissions found.</li>
                                    ) : filteredSubmissions.map((sub: any) => (
                                        <li key={sub.id} className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors group">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                                        sub.status === 'Rejected' ? 'bg-rose-100 text-rose-600' :
                                                            sub.status === 'Correction Required' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {sub.status === 'Approved' ? <CheckCircle className="h-5 w-5" /> :
                                                            sub.status === 'Rejected' ? <XCircle className="h-5 w-5" /> :
                                                                <Clock className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-tight mb-2 max-w-2xl">{sub.title}</p>
                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 font-medium">
                                                            <span className="text-slate-700 font-semibold">{sub.full_name}</span>
                                                            <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{sub.matric_number}</span>
                                                            <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs font-bold">{sub.program_type}</span>
                                                            <span className="flex items-center gap-1.5 ml-2"><User className="h-3.5 w-3.5 text-slate-400" /> Sup: {sub.supervisor_name}</span>
                                                            <span className="flex items-center gap-1.5 ml-2"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {new Date(sub.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 sm:ml-auto">
                                                    <span className={`hidden md:inline-flex px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full border shadow-sm
                                                    ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            sub.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                sub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                    'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                        {sub.status}
                                                    </span>
                                                    <DownloadButton id={sub.id} studentName={sub.full_name} />
                                                    <ReviewComponent sub={sub} refresh={fetchData} />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 3. ACTIVITY TAB */}
                        {activeTab === 'activity' && (
                            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden animate-fade-in-up">
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-lg font-bold text-slate-800">Global Activity Stream</h3>
                                    <p className="text-sm text-slate-500 mt-1">Live tracking of active user interactions across the application</p>
                                </div>
                                
                                {activityLogs && activityLogs.length > 0 ? (
                                    <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                        {activityLogs.map((log: any) => (
                                            <li key={log.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex items-start gap-4">
                                                <div className="mt-1 p-2 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-800 font-medium">
                                                        <span className="font-bold text-indigo-700">{log.user_name || 'Guest'}</span> {log.action_type === 'LOGIN' ? 'logged into the system' : log.action_type === 'LOGOUT' ? 'logged out' : 'clicked'} {' '}
                                                        <span className="font-bold bg-slate-100 px-2 rounded">{log.target}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                                    {log.role || 'Guest'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-12 text-center text-slate-500 font-medium">
                                        No user activity logged yet.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. USERS TAB */}
                        {activeTab === 'users' && isSuperAdmin && (
                            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden animate-fade-in-up">
                                <div className="px-6 py-8 border-b border-slate-100 bg-slate-900 text-white">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <Shield className="h-7 w-7 text-indigo-400" />
                                        Master User Directory
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-2">Danger Zone: You have absolute authority to permanently suspend or wipe accounts.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-slate-600">User Identity</th>
                                                <th className="px-6 py-4 font-bold text-slate-600 hidden md:table-cell">Contact</th>
                                                <th className="px-6 py-4 font-bold text-slate-600 hidden lg:table-cell">Reg. Date</th>
                                                <th className="px-6 py-4 font-bold text-slate-600">Rights</th>
                                                <th className="px-6 py-4 font-bold text-slate-600 text-right">Enforcement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {systemUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{u.full_name}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{u.role === 'admin' ? `Staff ID: ${u.phone_number}` : `Matric: ${u.matric_number}`}</div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell font-medium text-slate-600">
                                                        {u.email}
                                                    </td>
                                                    <td className="px-6 py-4 hidden lg:table-cell text-slate-500 text-xs font-medium">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2 flex-col items-start">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {u.role}
                                                            </span>
                                                            {u.is_blocked && (
                                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">Suspended</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                                                        {u.email?.toLowerCase() !== 'agbello@noun.edu.ng' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleBlockUser(u.id, u.is_blocked)} 
                                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${u.is_blocked ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
                                                                >
                                                                    {u.is_blocked ? 'Unsuspend' : 'Block Access'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteUser(u.id)} 
                                                                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-rose-500 hover:shadow-md hover:shadow-rose-200 transition-all ml-2"
                                                                    title="Delete Permanently"
                                                                >
                                                                    <XCircle className="h-5 w-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {u.email?.toLowerCase() === 'agbello@noun.edu.ng' && (
                                                            <span className="text-xs font-bold text-slate-400 italic">Protected</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

function ReviewComponent({ sub, refresh }: { sub: any, refresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState('');
    const [status, setStatus] = useState(sub.status);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await api.put(`/submissions/${sub.id}/status`, { status, comments });
            toast.success(`Submission status updated to: ${status}`);
            setIsOpen(false);
            refresh();
        } catch (err) {
            console.error('Failed to update status', err);
            toast.error('Failed to update submission status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
                Review <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
                    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-fade-in-up border border-slate-100 custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assess Submission</h2>
                            <button onClick={() => setIsOpen(false)} title="Close Assessment Modal" className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 space-y-2 font-medium">
                            <p className="flex justify-between"><span className="text-slate-500">Title:</span> <span className="font-bold text-slate-900 text-right ml-4 line-clamp-1 truncate">{sub.title}</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">Student:</span> <span className="font-semibold text-slate-900">{sub.full_name}</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">Status:</span>
                                <span className={`font-bold ${sub.status === 'Approved' ? 'text-emerald-600' :
                                    sub.status === 'Rejected' ? 'text-rose-600' :
                                        sub.status === 'Correction Required' ? 'text-amber-600' : 'text-blue-600'
                                    }`}>{sub.status}</span>
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Update Status</label>
                                <select
                                    title="Choose status"
                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-shadow outline-none border hover:border-slate-300"
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <option value="Submitted">Submitted (Pending)</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Approved" className="text-emerald-600 font-semibold">Approved</option>
                                    <option value="Correction Required" className="text-amber-600 font-semibold">Correction Required</option>
                                    <option value="Rejected" className="text-rose-600 font-semibold">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Review Notes / Feedback</label>
                                <textarea
                                    className="w-full rounded-xl border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-shadow outline-none border hover:border-slate-300 resize-none font-medium"
                                    rows={4}
                                    placeholder="Provide constructive feedback for the student..."
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full px-6 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100">Cancel</Button>
                            <Button onClick={handleUpdate} disabled={loading} className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-200">
                                {loading ? 'Saving...' : 'Confirm Update'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function DownloadButton({ id, studentName }: { id: string, studentName: string }) {
    const [loading, setLoading] = useState(false);
    const handleDownload = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/submissions/${id}/download`);
            if (res.data.downloadUrl) {
                window.open(res.data.downloadUrl, '_blank');
                api.post('/analytics/activity', { 
                    action_type: 'DOWNLOAD', 
                    target: `Thesis PDF: ${studentName}` 
                }).catch(() => {});
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to download');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Button onClick={handleDownload} disabled={loading} size="sm" className="rounded-full font-bold shadow-sm shadow-indigo-100 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50">
            <DownloadCloud className="h-4 w-4 mr-2" /> {loading ? '...' : 'Get PDF'}
        </Button>
    );
}
