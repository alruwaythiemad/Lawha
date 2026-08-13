import { render } from 'preact';
import { App } from './app';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app mount element');
}

render(<App />, container);
