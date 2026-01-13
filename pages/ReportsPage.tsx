
import React, { useState, useEffect } from 'react';
import { dbProxy } from '../db';
import { Booking, Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [b, s] = await Promise.all([
      dbProxy.getAll<Booking>('bookings'),
      dbProxy.getAll<Student>('students')
    ]);
    setBookings(b);
    setStudents(s);
  };

  const filtered = bookings.filter(b => {
    if (!startDate || !endDate) return true;
    const date = new Date(b.paymentDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const totalPaid = filtered.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDiscount = filtered.reduce((acc, curr) => acc + (curr.discountAmount || 0), 0);
  const totalRemaining = filtered.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  // Group by date for chart
  const chartDataMap = filtered.reduce((acc: any, b) => {
    acc[b.paymentDate] = (acc[b.paymentDate] || 0) + b.paidAmount;
    return acc;
  }, {});

  const chartData = Object.keys(chartDataMap).sort().map(date => ({
    date,
    amount: chartDataMap[date]
  })).slice(-10);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between no-print">
         <div className="flex gap-4">
            <input 
              type="date" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
              type="date" 
              className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
         </div>
         <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2">
            <Award size={18} />
            تصدير تقرير PDF
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
               <p className="text-xs text-slate-400">إجمالي المحصل</p>
               <p className="text-xl font-bold">{totalPaid.toLocaleString()} ج.م</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-xs text-slate-400">إجمالي الخصومات</p>
               <p className="text-xl font-bold">{totalDiscount.toLocaleString()} ج.م</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
               <p className="text-xs text-slate-400">إجمالي المتبقي</p>
               <p className="text-xl font-bold">{totalRemaining.toLocaleString()} ج.م</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
               <p className="text-xs text-slate-400">عدد الطلاب</p>
               <p className="text-xl font-bold">{students.length}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-80">
            <h3 className="font-bold mb-6">الإيرادات المحصلة (آخر 10 أيام معاملة)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <h3 className="font-bold mb-4">أحدث العمليات</h3>
            <div className="space-y-4">
               {filtered.slice(0, 6).map(b => (
                 <div key={b.bookingId} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                    <div>
                       <p className="font-bold">{b.studentName}</p>
                       <p className="text-xs text-slate-400">{b.courseName}</p>
                    </div>
                    <p className="font-bold text-green-600">{b.paidAmount} ج.م</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsPage;
