import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoSlider } from '@/components/LogoSlider';
import { FileText, Plus, LogOut, CheckCircle2, XCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchSubmissions();
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/submissions/my-submissions');
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-1 rounded-xl shadow-sm bg-white border border-slate-100">
                            <LogoSlider className="h-8 w-20" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">ATSS Portal</h1>
                            {user && (
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                    <span className="text-indigo-600 font-semibold">{user.full_name}</span> • {user.matric_number?.toUpperCase()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {user?.program_type}
                        </span>
                        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Theses</h2>
                            <p className="text-slate-500 mt-1 font-medium">Track and manage your academic submissions</p>
                        </div>
                        <Link to="/student/submit">
                            <Button className="rounded-full shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                                <Plus className="h-4 w-4 mr-2" /> New Submission
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {submissions.map((sub: any) => (
                            <div key={sub.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group overflow-hidden">
                                <div className="px-6 py-6 sm:px-8">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-xl ${sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                                    sub.status === 'Rejected' ? 'bg-rose-100 text-rose-600' :
                                                        sub.status === 'Correction Required' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {sub.status === 'Approved' ? <CheckCircle2 className="h-5 w-5" /> :
                                                        sub.status === 'Rejected' ? <XCircle className="h-5 w-5" /> :
                                                            sub.status === 'Correction Required' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                </div>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider
                                                  ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                        sub.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                                            sub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {sub.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-2 text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{sub.supervisor_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Submitted: {sub.submission_year}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {sub.admin_comment && sub.status !== 'Submitted' && (
                                        <div className="mt-5 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-inner">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-indigo-400" /> Reviewer Notes
                                            </p>
                                            <p className="text-sm font-medium text-slate-700 italic">"{sub.admin_comment}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {submissions.length === 0 && (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
                                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No submissions yet</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1 font-medium">Your research journey starts here. Click "New Submission" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Routes>
                <Route path="submit" element={<NewSubmission fetchSubmissions={fetchSubmissions} />} />
            </Routes>
        </div>
    );
}

function NewSubmission({ fetchSubmissions }: { fetchSubmissions: () => void }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Determine number of supervisors based on program type
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isPhD = user?.program_type === 'PhD';
    const numSupervisors = isPhD ? 3 : 2;

    const [formData, setFormData] = useState({
        title: '', abstract: '', keywords: '', submission_year: new Date().getFullYear().toString()
    });
    const [supervisors, setSupervisors] = useState<string[]>(Array(numSupervisors).fill(''));
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error('Please attach a PDF file');
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));

        // Combine supervisors into a comma-separated string
        const combinedSupervisors = supervisors.filter(s => s.trim() !== '').join(', ');
        data.append('supervisor_name', combinedSupervisors);

        data.append('thesis', file);

        try {
            await api.post('/submissions', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Thesis submitted successfully');
            fetchSubmissions();
            navigate('/student');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to submit thesis');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 relative">
                <button 
                    onClick={() => navigate('/student')}
                    title="Close"
                    className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <XCircle className="h-6 w-6" />
                </button>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Submit Thesis</h2>
                    <p className="text-slate-500 font-medium mt-1">Fill in the details to submit your final phase</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Thesis Title</label>
                        <Input 
                            placeholder="Enter the full title of your thesis" 
                            required 
                            className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Abstract</label>
                        <textarea
                            placeholder="Provide a concise summary of your research..."
                            required
                            className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium min-h-[120px] outline-none"
                            rows={4}
                            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Keywords</label>
                            <Input 
                                placeholder="AI, Machine Learning, etc." 
                                required 
                                className="h-12 rounded-xl border-slate-200 font-medium"
                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Submission Year</label>
                            <Input 
                                placeholder="Year" 
                                type="number" 
                                required 
                                className="h-12 rounded-xl border-slate-200 font-medium"
                                value={formData.submission_year} 
                                onChange={(e) => setFormData({ ...formData, submission_year: e.target.value })} 
                            />
                        </div>
                    </div>

                    <div className="space-y-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-indigo-600" />
                            <label className="text-sm font-bold text-slate-800">
                                Assigned Supervisors ({numSupervisors})
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {supervisors.map((sup, index) => (
                                <Input
                                    key={index}
                                    placeholder={`Full Name of Supervisor ${index + 1}`}
                                    required
                                    value={sup}
                                    className="h-11 rounded-xl bg-white border-slate-200 font-medium"
                                    onChange={(e) => {
                                        const newSups = [...supervisors];
                                        newSups[index] = e.target.value;
                                        setSupervisors(newSups);
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2 ml-1">
                            Required for {user?.program_type || 'your program'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Thesis Document (PDF)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                id="thesis-upload"
                                accept=".pdf"
                                required
                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                className="hidden"
                            />
                            <label 
                                htmlFor="thesis-upload"
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all
                                ${file ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <FileText className="h-8 w-8 text-indigo-500 mb-2" />
                                            <p className="text-sm font-bold text-indigo-700">{file.name}</p>
                                            <p className="text-[10px] text-indigo-400">Click to change file</p>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-8 w-8 text-slate-400 mb-2" />
                                            <p className="text-sm font-bold text-slate-600">Select Thesis PDF</p>
                                            <p className="text-xs text-slate-400">Max file size: 100MB</p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 h-12 rounded-full font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                            onClick={() => navigate('/student')}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="flex-[2] h-12 rounded-full font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading ? 'Uploading...' : 'Complete Submission'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
