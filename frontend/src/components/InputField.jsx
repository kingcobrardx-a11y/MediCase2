import React from 'react';

/**
 * Reusable InputField Component
 * Renders text inputs, textareas, or select dropdowns with label, helper hints, and errors.
 */
export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  options = [],
  hint = '',
  error = '',
  rows = 4,
  disabled = false,
  className = '',
  id,
  ...rest
}) {
  const inputId = id || `field-${name}`;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          disabled={disabled}
          className="form-textarea"
          {...rest}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="form-select"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="form-input"
          {...rest}
        />
      )}

      {hint && !error && <small className="form-hint">{hint}</small>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
