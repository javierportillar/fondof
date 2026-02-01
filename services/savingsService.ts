import { UserProfile } from '../types';

export const SavingsService = {
  /**
   * Registers a new contribution to the user's savings.
   * Returns a NEW UserProfile object (does not mutate).
   */
  addContribution: (user: UserProfile, amount: number, date: string): UserProfile => {
    const newHistoryItem = {
      id: `txn-${Date.now()}`,
      date,
      amount,
      type: 'DEPOSIT' as const
    };

    const newBalance = user.savings.balance + amount;

    // Check if this is the latest date to update lastContributionDate
    const isLatest = !user.savings.lastContributionDate || new Date(date) > new Date(user.savings.lastContributionDate);

    return {
      ...user,
      savings: {
        ...user.savings,
        balance: newBalance,
        lastContributionDate: isLatest ? date : user.savings.lastContributionDate,
        history: [newHistoryItem, ...user.savings.history].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }
    };
  },

  /**
   * Updates an existing contribution.
   * Recalculates balance by removing old amount and adding new amount.
   */
  updateContribution: (user: UserProfile, transactionId: string, newAmount: number, newDate: string): UserProfile => {
    const oldTransaction = user.savings.history.find(h => h.id === transactionId);

    if (!oldTransaction) return user;

    // Calculate balance difference (New - Old)
    // Note: If type was WITHDRAWAL, logic would be inverted, but we assume we are editing DEPOSITS for now as per req.
    const diff = newAmount - oldTransaction.amount;

    // Create new history array with updated item
    const newHistory = user.savings.history.map(h => {
      if (h.id === transactionId) {
        return { ...h, date: newDate, amount: newAmount };
      }
      return h;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Recalculate 'lastContributionDate' (simplest is to just take the first one after sort)
    const newLastDate = newHistory.length > 0 ? newHistory[0].date : '';

    return {
      ...user,
      savings: {
        ...user.savings,
        balance: user.savings.balance + diff, // This works for DEPOSITS.
        lastContributionDate: newLastDate,
        history: newHistory
      }
    };
  },

  /**
   * Aggregates savings history by month for charting.
   * Returns array: [{ name: 'Ene', amount: 100000 }, ...]
   */
  getMonthlySavingsData: (history: { date: string; amount: number; type: 'DEPOSIT' | 'INTEREST' | 'WITHDRAWAL' }[]) => {
    const monthMap = new Map<string, number>();

    // Sort history chronologically for processing
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedHistory.forEach(item => {
      // Only count deposits for "How much did they contribute" analysis
      if (item.type === 'DEPOSIT') {
        // Parse YYYY-MM-DD string directly to avoid timezone issues
        const [year, month] = item.date.split('-'); // ["2023", "10", "01"]
        const key = `${year}-${month}`; // "2023-10"

        monthMap.set(key, (monthMap.get(key) || 0) + item.amount);
      }
    });

    // Convert to array and take last 6-12 months
    const result = Array.from(monthMap.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        // Create date for formatting using UTC to match the key
        const dateObj = new Date(Number(year), Number(month) - 1, 1);
        return {
          name: dateObj.toLocaleDateString('es-ES', { month: 'short' }), // "ene", "feb"
          fullName: dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          key, // for sorting if needed
          amount: value
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key)) // Chronological order
      .slice(-12); // Last 12 recorded months

    return result;
  }
};
