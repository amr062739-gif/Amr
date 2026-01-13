
import React, { useState, useEffect } from 'react';
import { dbProxy } from '../db';
import { Student, Course, Booking } from '../types';
import { Calendar, Wallet, Receipt, Trash2, Search, Printer, Send } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    level: '1',
    paidAmount: '',
    discountAmount: '0',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [s, c, b] = await Promise.all([
      dbProxy.getAll<Student>('students'),
      dbProxy.getAll<Course>('courses'),
      dbProxy.getAll<Booking>('bookings')
    ]);
    setStudents(s);
    setCourses(c);
    setBookings(b.sort((x, y) => (y.bookingId || 0) - (x.bookingId || 0)));
  };

  const selectedCourse = courses.find(c => c.courseId === parseInt(formData.courseId));
  const remaining = selectedCourse 
    ? selectedCourse.price - (parseFloat(formData.paidAmount) || 0) - (parseFloat(formData.discountAmount) || 0) 
    : 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.studentId === parseInt(formData.studentId));
    if (!student || !selectedCourse) return alert('يرجى اختيار طالب وكورس');

    const newBooking: Booking = {
      studentId: student.studentId!,
      courseId: selectedCourse.courseId!,
      studentName: student.name,
      courseName: selectedCourse.courseName,
      coursePrice: selectedCourse.price,
      level: parseInt(formData.level),
      paidAmount: parseFloat(formData.paidAmount),
      discountAmount: parseFloat(formData.discountAmount) || 0,
      remainingAmount: remaining,
      paymentDate: formData.paymentDate,
      bookingDate: new Date().toISOString(),
      bookingNumber: `BK-${Date.now()}`
    };

    await dbProxy.add('bookings', newBooking);
    alert('تم تسجيل الحجز بنجاح');
    setFormData({
      studentId: '',
      courseId: '',
      level: '1',
      paidAmount: '',
      discountAmount: '0',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const pass = prompt('الرقم السري للإلغاء:');
    if (pass !== '013466602') return alert('غير مصرح!');
    await dbProxy.delete('bookings', id);
    loadData();
  };

  const filteredBookings = bookings.filter(b => 
    b.studentName.includes(searchTerm) || b.bookingNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 no-print">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" />
          تسجيل حجز جديد
        </h3>
        <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">الطالب</label>
            <select 
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
            >
              <option value="">اختر طالب...</option>
              {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">الكورس</label>
            <select 
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
            >
              <option value="">اختر كورس...</option>
              {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName} ({c.price} ج.م)</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">المستوى</label>
            <input 
              required
              type="number" 
              min="0" max="10"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">المبلغ المدفوع</label>
            <div className="relative">
               <input 
                required
                type="number"
                className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-200 outline-none"
                value={formData.paidAmount}
                onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
              />
              <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">خصم (إن وجد)</label>
            <input 
              type="number"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none"
              value={formData.discountAmount}
              onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
            />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">تاريخ السداد</label>
             <input 
              type="date"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none"
              value={formData.paymentDate}
              onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
             <div className="flex gap-6">
                <div>
                   <p className="text-xs text-slate-400">سعر الكورس</p>
                   <p className="font-bold">{selectedCourse?.price || 0} ج.م</p>
                </div>
                <div>
                   <p className="text-xs text-slate-400">المتبقي</p>
                   <p className="font-bold text-red-500">{remaining.toFixed(2)} ج.م</p>
                </div>
             </div>
             <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                إتمام الحجز
             </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 no-print">
         <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث في الحجوزات..."
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredBookings.map(b => (
              <div key={b.bookingId} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                   <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                      <Receipt size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{b.studentName}</h4>
                      <p className="text-xs text-slate-500">{b.courseName} • مستوى {b.level}</p>
                   </div>
                   <div className="text-left">
                      <p className="font-bold text-indigo-600">{b.paidAmount} ج.م</p>
                      <p className={`text-[10px] font-bold ${b.remainingAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {b.remainingAmount > 0 ? `متبقي: ${b.remainingAmount}` : 'خالص'}
                      </p>
                   </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <button 
                    onClick={() => {
                      const msg = `إيصال TecnoSoft\nالطالب: ${b.studentName}\nالكورس: ${b.courseName}\nالمدفوع: ${b.paidAmount} ج.م\nالمتبقي: ${b.remainingAmount} ج.م\nرقم: ${b.bookingNumber}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                    }}
                    className="flex-1 sm:flex-none p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                   >
                     <Send size={18} />
                   </button>
                   <button className="flex-1 sm:flex-none p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all" onClick={() => window.print()}>
                     <Printer size={18} />
                   </button>
                   <button 
                    onClick={() => handleDelete(b.bookingId!)}
                    className="flex-1 sm:flex-none p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default BookingsPage;
