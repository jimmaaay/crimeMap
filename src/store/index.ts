import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import {
  SET_CATEGORIES,
  REMOVE_VISIBLE_CATEGORY,
  ADD_VISIBLE_CATEGORY,
  SET_LOCATION,
  GOT_CRIMES,
} from './constants';

const initialState: any = {
  categories: [],
  visibleCategories: [],
  location: {},
  crimes: [],
};

const reducer = (state = initialState, action: any) => {
  const { type } = action;

  switch(type) {

    case SET_CATEGORIES: {
      const { categories } = action;
      return { ...state, categories, visibleCategories: categories };
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