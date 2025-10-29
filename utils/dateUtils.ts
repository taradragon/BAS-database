/**
 * Calculate age from birth date
 * @param birthDate - Birth date in YYYY-MM-DD format
 * @returns Age in years or null if invalid date
 */
export const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  // Check if birth date is valid
  if (isNaN(birth.getTime())) return null;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // If birth month hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : null;
};