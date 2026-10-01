import React from 'react';
import { CustomerEarningsView } from './CustomerEarningsView';

/**
 * RewardsView delegates directly to the centralized CustomerEarningsView.
 * All earning and payout related data has been transferred to the dedicated Earnings tab.
 */
export const RewardsView: React.FC = () => {
  return <CustomerEarningsView />;
};

export default RewardsView;
