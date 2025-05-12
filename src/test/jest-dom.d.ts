
/// <reference types="@testing-library/jest-dom" />

// Type definitions for testing-library__jest-dom
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeVisible(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBeFocused(): R;
      toBeEmpty(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toBeRequired(): R;
      toHaveValue(value?: string | string[] | number): R;
      toHaveStyle(css: string): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
    }
  }
}
