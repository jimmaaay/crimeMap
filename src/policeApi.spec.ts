import { splitBoundingBox } from './policeAPI';

describe('splitBoundingBox', () => {

  it('Should return an array as the first child of an array', () => {
    const bbox = [0, 10, 1, 11];
    const result = splitBoundingBox(bbox, 0);
    expect(result).toEqual(bbox);
  });

  it('Should split the box into 4 quadrants', () => {
    const bbox = [10, -40, 20, -50];
    const result = splitBoundingBox(bbox, 1);
    expect(result).toEqual([
      [10, -40, 15, -45],
      [15, -40, 20, -45],
      [10, -45, 15, -50],
      [15, -45, 20, -50],
    ]);
  });

});