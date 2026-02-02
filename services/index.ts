// Export all services for easy importing
export { AuthService } from './authService'
export { SavingsService } from './savingsService'
export { LoansService } from './loansService'
export { ProductsService } from './productsService'
export { UsersService } from './usersService'

// Re-export types that are commonly used with services
export type {
  UserProfile,
  DatabaseUser,
  Loan,
  DatabaseLoan,
  Product,
  DatabaseProduct,
  SavingsAccount,
  DatabaseSavingsAccount,
  SavingsGoal,
  DatabaseSavingsGoal,
  LoanStatus,
  Role,
  UserRole,
  SavingsTransactionType
} from '../types'