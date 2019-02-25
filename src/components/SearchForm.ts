import { LitElement, html } from 'lit-element';
import { isValidSearchRequest, makeRequest } from '../geocoding';

const exampleResponse = require('../geocodingResponse.json');

console.log(exampleResponse);
class SearchForm extends LitElement {

  private errorMessage: string;
  private inputValue: string;
  private timeout: number; // The timeout ID for the search input debouncer
  private suggestions: any[];
  
  public events: any;

  static get properties() {
    return { 
      errorMessage: { type: String },
      inputValue: { type: String },
      suggestions: { type: Array },
    };
  }

  constructor() {
    super();
    this.errorMessage = '';
    this.inputValue = '';
    this.suggestions = exampleResponse.features;
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
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <form class="search-form" @submit="${this.formSubmit}">
        ${this.errorMessage}
        <input type="search" class="search-form__input" @input="${this.searchInput}" value="${this.inputValue}"/>
        <button type="submit" class="search-form__submit">Search</button>
        <ul class="search-form__options" @click="${this.optionsClick}">
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