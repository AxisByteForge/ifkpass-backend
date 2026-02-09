import { DISCOUNT_DEADLINE } from './consts';

export const isDiscountAvailable = (currentDate: Date): boolean => {
  return currentDate.getTime() <= DISCOUNT_DEADLINE.getTime();
};
