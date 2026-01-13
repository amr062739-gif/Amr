
export interface Student {
  studentId?: number;
  name: string;
  age: number;
  address: string;
  phone: string;
  hasSiblings: 'yes' | 'no';
  createdAt: string;
}

export interface Course {
  courseId?: number;
  courseName: string;
  price: number;
  createdAt: string;
}

export interface Booking {
  bookingId?: number;
  studentId: number;
  courseId: number;
  studentName: string;
  courseName: string;
  coursePrice: number;
  level: number;
  paidAmount: number;
  discountAmount: number;
  remainingAmount: number;
  paymentDate: string;
  bookingDate: string;
  bookingNumber: string;
}

export interface AttendanceRecord {
  attendanceId?: number;
  studentId: number;
  studentName: string;
  date: string;
}

export type ViewType = 'students' | 'courses' | 'bookings' | 'attendance' | 'reports' | 'backup';
