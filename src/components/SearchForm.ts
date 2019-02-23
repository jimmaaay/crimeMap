import { LitElement, html } from 'lit-element';
import { isValidSearchRequest, makeRequest } from '../geocoding';
import '../styles/_search-form.scss';

const exampleResponse = require('../geocodingResponse.json');

console.log(exampleResponse);
class SearchForm extends LitElement {

  private errorMessage: string;
  private inputValue: string;
  private timeout: number; // The timeout ID for the search input debouncer
  private suggestions: any[];

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

  render() {
    return html`
      <form class="search-form" @submit="${this.formSubmit}">
        ${this.errorMessage}
        <input type="search" class="search-form__input" @input="${this.searchInput}" value="${this.inputValue}"/>
        <button type="submit" class="search-form__submit">Search</button>
        <ul class="search-form__options">
          ${this.suggestions.map(({ text }) => {
            return html`<li class="search-form__options__item">${text}</li>`;
          })}
        </ul>
      </form>
    `;
  }

}

customElements.define('search-form', SearchForm);