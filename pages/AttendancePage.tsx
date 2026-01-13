
import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { dbProxy } from '../db';
import { Student, AttendanceRecord } from '../types';
import { Camera, CameraOff, UserCheck, Search, Volume2 } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadData();
    return () => stopCamera();
  }, []);

  const loadData = async () => {
    const [s, a] = await Promise.all([
      dbProxy.getAll<Student>('students'),
      dbProxy.getAll<AttendanceRecord>('attendance')
    ]);
    setStudents(s);
    setAttendanceList(a.sort((x, y) => (y.attendanceId || 0) - (x.attendanceId || 0)).slice(0, 10));
  };

  const speak = (name: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(`شكراً لك ${name}`);
      msg.lang = 'ar-SA';
      speechSynthesis.speak(msg);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        requestAnimationFrame(scan);
      }
    } catch (err) {
      alert('لا يمكن فتح الكاميرا');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scan = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        const result = code.data.trim();
        if (result !== lastScanned) {
          handleScannedResult(result);
          setLastScanned(result);
          setTimeout(() => setLastScanned(null), 3000);
        }
      }
    }
    if (isScanning) requestAnimationFrame(scan);
  };

  const handleScannedResult = async (result: string) => {
    let studentId: number | null = null;
    if (result.startsWith('STUDENT_ID:')) {
      studentId = parseInt(result.split(':')[1]);
    }

    if (studentId) {
      const student = students.find(s => s.studentId === studentId);
      if (student) {
        await recordAttendance(student);
      }
    }
  };

  const recordAttendance = async (student: Student) => {
    const today = new Date().toISOString().split('T')[0];
    const record: AttendanceRecord = {
      studentId: student.studentId!,
      studentName: student.name,
      date: today
    };
    await dbProxy.add('attendance', record);
    speak(student.name);
    loadData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Side */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center bg-slate-900">
            {isScanning ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 border-[40px] border-black/40">
                  <div className="w-full h-full border-2 border-indigo-400/50 rounded-lg relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-scan"></div>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <CameraOff size={32} />
                </div>
                <p className="text-slate-400">الكاميرا مغلقة</p>
              </div>
            )}
          </div>
          <button 
            onClick={isScanning ? stopCamera : startCamera}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
              isScanning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {isScanning ? <CameraOff size={24} /> : <Camera size={24} />}
            {isScanning ? 'إيقاف المسح' : 'فتح الكاميرا للمسح'}
          </button>
        </div>

        {/* Manual Side & History */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-indigo-600" />
                تسجيل يدوي
              </h3>
              <div className="flex gap-2">
                 <select 
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                 >
                    <option value="">اختر طالب...</option>
                    {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name}</option>)}
                 </select>
                 <button 
                  onClick={() => {
                    const s = students.find(st => st.studentId === parseInt(selectedStudentId));
                    if (s) recordAttendance(s);
                  }}
                  className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                 >
                   تسجيل
                 </button>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1">
              <h3 className="font-bold mb-4">آخر العمليات</h3>
              <div className="space-y-3">
                 {attendanceList.map(item => (
                   <div key={item.attendanceId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <UserCheck size={16} />
                         </div>
                         <div>
                            <p className="font-bold text-sm">{item.studentName}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                         </div>
                      </div>
                      <Volume2 size={16} className="text-slate-300" />
                   </div>
                 ))}
                 {attendanceList.length === 0 && <p className="text-center text-slate-400 py-8">لا توجد سجلات اليوم</p>}
              </div>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(300px); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AttendancePage;
