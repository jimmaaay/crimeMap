export interface State {
  categories: {
    [categoryName: string]: {
      /**
       * The colour to show the marker
       */
      markerColour: string;
      /**
       * The total number of crimes for that category
       */
      total: number;
    };
  };
  categoryNames: string[];
  visibleCategories: string[];
  location: null | MapboxPlace;
  crimes: any[];
  policeAPILastUpdated: null | { month: number; year: number; };
  loadingCrimeData: boolean;
  selectedMonthYear: null | { month: number; year: number; };
  searchInput: string;
  searchSuggestions: any[];
};

export interface MapboxPlace {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  address?: string;
  properties: any;
  text: string;
  place_name: string;
  matching_text?: string;
  matching_place_name?: string;
  language?: string;
  bbox: number[];
  center: number[];
  geometry: {
    type: string;
    coordinates: number[];
    interpolated?: any;
    omitted?: any;
  };
  context: any[];
  routable_points?: any;
};

export interface GeocodingResponse {
  type: string;
  query: any[];
  features: MapboxPlace[];
  attribution: string;
};