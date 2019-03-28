import { Store } from 'redux';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

export const watch = (
  store: Store,
  key: string,
  callback: Function,
  options: any = {},
): Function => {
  const areValuesTheSame = (val1: any, val2: any) => {
    if (options.deepCompare === true) return isEqual(val1, val2);
    return val1 === val2;
  };

  let previousValue: any = get(store.getState(), key);
  return store.subscribe(() => {
    const state = store.getState();
    const value = get(state, key);
    if (areValuesTheSame(value, previousValue)) return;
    callback(value, previousValue);
    previousValue = value;
  });
}