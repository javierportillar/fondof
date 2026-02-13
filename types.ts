export enum LoanStatus {
  ACTIVE = 'Activo',
  PENDING = 'Pendiente',
  PAID = 'Pagado'
}

export type UserRole = 'ADMIN' | 'USER'
export type SavingsTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST'

export interface DatabaseLoan {
  id: string;
  user_id: string;
  amount: number;
  remaining_amount: number;
  interest_rate: number;
  term_months: number;
  start_date: string;
  next_payment_date: string;
  monthly_payment: number;
  status: LoanStatus;
  payments_made: number;
  created_at: string;
}

export interface Loan {
  id: string;
  amount: number;
  remainingAmount: number;
  interestRate: number; // Percentage
  termMonths: number;
  startDate: string;
  nextPaymentDate: string;
  monthlyPayment: number;
  status: LoanStatus;
  paymentsMade: number;
}

export interface DatabaseSavingsAccount {
  id: string;
  user_id: string;
  balance: number;
  monthly_contribution: number;
  last_contribution_date: string;
  interest_earned: number;
  created_at: string;
}

export interface DatabaseSavingsHistory {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  type: SavingsTransactionType;
  created_at: string;
}

export interface SavingsAccount {
  balance: number;
  monthlyContribution: number;
  lastContributionDate: string;
  interestEarned: number;
  history: { id: string; date: string; amount: number; type: SavingsTransactionType }[];
}

export interface DatabaseProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  rating: number;
  description?: string;
  is_golden: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  rating: number;
  description?: string;
  isGolden?: boolean;
}

export type OrderChannel = 'whatsapp' | 'store';
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'paid';
export type PaymentMethod = 'cash' | 'nequi';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DatabaseOrder {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  channel: OrderChannel;
  status: OrderStatus;
  payment_method?: PaymentMethod | null;
  items: OrderItem[];
  notes?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  customerName: string;
  customerPhone?: string;
  channel: OrderChannel;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | null;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface DatabaseUser {
  id: string;
  cedula: string;
  name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  credit_limit: number;
  password_hash?: string;
  created_at: string;
}

export interface DatabaseSavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  created_at: string;
}

export interface SavingsGoal {
  name: string;
  targetAmount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  cedula: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  role: Role;
  savings: SavingsAccount;
  loans: Loan[];
  creditLimit: number;
  savingsGoal?: SavingsGoal;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
