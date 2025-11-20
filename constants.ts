import { LoanStatus, Product, UserProfile } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Arroz Premium (5kg)',
    category: 'Granos',
    price: 18500,
    image: 'https://picsum.photos/200/200?random=1',
    stock: 50,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Aceite de Girasol (3L)',
    category: 'Aceites',
    price: 32000,
    image: 'https://picsum.photos/200/200?random=2',
    stock: 30,
    rating: 4.5
  },
  {
    id: '3',
    name: 'Café Tradicional (500g)',
    category: 'Bebidas',
    price: 15000,
    image: 'https://picsum.photos/200/200?random=3',
    stock: 100,
    rating: 4.9
  },
  {
    id: '4',
    name: 'Leche Entera (Pack x6)',
    category: 'Lácteos',
    price: 24000,
    image: 'https://picsum.photos/200/200?random=4',
    stock: 20,
    rating: 4.7
  },
  {
    id: '5',
    name: 'Detergente Líquido (3L)',
    category: 'Limpieza',
    price: 28500,
    image: 'https://picsum.photos/200/200?random=5',
    stock: 45,
    rating: 4.6
  },
  {
    id: '6',
    name: 'Huevos AA (Cubeta x30)',
    category: 'Proteína',
    price: 17000,
    image: 'https://picsum.photos/200/200?random=6',
    stock: 15,
    rating: 4.4
  }
];

export const MOCK_USER: UserProfile = {
  id: '109823',
  name: 'Carlos Rodríguez',
  email: 'carlos.rodriguez@email.com',
  creditLimit: 5000000,
  savings: {
    balance: 1250000,
    monthlyContribution: 100000,
    lastContributionDate: '2023-10-01',
    interestEarned: 45000,
    history: [
      { date: '2023-10-01', amount: 100000, type: 'DEPOSIT' },
      { date: '2023-09-01', amount: 100000, type: 'DEPOSIT' },
      { date: '2023-08-31', amount: 5000, type: 'INTEREST' },
      { date: '2023-08-01', amount: 100000, type: 'DEPOSIT' },
      { date: '2023-07-01', amount: 100000, type: 'DEPOSIT' },
      { date: '2023-06-01', amount: 100000, type: 'DEPOSIT' },
    ]
  },
  loans: [
    {
      id: 'L-001',
      amount: 2000000,
      remainingAmount: 1200000,
      interestRate: 1.5, // 1.5% Mensual
      termMonths: 12,
      startDate: '2023-05-15',
      nextPaymentDate: '2023-11-15',
      monthlyPayment: 183000,
      status: LoanStatus.ACTIVE,
      paymentsMade: 5
    }
  ]
};