import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import {
  SET_CATEGORIES,
  REMOVE_VISIBLE_CATEGORY,
  ADD_VISIBLE_CATEGORY,
  SET_LOCATION,
  GOT_CRIMES,
  GETTING_CRIMES,
  SET_POLICE_API_LAST_UPDATED,
  SET_SEARCH_INPUT,
  SET_SEARCH_SUGGESTIONS,
  SET_SELECTED_MONTH_YEAR,
} from './constants';
import { State } from '@/types';


const initialState: State = {
  categories: {},
  categoryNames: [],
  visibleCategories: [],
  location: null,
  crimes: [],
  policeAPILastUpdated: null,
  loadingCrimeData: false,
  selectedMonthYear: null, // For the MapFilter
  searchInput: '',
  searchSuggestions: [],
};

const reducer = (state = initialState, action: any) => {
  const { type } = action;

  switch(type) {

    case SET_CATEGORIES: {
      const { categories } = action;
      const categoriesObj = { ...state.categories };
      const currentCategories = Object.keys(categoriesObj);
      const categoriesToAdd = categories.filter((category: string) => {
        return !currentCategories.includes(category);
      });

      categoriesToAdd.forEach((category: string) => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const colour = `rgb(${r}, ${g}, ${b})`;

        categoriesObj[category] = {
          total: 0,
          markerColour: colour,
        };
      });

      Object.keys(categoriesObj).forEach((key) => {
        const total = state.crimes.reduce((count: number, crime: any) => {
          if (crime.category !== key) return count;
          return (count + 1);
        }, 0);

        categoriesObj[key].total = total;
      });

      return {
        ...state,
        categories: categoriesObj,
        categoryNames: categories,
        visibleCategories: categories,
      };
    }

    case REMOVE_VISIBLE_CATEGORY: {
      const { category } = action;
      const visibleCategories = state.visibleCategories.filter((cat: string) => {
        return cat !== category;
      })
      return { ...state, visibleCategories };
    }

    case ADD_VISIBLE_CATEGORY: {
      const { category } = action;
      const visibleCategories = [ ...state.visibleCategories, category];
      return { ...state, visibleCategories };
    }

    case SET_LOCATION: {
      return {
        ...state,
        location: action.location,

        // want the search input to contain text of selected location
        searchInput: action.location.text,


      };
    }

    case GETTING_CRIMES: {
      return {
        ...state,
        crimes:[],
        categoryNames: [],
        visibleCategories: [],
        loadingCrimeData: true,
        crimeTotalsByCategory: {},
      } as State;
    }

    case GOT_CRIMES: {
      return {
        ...state,
        crimes: action.crimes,
        loadingCrimeData: false,
      };
    }

    case SET_POLICE_API_LAST_UPDATED: {
      const dateRegex = /^(?<year>\d{4})-(?<month>\d{2})-\d{2}/.exec(action.date);
      const date = {
        // -1 as js has 0 based indexes for months
        month: parseInt(dateRegex.groups.month, 10) - 1,
        year: parseInt(dateRegex.groups.year, 10),
      };

      const toReturn = { ...state, policeAPILastUpdated: date };
      if (toReturn.selectedMonthYear === null) toReturn.selectedMonthYear = date;
      return toReturn;
    }

    case SET_SEARCH_INPUT: {
      const searchSuggestions = action.clearSuggestions 
        ? []
        : state.searchSuggestions;
      return { ...state, searchSuggestions, searchInput: action.searchInput };
    }

    case SET_SEARCH_SUGGESTIONS: {
      return { ...state, searchSuggestions: action.searchSuggestions };
    }

    case SET_SELECTED_MONTH_YEAR: {
      return {
        ...state,
        selectedMonthYear: {
          month: action.month,
          year: action.year,
        },
      }
    }

    default:
      return state;

  }
}

const win: any = window;

export const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    win.__REDUX_DEVTOOLS_EXTENSION__ && win.__REDUX_DEVTOOLS_EXTENSION__(),
  ),
);