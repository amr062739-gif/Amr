
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  PieChart, 
  Database as DbIcon, 
  CalendarCheck,
  Menu,
  X
} from 'lucide-react';
import { ViewType, Student, Course, Booking } from './types';
import { dbProxy } from './db';

import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import BookingsPage from './pages/BookingsPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import BackupPage from './pages/BackupPage';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('students');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    dbProxy.open().then(() => setDataLoaded(true));
  }, []);

  const menuItems = [
    { id: 'students', label: 'الطلاب', icon: Users },
    { id: 'courses', label: 'الكورسات', icon: BookOpen },
    { id: 'bookings', label: 'الحجوزات', icon: CalendarCheck },
    { id: 'attendance', label: 'الحضور', icon: ClipboardCheck },
    { id: 'reports', label: 'التقارير', icon: PieChart },
    { id: 'backup', label: 'النظام', icon: DbIcon },
  ];

  if (!dataLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 shadow-sm transition-transform duration-300 lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
       no-print`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1 rounded">TS</span>
              TecnoSoft
            </h1>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as ViewType);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeView === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            إصدار Pro v2.0 &copy; {new Date().getFullYear()}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 no-print">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {menuItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">A</div>
             <span className="hidden sm:inline text-sm font-medium">المدير</span>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeView === 'students' && <StudentsPage />}
          {activeView === 'courses' && <CoursesPage />}
          {activeView === 'bookings' && <BookingsPage />}
          {activeView === 'attendance' && <AttendancePage />}
          {activeView === 'reports' && <ReportsPage />}
          {activeView === 'backup' && <BackupPage />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
