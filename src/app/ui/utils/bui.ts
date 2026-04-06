import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const bui = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
