import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { LogOut, FileText, CheckCircle, Clock, XCircle, ChevronRight, Download } from 'lucide-react';
import { LogoSlider } from '@/components/LogoSlider';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [submissions, setSubmissions] = useState([]);
    const [filter, setFilter] = useState('All');
    const [user, setUser] = useState<any>(null);

    const [, setLatestSubId] = useState<string | null>(null);

    useEffect(() => {
        // Request desktop notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        fetchData(false);
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Live polling every 30 seconds for optimization vs UX
        const interval = setInterval(() => {
            fetchData(true);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (isPolling: boolean = false) => {
        try {
            const [statsRes, subsRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/submissions')
            ]);
            setStats(statsRes.data);
            
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/');
    };

    const downloadCSV = () => {
        if (submissions.length === 0) return;

        const headers = ["ID", "Title", "Student", "Matric Number", "Program", "Status", "Supervisor", "Submission Year"];
        const csvRows = [headers.join(',')];

        submissions.forEach((sub: any) => {
            const rawRow = [
                sub.id,
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

    const filteredSubmissions = filter === 'All' 
        ? submissions 
        : submissions.filter((sub: any) => sub.status === filter);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1 rounded-xl shadow-lg shadow-indigo-200 bg-white">
                            <LogoSlider className="h-8 w-20" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-slate-800">
                                Admin Overview
                            </h1>
                            {user && (
                                <p className="text-xs font-medium text-slate-500 mt-0.5 border-l-2 border-indigo-500 pl-2">
                                    Welcome, <span className="font-semibold text-slate-700">{user.full_name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={downloadCSV} variant="outline" size="sm" className="rounded-full shadow-sm hover:bg-indigo-50 transition-colors border-indigo-200 text-indigo-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-full shadow-sm hover:bg-slate-50 transition-colors border-slate-200 text-slate-700">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">

                {/* Analytics Section */}
                {stats && (
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
                )}

                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in-up">
                        {/* Status Breakdown Bar Chart */}
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
                                                    'Approved': '#10b981', // emerald
                                                    'Rejected': '#f43f5e', // rose
                                                    'Correction Required': '#f59e0b', // amber
                                                    'Submitted': '#6366f1', // indigo
                                                    'Under Review': '#3b82f6' // blue
                                                };
                                                return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#94a3b8'} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Trends Line Chart */}
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
                )}

                {/* Submissions List */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden mt-8 animate-fade-in-up">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Review Queue</h3>
                            <p className="text-sm text-slate-500 mt-1">Manage and assess recent thesis submissions</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
                            {['All', 'Submitted', 'Under Review', 'Approved', 'Correction Required', 'Rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                        filter === status 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
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
                                            <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{sub.title}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-slate-500 font-medium">
                                                <span className="text-slate-700">{sub.full_name}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">{sub.matric_number}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs font-bold">{sub.program_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 sm:ml-auto">
                                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm
                                          ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                sub.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    sub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                            {sub.status}
                                        </span>
                                        <ReviewComponent sub={sub} refresh={fetchData} />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
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
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-fade-in-up border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assess Submission</h2>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
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
