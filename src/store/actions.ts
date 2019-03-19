import {
  SET_CATEGORIES,
  REMOVE_VISIBLE_CATEGORY,
  ADD_VISIBLE_CATEGORY,
  SET_LOCATION,
  GETTING_CRIMES,
  GOT_CRIMES,
} from './constants';

import { getCrimesByBbox } from '../policeAPI';


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

const setMapLocation = (location: any) => {
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

const setCategories = (categories: string[]) => {
  return {
    categories,
    type: SET_CATEGORIES,
  };
};

export const setLocation = (location: any) => {
  return (dispatch: any) => {
    dispatch(setMapLocation(location));
    dispatch(gettingCrimes());

    const { bbox } = location;
    return getCrimesByBbox(bbox).then((crimes) => {
      const categories: any = [...new Set(crimes.map(({ category }: any) => category))];
      dispatch(gotCrimes(crimes));
      dispatch(setCategories(categories));
    });
  };
};

