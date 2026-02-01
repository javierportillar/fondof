import { UserProfile, Role, LoanStatus } from '../types';

/**
 * Initial Users Data
 * This serves as the seed data for the application.
 * Runtime changes are persisted to LocalStorage.
 */
export const USERS_DATA: UserProfile[] = [
  {
    id: '1',
    name: 'Administrador Principal',
    role: Role.ADMIN,
    cedula: '1234567890',
    email: 'admin@fondof.com',
    phoneNumber: '3000000000',
    createdAt: '2023-01-01',
    creditLimit: 0,
    savings: {
      balance: 0,
      monthlyContribution: 0,
      interestEarned: 0,
      lastContributionDate: '',
      history: []
    },
    loans: []
  },
  {
    id: '2',
    name: 'Juan Pérez',
    role: Role.USER,
    cedula: '987654321',
    email: 'juan@email.com',
    phoneNumber: '3111111111',
    createdAt: '2023-06-15',
    creditLimit: 5000000,
    savings: {
      balance: 1500000,
      monthlyContribution: 200000,
      interestEarned: 45000,
      lastContributionDate: '2023-12-01',
      history: [
        { id: 'txn1', date: '2023-08-01', amount: 200000, type: 'DEPOSIT' },
        { id: 'txn2', date: '2023-09-01', amount: 200000, type: 'DEPOSIT' },
        { id: 'txn3', date: '2023-10-01', amount: 200000, type: 'DEPOSIT' },
        { id: 'txn4', date: '2023-11-01', amount: 200000, type: 'DEPOSIT' },
        { id: 'txn5', date: '2023-12-01', amount: 200000, type: 'DEPOSIT' },
      ]
    },
    loans: [
      {
        id: 'loan1',
        amount: 3000000,
        date: '2023-10-15',
        status: LoanStatus.ACTIVE,
        interestRate: 0.015, // 1.5%
        termMonths: 12,
        paidAmount: 650000,
        payments: [
          { id: 'pay1', date: '2023-11-15', amount: 325000 },
          { id: 'pay2', date: '2023-12-15', amount: 325000 }
        ]
      }
    ]
  }
];
