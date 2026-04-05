import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminRegister from './pages/Auth/AdminRegister';
import StudentDashboard from './pages/Student/StudentDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/student/*" element={<StudentDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
            <div className="w-full py-3 bg-white border-t border-slate-200 text-center relative z-50">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide uppercase">
                    Powered by: <span className="font-bold text-indigo-700">MaSha Secure tech.</span>
                </span>
            </div>
        </Router>
    );
}

export default App;
