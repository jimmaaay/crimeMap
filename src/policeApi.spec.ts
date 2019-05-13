import { splitBoundingBox } from './policeAPI';

describe('splitBoundingBox', () => {

  it('Should return an array as the first child of an array', () => {
    const bbox = [0, 10, 1, 11];
    const result = splitBoundingBox(bbox, 0);
    expect(result).toEqual([bbox]);
  });

});