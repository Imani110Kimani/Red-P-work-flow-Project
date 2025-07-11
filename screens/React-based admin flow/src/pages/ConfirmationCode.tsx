import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfirmationCode.css';

const CODE_LENGTH = 6;

const ConfirmationCode: React.FC = () => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    setError('');
    if (value && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some((digit) => digit === '')) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    // Here you would verify the code with the backend
    navigate('/dashboard');
  };

  return (
    <div className="confirmation-code-container">
      <div className="confirmation-card">
        <h2>Email Confirmation</h2>
        <p className="confirmation-instructions">
          Enter the 6-digit code sent to your admin email.
        </p>
        <form onSubmit={handleSubmit} className="confirmation-form">
          <div className="code-inputs">
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={el => (inputsRef.current[idx] = el)}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="code-input"
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {error && <div className="confirmation-error">{error}</div>}
          <button type="submit" className="confirmation-submit">Verify</button>
        </form>
        <div className="confirmation-hint">
          Didn’t get the code? Check your spam folder or request a new one.
        </div>
      </div>
    </div>
  );
};

export default ConfirmationCode;
