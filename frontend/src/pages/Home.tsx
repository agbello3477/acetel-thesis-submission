import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, ShieldCheck, BarChart3, LogIn, UserPlus, GraduationCap, LockKeyhole } from 'lucide-react';
import { LogoSlider } from '@/components/LogoSlider';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-xl shadow-lg shadow-indigo-200 bg-white">
                                <LogoSlider className="h-10 w-24" />
                            </div>
                            <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-slate-800">
                                ACETEL ATSS
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/admin/register" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">
                                Admin Portal
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 pt-24 pb-16 lg:pt-36 lg:pb-32 overflow-hidden relative">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-30 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full blur-3xl transform -translate-y-1/3"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column (Hero Text) */}
                    <div className="flex-1 text-center lg:text-left pt-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-6 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
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
                                icon={<FileText className="h-5 w-5 text-blue-600" />}
                                title="Automated Workflows"
                                desc="Submit and track your thesis instantly."
                                color="bg-blue-50"
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
                                title="Secure Storage"
                                desc="Enterprise-grade data infrastructure."
                                color="bg-emerald-50"
                            />
                        </div>
                    </div>

                    {/* Right Column (Auth Widget) */}
                    <div className="w-full max-w-md lg:w-[450px] shrink-0 animate-fade-in-up animation-delay-400">
                        <AuthWidget />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 font-medium text-sm">
                    &copy; {new Date().getFullYear()} ACETEL Thesis Submission System. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl shrink-0 ${color} flex items-center justify-center`}>
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

function AuthWidget() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [regData, setRegData] = useState({
        full_name: '',
        matric_number: '',
        email: '',
        program_type: 'MSc',
        department: '',
        password: '',
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', regData);
            toast.success('Registration successful! Please login.');
            setMode('login'); // Switch to login view instantly
            setEmail(regData.email); // prefill email
            setPassword(''); // require typing password again
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
            {/* Toggle Header */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative">
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

            {/* Login Form */}
            {mode === 'login' && (
                <div className="animate-fade-in">
                    <div className="mb-6 text-center">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LockKeyhole size={24} />
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
                            className="h-12 bg-slate-50/50"
                        />
                        <Input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="h-12 bg-slate-50/50"
                        />
                        <Button type="submit" className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={loading}>
                            {loading ? 'Authenticating...' : (
                                <span className="flex items-center gap-2">
                                    Sign In <LogIn size={18} />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            )}

            {/* Register Form */}
            {mode === 'register' && (
                <div className="animate-fade-in">
                    <div className="mb-6 text-center">
                         <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <GraduationCap size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Apply for Access</h2>
                        <p className="text-sm text-slate-500 mt-1">Create your student account</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input name="full_name" placeholder="Full Name" value={regData.full_name} required onChange={handleRegChange} className="h-11 bg-slate-50/50" />
                        <div className="grid grid-cols-2 gap-3">
                            <Input name="matric_number" placeholder="Matric No." value={regData.matric_number} required onChange={handleRegChange} className="h-11 bg-slate-50/50" />
                            <select 
                                name="program_type" 
                                value={regData.program_type}
                                className="flex h-11 w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
                                onChange={handleRegChange}
                            >
                                <option value="MSc">MSc Program</option>
                                <option value="PhD">PhD Program</option>
                            </select>
                        </div>
                        <Input name="department" placeholder="Department" value={regData.department} required onChange={handleRegChange} className="h-11 bg-slate-50/50" />
                        <Input name="email" type="email" placeholder="Email address" value={regData.email} required onChange={handleRegChange} className="h-11 bg-slate-50/50" />
                        <Input name="password" type="password" placeholder="Create Password" value={regData.password} required onChange={handleRegChange} className="h-11 bg-slate-50/50" />
                        
                        <Button type="submit" className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-lg" disabled={loading}>
                             {loading ? 'Creating Account...' : (
                                <span className="flex items-center gap-2">
                                    Register Account <UserPlus size={18} />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
