
import { Student, Course, Booking, AttendanceRecord } from './types';

const DB_NAME = 'TecnoSoftProDB';
const DB_VERSION = 1;

export class Database {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('students')) {
          const s = db.createObjectStore('students', { keyPath: 'studentId', autoIncrement: true });
          s.createIndex('phone', 'phone', { unique: true });
          s.createIndex('name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains('courses')) {
          const c = db.createObjectStore('courses', { keyPath: 'courseId', autoIncrement: true });
          c.createIndex('courseName', 'courseName', { unique: true });
        }
        if (!db.objectStoreNames.contains('bookings')) {
          const b = db.createObjectStore('bookings', { keyPath: 'bookingId', autoIncrement: true });
          b.createIndex('studentId', 'studentId', { unique: false });
          b.createIndex('courseId', 'courseId', { unique: false });
          b.createIndex('bookingNumber', 'bookingNumber', { unique: true });
        }
        if (!db.objectStoreNames.contains('attendance')) {
          const a = db.createObjectStore('attendance', { keyPath: 'attendanceId', autoIncrement: true });
          a.createIndex('studentId', 'studentId', { unique: false });
          a.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add<T>(storeName: string, item: T): Promise<number> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, item: T): Promise<number> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: number): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.open();
    const stores = ['students', 'courses', 'bookings', 'attendance'];
    const transaction = db.transaction(stores, 'readwrite');
    for (const s of stores) {
      transaction.objectStore(s).clear();
    }
    return new Promise((resolve) => {
      transaction.oncomplete = () => resolve();
    });
  }
}

export const dbProxy = new Database();
