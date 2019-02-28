import { LitElement, html, css } from 'lit-element';
import { isValidSearchRequest, makeRequest } from '../geocoding';

const exampleResponse = require('../geocodingResponse.json');

console.log(exampleResponse);
class SearchForm extends LitElement {

  private errorMessage: string;
  private inputValue: string;
  private timeout: number; // The timeout ID for the search input debouncer
  private suggestions: any[];
  private autocompleteOpen: boolean;

  private autocompleteDisplayTimeout: number;
  
  public events: any;

  static get properties() {
    return { 
      errorMessage: { type: String },
      inputValue: { type: String },
      suggestions: { type: Array },
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
    this.inputValue = '';
    this.suggestions = exampleResponse.features;
    this.autocompleteOpen = false;
  }


  formSubmit(e: any) {
    e.preventDefault();
    
  }

  searchInput(e: KeyboardEvent) {
    clearTimeout(this.timeout);
    this.inputValue = (e.target as HTMLInputElement).value;

    const value = this.inputValue;

    this.errorMessage = '';
    this.suggestions = [];

    const validRequest = isValidSearchRequest(value);
    if (validRequest !== true) return this.errorMessage = validRequest;

    this.timeout = window.setTimeout(() => {
      makeRequest(value)
      .then((res) => {
        this.suggestions = res.features;
      })
      .catch(console.log)
    }, 300);
    
  }

  optionsClick(e: MouseEvent) {
    if (!( e.target instanceof HTMLElement)) return;
    const li = e.target.closest('.search-form__options__item');
    if (li == null) return;
    const { id } = (li as HTMLElement).dataset;
    const item = this.suggestions.find((_) => _.id === id);
    const event = new CustomEvent('searchForm:selected', { detail: item });

    this.inputValue = item.text;
    this.dispatchEvent(event);
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
          value="${this.inputValue}"
          @input="${this.searchInput}"
          @focus=${this.inputFocus}
          @blur="${this.inputBlur}"
        />
        ${/*<button type="submit" class="search-form__submit">Search</button>*/ ''}
        <ul class="${optionsClasses.join(' ')}" @click="${this.optionsClick}">
          ${this.suggestions.map(({ text, id }) => {
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