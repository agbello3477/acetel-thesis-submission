import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { LogoSlider } from '@/components/LogoSlider';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        matric_number: '',
        email: '',
        program_type: 'MSc',
        department: '',
        password: '',
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
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
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
                    <h2 className="text-3xl font-extrabold text-gray-900">Student Registration</h2>
                    <p className="mt-2 text-sm text-gray-600">Create your ATSS account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <Input name="full_name" placeholder="Full Name" required onChange={handleChange} />
                        <Input name="matric_number" placeholder="Matric Number" required onChange={handleChange} />
                        <Input name="email" type="email" placeholder="Email address" required onChange={handleChange} />

                        <select name="program_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={handleChange}>
                            <option value="MSc">MSc</option>
                            <option value="PhD">PhD</option>
                        </select>

                        <Input name="department" placeholder="Department (e.g., Computer Science)" required onChange={handleChange} />
                        <Input name="password" type="password" placeholder="Password" required onChange={handleChange} />
                    </div>
                    <div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
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
