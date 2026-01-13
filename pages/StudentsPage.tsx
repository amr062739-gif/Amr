
import React, { useState, useEffect } from 'react';
import { dbProxy } from '../db';
import { Student } from '../types';
// Added Users to the imports from lucide-react
import { Search, UserPlus, Phone, MapPin, Calendar, QrCode, Download, Trash2, Edit, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    age: 0,
    phone: '',
    address: '',
    hasSiblings: 'no'
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await dbProxy.getAll<Student>('students');
    setStudents(data.sort((a, b) => (b.studentId || 0) - (a.studentId || 0)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = {
        ...formData,
        createdAt: new Date().toISOString()
      } as Student;

      await dbProxy.add('students', student);
      alert('تم حفظ الطالب بنجاح');
      setFormData({ name: '', age: 0, phone: '', address: '', hasSiblings: 'no' });
      setShowForm(false);
      loadStudents();
    } catch (err: any) {
      if (err.name === 'ConstraintError') alert('رقم الهاتف مسجل مسبقاً');
      else alert('خطأ أثناء الحفظ');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center no-print">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-100"
        >
          <UserPlus size={20} />
          <span>{showForm ? 'إلغاء' : 'طالب جديد'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300 no-print">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" />
            بيانات الطالب الجديد
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">الاسم الكامل</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">رقم الهاتف</label>
              <input
                required
                type="tel"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">العمر</label>
              <input
                required
                type="number"
                min="4"
                max="80"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">العنوان</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">هل يوجد إخوة؟</label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.hasSiblings}
                onChange={(e) => setFormData({...formData, hasSiblings: e.target.value as any})}
              >
                <option value="no">لا</option>
                <option value="yes">نعم</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all">
                حفظ الطالب
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {filteredStudents.map(student => (
          <div key={student.studentId} className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{student.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    مسجل في: {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(student)}
                className="text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-all"
              >
                <QrCode size={18} />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-indigo-500" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={14} className="text-indigo-500" />
                <span className="truncate">{student.address || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={14} className="text-indigo-500" />
                <span>العمر: {student.age} سنة • {student.hasSiblings === 'yes' ? 'لديه إخوة' : 'لا يوجد إخوة'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center space-y-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold">باركود الطالب</h3>
            <div className="bg-white p-4 border-2 border-slate-100 rounded-2xl inline-block shadow-sm">
              <QRCodeSVG 
                value={`STUDENT_ID:${selectedStudent.studentId}`} 
                size={200}
                includeMargin={true}
              />
            </div>
            <div>
              <p className="font-bold text-lg">{selectedStudent.name}</p>
              <p className="text-slate-500 text-sm">ID: {selectedStudent.studentId}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                إغلاق
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                طباعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
