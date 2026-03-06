/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Map as MapIcon, 
  List, 
  User as UserIcon,
  ChevronRight,
  LogOut,
  Plus,
  Filter,
  ArrowLeft,
  Loader2,
  Building2,
  Phone
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { cn, User, Report, Department, Analytics } from './types';
import { format } from 'date-fns';

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  loading = false,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', loading?: boolean }) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-900',
    outline: 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50',
    ghost: 'text-zinc-600 hover:bg-zinc-100',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

const Card = ({ children, className }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <div className={cn('bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

const Badge = ({ status }: { status: Report['status'] }) => {
  const colors = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', colors[status])}>
      {status}
    </span>
  );
};

// --- Citizen App ---

const CitizenApp = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [view, setView] = useState<'home' | 'report' | 'history'>('home');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('Detecting location...');

  useEffect(() => {
    fetchReports();
    // Fetch current location for header
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // Simulate reverse geocoding
        setTimeout(() => {
          setCurrentLocation('Sector 44, Gurgaon');
        }, 1500);
      }, () => {
        setCurrentLocation('Location access denied');
      });
    }
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/reports?user_id=${user.id}`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id })
      });
      if (res.ok) {
        await fetchReports();
        setView('home');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col max-w-md mx-auto border-x border-zinc-200 shadow-xl">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-zinc-900">CivicConnect</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100 max-w-[140px]">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-bold truncate uppercase tracking-tight">{currentLocation}</span>
          </div>
          <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200">
                <p className="text-emerald-100 text-sm mb-1">Welcome back,</p>
                <h2 className="text-2xl font-bold mb-4">{user.phone_number}</h2>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                    <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Reports</p>
                    <p className="text-xl font-bold">{reports.length}</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                    <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Resolved</p>
                    <p className="text-xl font-bold">{reports.filter(r => r.status === 'Resolved').length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setView('report')}
                  className="h-32 flex-col rounded-3xl"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  Report Issue
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setView('history')}
                  className="h-32 flex-col rounded-3xl border-2"
                >
                  <Clock className="w-8 h-8 mb-2 text-emerald-600" />
                  My Reports
                </Button>
              </div>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-zinc-900">Recent Activity</h3>
                  <button onClick={() => setView('history')} className="text-emerald-600 text-sm font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {reports.slice(0, 3).map(report => (
                    <Card key={report.id} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                        {report.image_url ? (
                          <img src={report.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <AlertCircle className="text-zinc-400 w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{report.category}</p>
                        <p className="text-xs text-zinc-500 truncate">{report.address}</p>
                      </div>
                      <Badge status={report.status} />
                    </Card>
                  ))}
                  {reports.length === 0 && (
                    <div className="text-center py-8 text-zinc-400">
                      <p>No reports yet. Help improve your city!</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'report' && (
            <ReportForm 
              onBack={() => setView('home')} 
              onSubmit={handleReportSubmit}
              loading={loading}
            />
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">My Reports</h2>
              </div>
              {reports.map(report => (
                <Card key={report.id} className="p-0">
                  <div className="h-40 bg-zinc-200 relative">
                    {report.image_url && <img src={report.image_url} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute top-4 right-4">
                      <Badge status={report.status} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{report.category}</h3>
                      <span className="text-xs text-zinc-400">{format(new Date(report.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{report.description}</p>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{report.address}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-zinc-100 px-6 py-3 flex justify-around items-center fixed bottom-0 max-w-md w-full">
        <button onClick={() => setView('home')} className={cn('p-2 flex flex-col items-center gap-1', view === 'home' ? 'text-emerald-600' : 'text-zinc-400')}>
          <Building2 className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
        </button>
        <button onClick={() => setView('report')} className="bg-emerald-600 p-4 rounded-2xl -mt-10 shadow-lg shadow-emerald-200 text-white">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setView('history')} className={cn('p-2 flex flex-col items-center gap-1', view === 'history' ? 'text-emerald-600' : 'text-zinc-400')}>
          <List className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Reports</span>
        </button>
      </nav>
    </div>
  );
};

const ReportForm = ({ onBack, onSubmit, loading }: { onBack: () => void, onSubmit: (data: any) => void, loading: boolean }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    image_url: '',
    latitude: 0,
    longitude: 0,
    address: ''
  });

  const categories = ["Broken Road", "Water Supply", "Garbage", "Drainage", "Street Light", "Public Infrastructure"];

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Proactively fetch location when photo is captured
      getLocation();
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: "Fetching address..." // In real app, use reverse geocoding
        }));
        // Simulate reverse geocoding
        setTimeout(() => {
          setFormData(prev => ({ ...prev, address: "Sector 44, Gurgaon, Haryana, India" }));
        }, 1000);
      });
    }
  };

  useEffect(() => {
    if (step === 2) getLocation();
  }, [step]);

  return (
    <motion.div 
      key="report-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Report Issue</h2>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="aspect-square bg-zinc-100 rounded-3xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {formData.image_url ? (
              <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-zinc-900">Take a Photo</p>
                <p className="text-sm text-zinc-500">Capture the issue clearly to help officials understand the problem.</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleCapture}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          {formData.image_url && (
            <Button className="w-full py-4" onClick={() => setStep(2)}>Continue</Button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={cn(
                    'p-3 rounded-xl text-sm font-medium border transition-all text-left',
                    formData.category === cat 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Description (Optional)</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none min-h-[100px]"
              placeholder="Tell us more about the issue..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="bg-zinc-100 p-4 rounded-2xl flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Location Detected</p>
              <p className="text-sm font-medium text-zinc-900">{formData.address || 'Detecting...'}</p>
            </div>
          </div>

          <Button 
            className="w-full py-4" 
            disabled={!formData.category} 
            loading={loading}
            onClick={() => onSubmit(formData)}
          >
            Submit Report
          </Button>
        </div>
      )}
    </motion.div>
  );
};

// --- Admin Dashboard ---

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState({ category: '', status: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, analyticsRes, depsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/analytics'),
        fetch('/api/departments')
      ]);
      setReports(await reportsRes.json());
      setAnalytics(await analyticsRes.json());
      setDepartments(await depsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
    setSelectedReport(prev => prev ? { ...prev, status: status as any } : null);
  };

  const assignDepartment = async (id: number, depId: number) => {
    await fetch(`/api/reports/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_id: depId })
    });
    fetchData();
    const depName = departments.find(d => d.id === depId)?.name;
    setSelectedReport(prev => prev ? { ...prev, department_name: depName } : null);
  };

  const filteredReports = reports.filter(r => 
    (!filter.category || r.category === filter.category) &&
    (!filter.status || r.status === filter.status)
  );

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#6366f1', '#ec4899', '#8b5cf6'];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">GovConnect</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-emerald-400 font-medium">
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-white/5 rounded-xl transition-colors">
            <MapIcon className="w-5 h-5" />
            Map View
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-white/5 rounded-xl transition-colors">
            <Building2 className="w-5 h-5" />
            Departments
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-white/5 rounded-xl transition-colors">
            <UserIcon className="w-5 h-5" />
            Officers
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900">System Overview</h2>
            <p className="text-zinc-500">Monitoring civic reports across the district</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-zinc-600">Live System Status: Normal</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Reports</p>
            <p className="text-4xl font-bold text-zinc-900">{analytics?.total}</p>
            <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
              <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
              <span>+12% from last week</span>
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-4xl font-bold text-amber-600">{analytics?.pending}</p>
            <div className="mt-4 flex items-center text-amber-600 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span className="ml-1">Action required</span>
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Resolved</p>
            <p className="text-4xl font-bold text-emerald-600">{analytics?.resolved}</p>
            <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span className="ml-1">94% Success Rate</span>
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Avg. Resolution</p>
            <p className="text-4xl font-bold text-zinc-900">2.4d</p>
            <div className="mt-4 flex items-center text-zinc-400 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span className="ml-1">Target: 48 hours</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Charts */}
          <div className="col-span-2 space-y-8">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6">Reports by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.byCategory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-0">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">Recent Reports</h3>
                <div className="flex gap-3">
                  <select 
                    className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={e => setFilter(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    {analytics?.byCategory.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
                  </select>
                  <select 
                    className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={e => setFilter(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">Issue</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                              {report.image_url && <img src={report.image_url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="font-bold text-zinc-900">{report.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500 max-w-[200px] truncate">{report.address}</td>
                        <td className="px-6 py-4 text-sm text-zinc-500">{format(new Date(report.created_at), 'MMM d, HH:mm')}</td>
                        <td className="px-6 py-4"><Badge status={report.status} /></td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-700">{report.department_name || 'Unassigned'}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Side Panels */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6">Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.byStatus}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {analytics?.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {analytics?.byStatus.map((s, i) => (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-zinc-600">{s.status}</span>
                    </div>
                    <span className="font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-emerald-900 text-white">
              <h3 className="font-bold text-lg mb-2">Government Notice</h3>
              <p className="text-emerald-100 text-sm mb-4">New directive for Road Maintenance department. All 'Broken Road' issues must be addressed within 24 hours due to monsoon season.</p>
              <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-none">Read Directive</Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-[500px] h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">Report Details</h3>
                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden">
                  {selectedReport.image_url && <img src={selectedReport.image_url} alt="" className="w-full h-full object-cover" />}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-zinc-900">{selectedReport.category}</h4>
                      <p className="text-zinc-500">Report ID: #{selectedReport.id}</p>
                    </div>
                    <Badge status={selectedReport.status} />
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>{selectedReport.address}</span>
                  </div>

                  <div className="bg-zinc-50 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-zinc-700 leading-relaxed">{selectedReport.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-zinc-100">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Update Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Pending', 'Assigned', 'In Progress', 'Resolved'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedReport.id, s)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                            selectedReport.status === s 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Assign Department</label>
                    <div className="grid grid-cols-2 gap-2">
                      {departments.map(dep => (
                        <button
                          key={dep.id}
                          onClick={() => assignDepartment(selectedReport.id, dep.id)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                            selectedReport.department_name === dep.name 
                              ? 'bg-zinc-900 border-zinc-900 text-white' 
                              : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                          )}
                        >
                          {dep.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'citizen' | 'admin' | null>(null);
  const [authStep, setAuthStep] = useState<'role' | 'phone' | 'otp'>('role');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('civic_user');
    const savedRole = localStorage.getItem('civic_role');
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole as any);
    }
  }, []);

  const handleRoleSelect = (selectedRole: 'citizen' | 'admin') => {
    if (selectedRole === 'admin') {
      // For demo, admin bypasses OTP
      const adminUser = { id: 0, phone_number: 'ADMIN' };
      setUser(adminUser);
      setRole('admin');
      localStorage.setItem('civic_user', JSON.stringify(adminUser));
      localStorage.setItem('civic_role', 'admin');
    } else {
      setRole('citizen');
      setAuthStep('phone');
    }
  };

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone })
      });
      setAuthStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, otp })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('civic_user', JSON.stringify(data.user));
        localStorage.setItem('civic_role', 'citizen');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setAuthStep('role');
    localStorage.removeItem('civic_user');
    localStorage.removeItem('civic_role');
  };

  if (user && role === 'citizen') return <CitizenApp user={user} onLogout={handleLogout} />;
  if (user && role === 'admin') return <AdminDashboard onLogout={handleLogout} />;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">CivicConnect India</h1>
          <p className="text-zinc-500">Digital infrastructure for a better city</p>
        </div>

        <AnimatePresence mode="wait">
          {authStep === 'role' && (
            <motion.div 
              key="role"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <button 
                onClick={() => handleRoleSelect('citizen')}
                className="w-full p-6 rounded-2xl border-2 border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <UserIcon className="w-6 h-6 text-zinc-600 group-hover:text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-zinc-900">Citizen Portal</p>
                  <p className="text-sm text-zinc-500">Report issues in your area</p>
                </div>
              </button>
              <button 
                onClick={() => handleRoleSelect('admin')}
                className="w-full p-6 rounded-2xl border-2 border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                  <Building2 className="w-6 h-6 text-zinc-600 group-hover:text-zinc-900" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-zinc-900">Government Admin</p>
                  <p className="text-sm text-zinc-500">Manage and resolve reports</p>
                </div>
              </button>
            </motion.div>
          )}

          {authStep === 'phone' && (
            <motion.div 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit number"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full py-4" onClick={handleRequestOtp} loading={loading}>Send OTP</Button>
              <button onClick={() => setAuthStep('role')} className="w-full text-zinc-400 text-sm font-medium">Go Back</button>
            </motion.div>
          )}

          {authStep === 'otp' && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <p className="text-zinc-500">Enter the 6-digit code sent to</p>
                <p className="font-bold text-zinc-900">{phone}</p>
              </div>
              <input 
                type="text" 
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <Button className="w-full py-4" onClick={handleLogin} loading={loading}>Verify & Login</Button>
              <div className="text-center">
                <p className="text-sm text-zinc-400">Didn't receive code? <button className="text-emerald-600 font-bold">Resend</button></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Powered by Digital India Initiative</p>
        </div>
      </Card>
    </div>
  );
}
