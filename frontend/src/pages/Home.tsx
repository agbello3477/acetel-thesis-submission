import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, ShieldCheck, LogIn, UserPlus, GraduationCap, LockKeyhole, Shield } from 'lucide-react';
import { LogoSlider } from '@/components/LogoSlider';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function Home() {
    // Mode state lifted up here so the Navbar link can trigger it
    const [mode, setMode] = useState<'login' | 'register' | 'admin_register'>('login');

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="p-1.5 rounded-xl shadow-lg shadow-indigo-200/50 bg-white hover:scale-105 transition-transform duration-300">
                                <LogoSlider className="h-10 w-24" />
                            </div>
                            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                                ACETEL Thesis Submission System
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    setMode('admin_register');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:flex items-center gap-1.5"
                            >
                                <Shield size={16} />
                                Admin Portal
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 pt-24 pb-16 lg:pt-36 lg:pb-32 overflow-hidden relative flex items-center">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-35 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-full blur-[100px] transform -translate-y-1/3"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column (Hero Text) */}
                    <div className="flex-1 text-center lg:text-left pt-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 text-indigo-700 font-medium text-sm mb-6 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]"></span>
                            Secure & Intelligent Platform
                        </div>
                        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-100">
                            Streamline your academic <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">research journey.</span>
                        </h1>
                        <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-200">
                            A unified, secure, and intuitive platform for postgraduate students to submit theses and for administrators to manage the review lifecycle effortlessly, from submission to approval.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-300">
                             <FeatureCard
                                icon={<FileText className="h-5 w-5 text-indigo-600" />}
                                title="Automated Workflows"
                                desc="Submit and track your thesis instantly."
                                color="bg-indigo-100"
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="h-5 w-5 text-indigo-600" />}
                                title="Secure Storage"
                                desc="Enterprise-grade data infrastructure."
                                color="bg-indigo-100"
                            />
                        </div>
                    </div>

                    {/* Right Column (Auth Widget) */}
                    <div className="w-full max-w-md lg:w-[450px] shrink-0 animate-fade-in-up animation-delay-400">
                        <AuthWidget mode={mode} setMode={setMode} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-md py-8 mt-auto z-10">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 font-medium text-sm">
                    &copy; {new Date().getFullYear()} ACETEL Thesis Submission System. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100/50 flex items-start gap-4 hover:shadow-md hover:bg-white transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl shrink-0 ${color} flex items-center justify-center shadow-inner`}>
                {icon}
            </div>
            <div>
                 <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
                 <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
}

// ============== Auth Widget Component ==============

function AuthWidget({ mode, setMode }: { mode: 'login' | 'register' | 'admin_register', setMode: React.Dispatch<React.SetStateAction<'login' | 'register' | 'admin_register'>> }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Student Registration State
    const [studentReg, setStudentReg] = useState({
        full_name: '',
        matric_number: '',
        email: '',
        program_type: 'MSc',
        department: '',
        password: '',
    });

    // Admin Registration State
    const [adminReg, setAdminReg] = useState({
        full_name: '',
        email: '',
        department: '',
        password: '',
        role: 'admin',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Logged in successfully');

            if (response.data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', studentReg);
            toast.success('Registration successful! Please login.');
            setMode('login');
            setEmail(studentReg.email);
            setPassword('');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', adminReg);
            toast.success('Admin Registration successful! Please login.');
            setMode('login');
            setEmail(adminReg.email);
            setPassword('');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStudentReg({ ...studentReg, [e.target.name]: e.target.value });
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminReg({ ...adminReg, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-indigo-200/50 relative overflow-hidden transition-all duration-500">
            
            {/* Toggle Header (Only between Student flows normally) */}
            {mode !== 'admin_register' && (
                <div className="flex bg-slate-100/80 p-1 rounded-xl mb-8 relative">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out z-0 ${mode === 'login' ? 'left-1' : 'left-[calc(50%+3px)]'}`} 
                    />
                    <button 
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${mode === 'login' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${mode === 'register' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Register
                    </button>
                </div>
            )}

            {/* Admin Toggle Header (Visible only in Admin mode) */}
            {mode === 'admin_register' && (
                <div className="flex bg-slate-900 p-1 rounded-xl mb-8 relative">
                    <div className="absolute top-1 bottom-1 left-1 w-[calc(100%-8px)] bg-slate-800 rounded-lg shadow-sm z-0" />
                    <button className="flex-1 py-2.5 text-sm font-bold z-10 text-white flex items-center justify-center gap-2 cursor-default">
                        <Shield size={16} /> Admin Registration
                    </button>
                </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <LockKeyhole size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-sm text-slate-500 mt-1">Access your thesis workspace</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            type="email" 
                            placeholder="Email address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="h-12 bg-white/50 focus-visible:bg-white transition-colors"
                        />
                        <Input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="h-12 bg-white/50 focus-visible:bg-white transition-colors"
                        />
                        <Button type="submit" className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200/60 hover:shadow-indigo-300/60 transition-all hover:-translate-y-0.5" disabled={loading}>
                            {loading ? 'Authenticating...' : (
                                <span className="flex items-center gap-2">
                                    Sign In <LogIn size={18} />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            )}

            {/* Student Register Form */}
            {mode === 'register' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 text-center">
                         <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <GraduationCap size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Apply for Access</h2>
                        <p className="text-sm text-slate-500 mt-1">Create your student account</p>
                    </div>

                    <form onSubmit={handleStudentRegister} className="space-y-3">
                        <Input name="full_name" placeholder="Full Name" value={studentReg.full_name} required onChange={handleStudentChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        <div className="grid grid-cols-2 gap-3">
                            <Input name="matric_number" placeholder="Matric No." value={studentReg.matric_number} required onChange={handleStudentChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                            <select 
                                name="program_type" 
                                value={studentReg.program_type}
                                title="Program Type"
                                className="flex h-11 w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors" 
                                onChange={handleStudentChange}
                            >
                                <option value="MSc">MSc Program</option>
                                <option value="PhD">PhD Program</option>
                            </select>
                        </div>
                        <Input name="department" placeholder="Department" value={studentReg.department} required onChange={handleStudentChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        <Input name="email" type="email" placeholder="Email address" value={studentReg.email} required onChange={handleStudentChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        <Input name="password" type="password" placeholder="Create Password" value={studentReg.password} required onChange={handleStudentChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        
                        <Button type="submit" className="w-full h-12 mt-2 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-0.5" disabled={loading}>
                             {loading ? 'Creating Account...' : (
                                <span className="flex items-center gap-2">
                                    Register Account <UserPlus size={18} />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            )}

            {/* Admin Register Form */}
            {mode === 'admin_register' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 text-center">
                         <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Admin Application</h2>
                        <p className="text-sm text-slate-500 mt-1">Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleAdminRegister} className="space-y-4">
                        <Input name="full_name" placeholder="Full Name" value={adminReg.full_name} required onChange={handleAdminChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        <Input name="department" placeholder="Department (e.g. Administration)" value={adminReg.department} required onChange={handleAdminChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        <Input name="email" type="email" placeholder="Official Email address" value={adminReg.email} required onChange={handleAdminChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        <Input name="password" type="password" placeholder="Create Password" value={adminReg.password} required onChange={handleAdminChange} className="h-11 bg-white/50 focus-visible:bg-white" />
                        
                        <Button type="submit" className="w-full h-12 mt-2 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-0.5" disabled={loading}>
                             {loading ? 'Creating Account...' : (
                                <span className="flex items-center gap-2">
                                    Create Admin <UserPlus size={18} />
                                </span>
                            )}
                        </Button>

                        <div className="text-center pt-2">
                            <button type="button" onClick={() => setMode('login')} className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                                Return to User Login
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
