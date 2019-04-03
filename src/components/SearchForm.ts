import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers';
import { isValidSearchRequest } from '../geocoding';
import { store } from '../store';
import {
  setLocation,
  setSearchInput,
  getSearchSuggestions,
} from '../store/actions';

class SearchForm extends connect(store)(LitElement) {

  private errorMessage: string;
  private inputValue: string;
  private timeout: number; // The timeout ID for the search input debouncer
  private searchSuggestions: any[];
  private autocompleteOpen: boolean;
  private autocompleteDisplayTimeout: number;

  static get properties() {
    return { 
      errorMessage: { type: String },
      inputValue: { type: String },
      searchSuggestions: { type: Array },
      autocompleteOpen: { type: Boolean },
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
    `;
  }

}

customElements.define('search-form', SearchForm);