import { UserRole } from './types';

export const USER_ACCOUNTS: { id: UserRole; name: string }[] = [
  { id: 'Admin', name: 'Admin' },
  { id: 'CEO', name: 'Head Leader' },
  { id: '2ashbal', name: '2ashbal Head' },
  { id: 'bar3me', name: 'bar3me Head' },
  { id: 'kashaf', name: 'kashaf Head' },
  { id: 'motakadam', name: 'motakadam Head' },
  { id: 'morsha7in gawala', name: 'morsha7in gawala Head' },
  { id: 'gawala', name: 'gawala Head' },
];

// Defines the allowed, one-way transfer path between departments.
// { [sourceDeptId]: targetDeptId }
export const TRANSFER_LADDER: { [key: number]: number } = {
  2: 1, // bar3me -> 2ashbal
  1: 3, // 2ashbal -> kashaf
  3: 4, // kashaf -> motakadam
  4: 5, // motakadam -> morsha7in gawala
  5: 6, // morsha7in gawala -> gawala
};