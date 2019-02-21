import { LitElement, html } from 'lit-element';
import { isValidSearchRequest, makeRequest } from '../geocoding';

class SearchForm extends LitElement {

  private errorMessage: string;
  private inputValue: string;

  static get properties() {
    return { 
      errorMessage: { type: String },
      inputValue: { type: String },
    };
  }

  constructor() {
    super();
    this.errorMessage = '';
    this.inputValue = '';
  }


  formSubmit(e: any) {
    e.preventDefault();

    const value = this.inputValue;

    this.errorMessage = '';

    const validRequest = isValidSearchRequest(value);
    if (validRequest !== true) this.errorMessage = validRequest;

    makeRequest(value)
      .then((res) => {
        console.log(res);
      })
      .catch(console.log)
    
  }

  searchInput(e: KeyboardEvent) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  render() {
    return html`
      <form class="search-form" @submit="${this.formSubmit}">
        ${this.errorMessage}
        <input type="search" class="search-form__input" @input="${this.searchInput}" value="${this.inputValue}"/>
        <button type="submit" class="search-form__submit">Search</button>
        <div class="search-form__options"></div>
      </form>
    `;
  }

}

customElements.define('search-form', SearchForm);