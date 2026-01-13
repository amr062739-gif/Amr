
import React, { useState, useEffect } from 'react';
import { dbProxy } from '../db';
import { Course } from '../types';
import { PlusCircle, Book, Tag, Edit, Trash2 } from 'lucide-react';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({ courseName: '', price: '' });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await dbProxy.getAll<Course>('courses');
    setCourses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const course: Course = {
      courseName: formData.courseName,
      price: parseFloat(formData.price),
      createdAt: new Date().toISOString()
    };
    try {
      await dbProxy.add('courses', course);
      setFormData({ courseName: '', price: '' });
      loadCourses();
      alert('تم إضافة الكورس بنجاح');
    } catch (err: any) {
      alert('اسم الكورس مسجل مسبقاً أو حدث خطأ');
    }
  };

  const handleEditPrice = async (course: Course) => {
    const pass = prompt('أدخل الرقم السري لتعديل السعر:');
    if (pass !== '013466602') return alert('الرقم السري غير صحيح!');
    
    const newPrice = prompt('أدخل السعر الجديد:', course.price.toString());
    if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
      const updated = { ...course, price: parseFloat(newPrice) };
      await dbProxy.put('courses', updated);
      loadCourses();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <PlusCircle size={20} className="text-indigo-600" />
          إضافة كورس جديد
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            required
            type="text"
            placeholder="اسم الكورس..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.courseName}
            onChange={(e) => setFormData({...formData, courseName: e.target.value})}
          />
          <input
            required
            type="number"
            placeholder="السعر (ج.م)..."
            className="w-full sm:w-40 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
          <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            إضافة
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course.courseId} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Book size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{course.courseName}</h4>
                <p className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                  <Tag size={14} />
                  {course.price.toFixed(2)} ج.م
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleEditPrice(course)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Edit size={20} />
            </button>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="md:col-span-2 py-12 text-center text-slate-400">
            لا توجد كورسات مسجلة حالياً
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
