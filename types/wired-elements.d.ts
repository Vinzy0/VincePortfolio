import type { HTMLAttributes, DetailedHTMLProps } from "react";

type WiredBaseProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wired-button": WiredBaseProps & {
        elevation?: number;
        disabled?: boolean;
      };
      "wired-input": WiredBaseProps & {
        placeholder?: string;
        value?: string;
        disabled?: boolean;
        type?: string;
      };
      "wired-textarea": WiredBaseProps & {
        placeholder?: string;
        value?: string;
        disabled?: boolean;
        rows?: number;
        cols?: number;
      };
      "wired-card": WiredBaseProps & {
        elevation?: number;
      };
      "wired-divider": WiredBaseProps;
      "wired-spinner": WiredBaseProps & {
        spinning?: boolean;
        duration?: number;
      };
    }
  }
}
