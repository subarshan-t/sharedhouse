import { useContext } from 'react';
import { HouseDataContext } from './houseDataContextObj';

export function useHouseData() {
  const ctx = useContext(HouseDataContext);
  if (!ctx) throw new Error('useHouseData must be used within HouseDataProvider');
  return ctx;
}
