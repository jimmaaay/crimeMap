import {
  SET_CATEGORIES,
  REMOVE_VISIBLE_CATEGORY,
  ADD_VISIBLE_CATEGORY,
  SET_LOCATION,
  GETTING_CRIMES,
  GOT_CRIMES,
  SET_POLICE_API_LAST_UPDATED,
  SET_SEARCH_INPUT,
  SET_SEARCH_SUGGESTIONS,
} from './constants';

import { getCrimesByBbox } from '../policeAPI';
import { makeRequest } from '../geocoding';


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

const setPoliceAPILastUpdatedDate = (date: string) => {
  return {
    date,
    type: SET_POLICE_API_LAST_UPDATED,
  };
};

export const getPoliceAPILastUpdatedDate = () => {
  return (dispatch: any) => {
    return fetch('https://data.police.uk/api/crime-last-updated')
      .then(_ => _.json())
      .then(({ date }) => {
        dispatch(setPoliceAPILastUpdatedDate(date));
      });
  };
};


export const setSearchInput = (searchInput: string) => {
  return {
    searchInput,
    type: SET_SEARCH_INPUT,
  };
};

export const setSearchSuggestons = (searchSuggestions: any[]) => {
  return {
    searchSuggestions,
    type: SET_SEARCH_SUGGESTIONS,
  };
};

// TODO: Look at cancelling makeRequest promise somehow
export const getSearchSuggestions = () => {
  return (dispatch: any, getState: Function) => {
    const { searchInput } = getState();
    makeRequest(searchInput)
      .then((res) => {
        const suggestions = res.features;
        dispatch(setSearchSuggestons(suggestions));
      })
      .catch(console.log) // TODO: Show something to the user
  };
};