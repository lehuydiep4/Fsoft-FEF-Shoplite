// js/register.js
// Registration form validator. Processes input parameters, checks patterns, and displays feedback.

// Elements
const form = document.getElementById('register-form');
const successAlert = document.getElementById('register-success');

// Input Elements
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');
const roleInput = document.getElementById('role');
const termsInput = document.getElementById('terms');

// Error Containers
const errorFullname = document.getElementById('error-fullname');
const errorEmail = document.getElementById('error-email');
const errorPassword = document.getElementById('error-password');
const errorPhone = document.getElementById('error-phone');
const errorRole = document.getElementById('error-role');
const errorTerms = document.getElementById('error-terms');

/**
 * Attaches real-time validation on input focus/blur.
 */
function setupInputListeners() {
  const inputs = [
    { el: fullnameInput, err: errorFullname, check: validateFullname },
    { el: emailInput, err: errorEmail, check: validateEmail },
    { el: passwordInput, err: errorPassword, check: validatePassword },
    { el: phoneInput, err: errorPhone, check: validatePhone },
    { el: roleInput, err: errorRole, check: validateRole },
    { el: termsInput, err: errorTerms, check: validateTerms }
  ];

  inputs.forEach(({ el, err, check }) => {
    if (!el) return;
    
    // Clear styling on input focus
    el.addEventListener('focus', () => {
      clearFieldError(el, err);
    });

    // Validate on input blur
    el.addEventListener('blur', () => {
      check();
    });

    // Handle checkboxes/selects change
    if (el.tagName === 'SELECT' || el.type === 'checkbox') {
      el.addEventListener('change', () => {
        check();
      });
    }
  });
}

/**
 * Shows an error message under an input field and adds red borders.
 */
function showFieldError(el, errContainer, message) {
  if (!el || !errContainer) return;
  errContainer.textContent = message;
  errContainer.classList.remove('hidden');
  
  if (el.type !== 'checkbox') {
    el.classList.remove('border-slate-200', 'focus:border-indigo-500', 'focus:ring-indigo-100');
    el.classList.add('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-100');
  }
}

/**
 * Removes errors from an input field.
 */
function clearFieldError(el, errContainer) {
  if (!el || !errContainer) return;
  errContainer.classList.add('hidden');
  errContainer.textContent = '';
  
  if (el.type !== 'checkbox') {
    el.classList.remove('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-100');
    el.classList.add('border-slate-200', 'focus:border-indigo-500', 'focus:ring-indigo-100');
  }
}

// Validation Functions
function validateFullname() {
  const value = fullnameInput.value.trim();
  if (!value) {
    showFieldError(fullnameInput, errorFullname, "Full Name is required.");
    return false;
  }
  if (value.length < 2) {
    showFieldError(fullnameInput, errorFullname, "Full Name must be at least 2 characters.");
    return false;
  }
  clearFieldError(fullnameInput, errorFullname);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!value) {
    showFieldError(emailInput, errorEmail, "Email Address is required.");
    return false;
  }
  if (!emailRegex.test(value)) {
    showFieldError(emailInput, errorEmail, "Please enter a valid email address.");
    return false;
  }
  clearFieldError(emailInput, errorEmail);
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (!value) {
    showFieldError(passwordInput, errorPassword, "Password is required.");
    return false;
  }
  if (value.length < 6) {
    showFieldError(passwordInput, errorPassword, "Password must be at least 6 characters.");
    return false;
  }
  clearFieldError(passwordInput, errorPassword);
  return true;
}

function validatePhone() {
  const value = phoneInput.value.trim();
  // Validates standard 10-digit formats (can start with +84, 0, etc.)
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

  if (!value) {
    showFieldError(phoneInput, errorPhone, "Phone Number is required.");
    return false;
  }
  if (!phoneRegex.test(value)) {
    showFieldError(phoneInput, errorPhone, "Please enter a valid Vietnamese phone number (e.g. 0912345678).");
    return false;
  }
  clearFieldError(phoneInput, errorPhone);
  return true;
}

function validateRole() {
  const value = roleInput.value;
  if (!value) {
    showFieldError(roleInput, errorRole, "Please select an account role.");
    return false;
  }
  clearFieldError(roleInput, errorRole);
  return true;
}

function validateTerms() {
  if (!termsInput.checked) {
    showFieldError(termsInput, errorTerms, "You must agree to the Terms of Service.");
    return false;
  }
  clearFieldError(termsInput, errorTerms);
  return true;
}

// Form Submission Event
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Trigger validation on all fields
    const isFullnameValid = validateFullname();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPhoneValid = validatePhone();
    const isRoleValid = validateRole();
    const isTermsValid = validateTerms();

    const isFormValid = isFullnameValid && 
                        isEmailValid && 
                        isPasswordValid && 
                        isPhoneValid && 
                        isRoleValid && 
                        isTermsValid;

    if (isFormValid) {
      // Hide form and show success visual
      form.classList.add('hidden');
      if (successAlert) {
        successAlert.classList.remove('hidden');
      }
      form.reset();
    }
  });

  // Attach dynamic real-time validation handlers
  setupInputListeners();
}
