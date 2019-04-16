import { LitElement, html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers';
import { isValidSearchRequest } from '../geocoding';
import { store } from '../store';
import {
  setLocation,
  setSearchInput,
  getSearchSuggestions,
  setSelectedFilterDate,
} from '../store/actions';
import css from './SearchForm.string.scss';

const MIN_YEAR = 2016;
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] ;

class SearchForm extends connect(store)(LitElement) {

  private errorMessage: string;
  private inputValue: string;
  private timeout: number; // The timeout ID for the search input debouncer
  private searchSuggestions: any[];
  private autocompleteOpen: boolean;
  private autocompleteDisplayTimeout: number;

  private selectedLocation: any;

  private selectedMonthYear: any;
  private policeAPILastUpdated: any;
  private loadingCrimeData: boolean;

  static get properties() {
    return { 
      errorMessage: { type: String },
      inputValue: { type: String },
      searchSuggestions: { type: Array },
      autocompleteOpen: { type: Boolean },
      loadingCrimeData: { type: Boolean },
      policeAPILastUpdated: { type: Object },
      selectedMonthYear: { type: Object },
    };
  }

  static styles = unsafeCSS(css.toString());

  constructor() {
    super();
    this.errorMessage = '';
    this.autocompleteOpen = false;
    this.selectedLocation = false;
  }

  stateChanged(state: any) {
    this.inputValue = state.searchInput;
    this.searchSuggestions = state.searchSuggestions;
    this.loadingCrimeData = state.loadingCrimeData;
    this.policeAPILastUpdated = state.policeAPILastUpdated;
    this.selectedMonthYear = state.selectedMonthYear;
  }

  getMonthAndYearFilter() {
    if (this.policeAPILastUpdated === null) return html``;
    const { month, year } = this.policeAPILastUpdated;
    const { month: selectedMonth, year:selectedYear } = this.selectedMonthYear;
    const validYears = Array
      .from(new Array(year - MIN_YEAR + 1))
      .map((ignoreVar, i) => year - i);

    const numberofMonths = year === selectedYear
      ? month + 1
      : 12;

    const validMonths = Array
      .from(new Array(numberofMonths))
      .map((ignoreVar, i) => {
        return MONTH_NAMES[i];
      });

    return html`
      <select class="search-form__year" @change="${this.yearChange}">
        ${validYears.map((year) => {
          return html`
            <option .value="${year}" ?selected=${selectedYear === year}>
              ${year}
            </option>
          `;
        })}
      </select>
      <select class="search-form__month" @change="${this.monthChange}">
        ${validMonths.map((month, i) => {
          return html`
            <option .value="${i}" ?selected=${selectedMonth === month}>
              ${month}
            </option>
          `;
        })}
      </select>
    `;
  }

  yearChange(e: Event) {
    const year = parseInt((e.target as HTMLSelectElement).value);
    store.dispatch(
      setSelectedFilterDate({
        year, 
        month: this.selectedMonthYear.month
      })
    );
  }

  monthChange(e: Event) {
    const month = parseInt((e.target as HTMLSelectElement).value);
    store.dispatch(
      setSelectedFilterDate({
        month, 
        year: this.selectedMonthYear.year
      })
    );
  }


  formSubmit(e: any) {
    e.preventDefault();
    if (this.selectedLocation === false || this.loadingCrimeData) return;
    store.dispatch(setLocation(this.selectedLocation));
  }

  searchInput(e: KeyboardEvent) {
    const value = (e.target as HTMLInputElement).value

    clearTimeout(this.timeout);
    store.dispatch(setSearchInput(value));

    this.selectedLocation = false;
    this.errorMessage = '';

    const validRequest = isValidSearchRequest(value);
    if (validRequest !== true) return this.errorMessage = validRequest;

    this.timeout = window.setTimeout(() => {
      store.dispatch(getSearchSuggestions());
    }, 300);
    
  }

  optionsClick(e: MouseEvent) {
    if (!( e.target instanceof HTMLElement)) return;
    const li = e.target.closest('.search-form__options__item');
    if (li == null) return;
    const { id } = (li as HTMLElement).dataset;
    const item = this.searchSuggestions.find((_) => _.id === id);

    this.selectedLocation = item;
    store.dispatch(setSearchInput(item.text));
  }

  inputFocus() {
    clearTimeout(this.autocompleteDisplayTimeout);
    this.autocompleteOpen = true;
  }

  inputBlur() {
    /**
     * Blur event is fired before the click event in the dropdown is registered
     * so using a horrible setTimeout. Also expected timeout with duration of 0
     * to work, but it didn't 🤷
     */
    this.autocompleteDisplayTimeout = window.setTimeout(() => {
      this.autocompleteOpen = false;
    }, 200);
  }

  render() {
    const monthAndYearFilter = this.getMonthAndYearFilter();
    const optionsClasses = [
      'search-form__options',
      this.autocompleteOpen ? 'search-form__options--open' : '',
    ];

    const className = this.loadingCrimeData
      ? 'search-form search-form--loading'
      : 'search-form'; 

    const searchDisabled = this.selectedLocation === false;

    return html`
      <form class="${className}" @submit="${this.formSubmit}">
        ${this.errorMessage}
        <div class="search-form__search">
        <input 
          type="search" 
          class="search-form__input"
          .value="${this.inputValue}"
          @input="${this.searchInput}"
          @focus=${this.inputFocus}
          @blur="${this.inputBlur}"
        />
          <ul class="${optionsClasses.join(' ')}" @click="${this.optionsClick}">
            ${this.searchSuggestions.map(({ text, id }) => {
              return html`<li
                data-id="${id}"
                class="search-form__options__item">
                  <button class="search-form__options__item__button" type="button">
                    ${text}
                  </button>
                </li>`;
            })}
          </ul>
        </div>

        ${monthAndYearFilter}

        <button type="submit" class="search-form__submit" ?disabled=${searchDisabled}>
          Search
          <div class="search-form__submit__loading"></div>
        </button>
      </form>
    `;
  }

}

customElements.define('search-form', SearchForm);