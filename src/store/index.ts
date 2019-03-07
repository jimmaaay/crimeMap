import { createStore } from 'redux';
import {
  SET_CATEGORIES,
  REMOVE_CATEGORY,
  ADD_CATEGORY,
} from './constants';

const initialState: any = {
  categories: [],
  visibleCategories: [],
  bbox: [],
};

const reducer = (state = initialState, action: any) => {
  const { type } = action;

  switch(type) {

    case SET_CATEGORIES: {
      const { categories } = action;
      return { ...state, categories, visibleCategories: categories };
    }

    case REMOVE_CATEGORY: {
      const { category } = action;
      const visibleCategories = state.visibleCategories.filter((cat: string) => {
        return cat !== category;
      })
      return { ...state, visibleCategories };
    }

    case ADD_CATEGORY: {
      const { category } = action;
      const visibleCategories = [ ...state.visibleCategories, category];
      return { ...state, visibleCategories };
    }

    default:
      return state;

  }
}

const win: any = window;

export const store = createStore(
  reducer,
  win.__REDUX_DEVTOOLS_EXTENSION__ && win.__REDUX_DEVTOOLS_EXTENSION__(),
);