
import React from 'react';
import { dbProxy } from '../db';
import { Database, Download, Upload, AlertTriangle, ShieldAlert } from 'lucide-react';

const BackupPage: React.FC = () => {
  const handleExport = async () => {
    const data = {
      students: await dbProxy.getAll('students'),
      courses: await dbProxy.getAll('courses'),
      bookings: await dbProxy.getAll('bookings'),
      attendance: await dbProxy.getAll('attendance')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TecnoSoft_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const confirmClear = confirm('سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد؟');
        if (!confirmClear) return;

        await dbProxy.clearAll();
        
        for (const s of data.students || []) await dbProxy.add('students', s);
        for (const c of data.courses || []) await dbProxy.add('courses', c);
        for (const b of data.bookings || []) await dbProxy.add('bookings', b);
        for (const a of data.attendance || []) await dbProxy.add('attendance', a);
        
        alert('تم استيراد البيانات بنجاح! سيتم تحديث التطبيق.');
        window.location.reload();
      } catch (err) {
        alert('فشل استيراد الملف. تأكد من أن الملف صحيح.');
      }
    };
    input.click();
  };

  const clearDatabase = async () => {
    const pass = prompt('أدخل الرقم السري للمسح الشامل:');
    if (pass !== '013466602') return alert('غير مصرح!');
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await dbProxy.clearAll();
      alert('تم مسح قاعدة البيانات');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Database size={28} />
            </div>
            <div>
               <h3 className="text-xl font-bold">إدارة البيانات</h3>
               <p className="text-slate-400 text-sm">قم بحماية بياناتك عبر النسخ الاحتياطي الدوري</p>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-3 bg-indigo-600 text-white p-6 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
               <Download size={24} />
               تصدير البيانات
            </button>
            <button 
              onClick={handleImport}
              className="flex items-center justify-center gap-3 bg-white text-slate-800 border-2 border-slate-100 p-6 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
               <Upload size={24} />
               استيراد نسخة
            </button>
         </div>

         <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
               ملاحظة: يتم حفظ جميع البيانات محلياً في متصفحك. في حال قمت بمسح سجل التصفح الشامل، قد تفقد البيانات. ننصح بشدة بعمل نسخة احتياطية يومياً.
            </p>
         </div>
      </div>

      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4">
         <h4 className="text-red-700 font-bold flex items-center gap-2">
            <AlertTriangle size={20} />
            منطقة الخطر
         </h4>
         <p className="text-sm text-red-600">سيؤدي هذا الإجراء إلى حذف جميع الطلاب والكورسات والحجوزات بشكل نهائي.</p>
         <button 
          onClick={clearDatabase}
          className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
         >
           مسح شامل للقاعدة
         </button>
      </div>
    </div>
  );
};

export default BackupPage;
