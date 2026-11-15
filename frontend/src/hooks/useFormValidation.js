import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && (!value || String(value).trim() === '')) {
      return rules.requiredMessage || 'This field is required';
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      return rules.minMessage || `Minimum value is ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return rules.maxMessage || `Maximum value is ${rules.max}`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }

    return '';
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setValues(prev => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const error = validateField(name, val);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const err = validateField(key, values[key]);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, validationRules, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    isValid: Object.values(errors).every(e => !e)
  };
};
