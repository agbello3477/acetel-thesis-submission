import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, BarChart3, ChevronRight } from 'lucide-react';
import { LogoSlider } from '@/components/LogoSlider';
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
                                ACETEL Thesis Submission System
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                                Sign in
                            </Link>
                            <Link to="/register">
                                <Button className="rounded-full px-6 shadow-md shadow-indigo-200/50 hover:shadow-indigo-300/50 transition-all duration-300 bg-indigo-600 hover:bg-indigo-700">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden relative">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full blur-3xl transform -translate-y-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                            Welcome to the ACETEL Thesis Submission System
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 animate-fade-in-up animation-delay-100">
                            Streamline your academic <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">research journey.</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-600 font-medium mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                            A unified, secure, and intuitive platform for postgraduate students to submit theses and for administrators to manage the review lifecycle effortlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
                            <Link to="/login">
                                <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-indigo-200/40 hover:shadow-indigo-300/60 transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 w-full sm:w-auto">
                                    Access Portal
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-2 hover:bg-slate-50 transition-all duration-300 w-full sm:w-auto">
                                    Apply for Access
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Feature Cards Showcase */}
                    <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up animation-delay-400">
                        <FeatureCard
                            icon={<FileText className="h-6 w-6 text-blue-600" />}
                            title="Automated Workflows"
                            desc="Submit your thesis and track its status through every stage of the review process."
                            color="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6 text-emerald-600" />}
                            title="Secure Storage"
                            desc="Enterprise-grade MinIO infrastructure ensuring your research data is safe and isolated."
                            color="bg-emerald-50"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
                            title="Real-time Analytics"
                            desc="Comprehensive dashboards for administrators to monitor program metrics instantly."
                            color="bg-purple-50"
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 font-medium text-sm">
                    &copy; {new Date().getFullYear()} ACETEL Thesis Submission System. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group hover:-translate-y-1 cursor-default">
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}
