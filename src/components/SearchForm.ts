import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers';
import { isValidSearchRequest } from '../geocoding';
import { store } from '../store';
import {
  setLocation,
  setSearchInput,
  getSearchSuggestions,
  setSelectedFilterDate,
} from '../store/actions';

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

  private selectedMonthYear: any;
  private policeAPILastUpdated: any;

  static get properties() {
    return { 
      errorMessage: { type: String },
      inputValue: { type: String },
      searchSuggestions: { type: Array },
      autocompleteOpen: { type: Boolean },

      policeAPILastUpdated: { type: Object },
      selectedMonthYear: { type: Object },
    };
  }



  static styles = css`
    .search-form__options {
      display: none;
    }

    .search-form__options--open {
      display: block;
    }
  `;

  constructor() {
    super();
    this.errorMessage = '';
    this.autocompleteOpen = false;
  }

  stateChanged(state: any) {
    this.inputValue = state.searchInput;
    this.searchSuggestions = state.searchSuggestions;

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
      <select @change="${this.yearChange}">
        ${validYears.map((year) => {
          return html`
            <option .value="${year}" ?selected=${selectedYear === year}>
              ${year}
            </option>
          `;
        })}
      </select>
      <select @change="${this.monthChange}">
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
    
  }

  searchInput(e: KeyboardEvent) {
    clearTimeout(this.timeout);
    store.dispatch(setSearchInput((e.target as HTMLInputElement).value))

    const value = this.inputValue;

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

    store.dispatch(setLocation(item));
    this.inputValue = item.text;
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

    return html`
      <form class="search-form" @submit="${this.formSubmit}">
        ${this.errorMessage}
        <input 
          type="search" 
          class="search-form__input"
          .value="${this.inputValue}"
          @input="${this.searchInput}"
          @focus=${this.inputFocus}
          @blur="${this.inputBlur}"
        />
        ${/*<button type="submit" class="search-form__submit">Search</button>*/ ''}
        <ul class="${optionsClasses.join(' ')}" @click="${this.optionsClick}">
          ${this.searchSuggestions.map(({ text, id }) => {
            return html`<li
              data-id="${id}"
              class="search-form__options__item">
                ${text}
              </li>`;
          })}
        </ul>
      </form>
      ${monthAndYearFilter}
    `;
  }

}

customElements.define('search-form', SearchForm);