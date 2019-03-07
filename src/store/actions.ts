import {
  SET_CATEGORIES,
  REMOVE_CATEGORY,
  ADD_CATEGORY,
} from './constants';

export const setCategories = (categories: string[]) => {
  return {
    categories,
    type: SET_CATEGORIES,
  };
};

export const removeSelectedCategory = (category: string) => {
  return {
    category,
    type: REMOVE_CATEGORY,
  };
};

export const addSelectedCategory = (category: string) => {
  return {
    category,
    type: ADD_CATEGORY,
  };
};