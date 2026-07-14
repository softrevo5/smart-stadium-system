import '@testing-library/jest-dom';

// JSDOM environment in Jest does not expose standard Web APIs like Request, Response, and Headers by default.
// Since we are running on Node 22, we can safely copy them from Node's native global scope.
if (typeof global.Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { Request, Response, Headers } = globalThis as any;
  if (Request) {
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
  }
}

// Ensure they are available on the JSDOM window object as well
if (typeof window !== 'undefined') {
  if (!window.Request) {
    Object.defineProperty(window, 'Request', { value: global.Request });
  }
  if (!window.Response) {
    Object.defineProperty(window, 'Response', { value: global.Response });
  }
  if (!window.Headers) {
    Object.defineProperty(window, 'Headers', { value: global.Headers });
  }
  // Mock scrollIntoView which is missing in JSDOM
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}
