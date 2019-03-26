import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import {
  SET_CATEGORIES,
  REMOVE_VISIBLE_CATEGORY,
  ADD_VISIBLE_CATEGORY,
  SET_LOCATION,
  GOT_CRIMES,
  GETTING_CRIMES,
} from './constants';

const initialState: any = {
  categories: {},
  categoryNames: [],
  visibleCategories: [],
  location: {},
  crimes: [],
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
          markerColour: colour,
        };
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
      return { ...state, location: action.location };
    }

    case GETTING_CRIMES: {
      return { ...state, crimes:[], categoryNames: [], visibleCategories: []}
    }

    case GOT_CRIMES: {
      return { ...state, crimes: action.crimes };
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