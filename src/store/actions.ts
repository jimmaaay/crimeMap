import {
  SET_CATEGORIES,
  REMOVE_VISIBLE_CATEGORY,
  ADD_VISIBLE_CATEGORY,
  SET_LOCATION,
  GETTING_CRIMES,
  GOT_CRIMES,
} from './constants';

import { getCrimesByBbox } from '../policeAPI';

export const setCategories = (categories: string[]) => {
  return {
    categories,
    type: SET_CATEGORIES,
  };
};

export const removeSelectedCategory = (category: string) => {
  return {
    category,
    type: REMOVE_VISIBLE_CATEGORY,
  };
};

export const addSelectedCategory = (category: string) => {
  return {
    category,
    type: ADD_VISIBLE_CATEGORY,
  };
};

export const setLocation = (location: any) => {
  return {
    location,
    type: SET_LOCATION,
  };
};

const gettingCrimes = () => {
  return {
    type: GETTING_CRIMES,
  };
};

const gotCrimes = (crimes: any[]) => {
  return {
    crimes,
    type: GOT_CRIMES,
  };
};

export const getCrimes = (bbox: any) => {
  return (dispatch: any) => {
    dispatch(gettingCrimes());
    return getCrimesByBbox(bbox).then((crimes) => {
      dispatch(gotCrimes(crimes));
    });
  }
};

