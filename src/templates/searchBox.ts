import { html } from 'lit-html';
import * as EventEmitter from 'eventemitter3';

const searchBoxTemplate = () => {
  return html`
    <form class="search-box">
      <input type="search" class="search-box__input" />
      <button type="submit">Submit</button>
    </form>
  `;
}

const searchBox = () => {
  const events = new EventEmitter();

  const formSubmit = (e: Event) => {
    const formElement = (e.target as HTMLElement).closest('.search-box');
    if (formElement === null) return;
    e.preventDefault();
    
    const inputElement = formElement.querySelector('.search-box__input') as HTMLInputElement;
    events.emit('searchChange', inputElement.value);
  }


  document.addEventListener('submit', formSubmit);

  return {
    destroy() {},
    template: searchBoxTemplate,
  }
}

export default searchBoxTemplate;