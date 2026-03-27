import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { LogoSlider } from '@/components/LogoSlider';

export default function AdminRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        department: '',
        password: '',
        role: 'admin',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            toast.success('Admin Registration successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Admin Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <LogoSlider className="h-16 w-32" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Admin Registration</h2>
                    <p className="mt-2 text-sm text-gray-600">Create your ATSS Admin account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <Input name="full_name" placeholder="Full Name" required onChange={handleChange} />
                        <Input name="email" type="email" placeholder="Email address" required onChange={handleChange} />
                        <Input name="department" placeholder="Department (e.g., Administration)" required onChange={handleChange} />
                        <Input name="password" type="password" placeholder="Password" required onChange={handleChange} />
                    </div>
                    <div>
                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Admin'}
                        </Button>
                    </div>
                    <div className="text-center text-sm">
                        Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
