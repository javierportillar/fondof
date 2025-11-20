export enum LoanStatus {
    ACTIVE = 'Activo',
    PENDING = 'Pendiente',
    PAID = 'Pagado'
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
  
  export interface SavingsAccount {
    balance: number;
    monthlyContribution: number;
    lastContributionDate: string;
    interestEarned: number;
    history: { date: string; amount: number; type: 'DEPOSIT' | 'INTEREST' }[];
  }
  
  export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    stock: number;
    rating: number;
  }
  
  export interface UserProfile {
    id: string;
    name: string;
    email: string;
    savings: SavingsAccount;
    loans: Loan[];
    creditLimit: number;
  }
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
  }