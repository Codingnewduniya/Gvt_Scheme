import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface User {
  id: number;
  phone_number: string;
}

export interface Report {
  id: number;
  user_id: number;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  image_url: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';
  created_at: string;
  department_name?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Analytics {
  total: number;
  resolved: number;
  pending: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
}
