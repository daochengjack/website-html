import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      type="button"
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: '1px solid currentColor',
        background: 'transparent',
        cursor: 'pointer'
      }}
      {...props}
    >
      {children}
    </button>
  );
};
