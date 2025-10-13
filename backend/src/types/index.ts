import { Request } from 'express';
import { User, Role, BookingStatus, PaymentStatus } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CarSearchFilters {
  q?: string;
  city?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  seats?: number;
  transmission?: string;
  availableFrom?: string;
  availableTo?: string;
  page?: number;
  perPage?: number;
}

export interface CreateBookingRequest {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  dropLocation?: string;
  extras?: any;
  couponCode?: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  paymentMethod: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
}

export interface PaginationOptions {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationOptions;
  error?: string;
}

export interface CarWithOwner extends Omit<User, 'password'> {
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BookingWithDetails {
  id: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  car: {
    id: string;
    title: string;
    brand: string;
    model: string;
    images: string[];
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}