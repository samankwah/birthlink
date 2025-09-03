import React, { forwardRef } from 'react';
import { Input, Select } from '../atoms';
import type { FormFieldProps } from '../../types';

interface FormFieldExtendedProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'date' | 'tel' | 'select';
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
  placeholder?: string;
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLSelectElement, 
  FormFieldExtendedProps
>(({ type = 'text', options, helperText, placeholder, ...props }, ref) => {
  if (type === 'select' && options) {
    return (
      <Select
        ref={ref as React.RefObject<HTMLSelectElement>}
        label={props.label}
        error={props.error}
        helperText={helperText}
        required={props.required}
        disabled={props.disabled}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        options={options}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Input
      ref={ref as React.RefObject<HTMLInputElement>}
      type={type}
      label={props.label}
      error={props.error}
      helperText={helperText}
      required={props.required}
      disabled={props.disabled}
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      placeholder={placeholder}
    />
  );
});

FormField.displayName = 'FormField';