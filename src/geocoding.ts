import { GeocodingResponse } from '@/types';

export const makeRequest = (search: string): Promise<GeocodingResponse> => {
  const endpoint = getRequestEndpoint(search);
  if (endpoint === false) return Promise.reject('Invalid search request');

  return fetch(endpoint)
    .then(_ => _.json())
    .then(data => data);
}

export const getRequestEndpoint = (search: string) => {
  if (isValidSearchRequest(search) !== true) {
    console.warn('Invalid search request');
    return false;
  }

  const searchParams = new URLSearchParams({
    country: 'GB',
    types: 'region,postcode,district,locality,neighborhood',
    access_token: process.env.MAPBOX_ACCESS_TOKEN,
  })
  const endpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
  const encodedSearch = encodeURIComponent(search);
  return `${endpoint}${encodedSearch}.json?${searchParams.toString()}`;
}

/**
 * From mapbox docs
 * @see https://docs.mapbox.com/api/search/#forward-geocoding
 * 
 * The search text should be expressed as a URL-encoded UTF-8 string, and must 
 * not contain the semicolon character (either raw or URL-encoded). Your search 
 * text, once decoded, must consist of at most 20 words and numbers separated by
 * spacing and punctuation, and at most 256 characters.
 */
export const isValidSearchRequest = (search: string): string | true => {
  // In theory someone could try putting an encoded string to try and break stuff
  const searchString = decodeURIComponent(search);

  if (searchString.includes(';')) return 'Cannot have semicolons in the search';
  if (searchString.length > 256) return 'There is a max character limit of 256';

  // word checking
  const words = searchString
    .split(/\s*\b\s*/)
    .filter((possibleWord) => !/[,.!?;:]/.test(possibleWord));

  if (words.length > 20) return 'There is a max of 20 words';

  return true;
}