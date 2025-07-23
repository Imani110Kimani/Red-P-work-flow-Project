import React, { useState, useRef, useEffect } from 'react';
import './ConfirmationCode.css';

const CODE_LENGTH = 6;
const EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

interface ConfirmationCodeProps {
  onSuccess: () => void;
  email: string;
  expectedCode: string;
  codeTimestamp: number | null;
  onResend: () => Promise<boolean>;
}

const ConfirmationCode: React.FC<ConfirmationCodeProps> = ({ onSuccess, email, expectedCode, codeTimestamp, onResend }) => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Check if code is expired
  useEffect(() => {
    if (!codeTimestamp) return;

    const checkExpiration = () => {
      const now = Date.now();
      const timeElapsed = now - codeTimestamp;
      if (timeElapsed > EXPIRATION_TIME) {
        setIsExpired(true);
        setError('Verification code has expired. Please request a new code.');
      }
    };

    // Check immediately
    checkExpiration();

    // Set up interval to check expiration
    const interval = setInterval(checkExpiration, 1000);
    
    return () => clearInterval(interval);
  }, [codeTimestamp]);

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9A-Za-z]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value; // Keep original case
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
      setError('Please enter the full 6-character code.');
      return;
    }
    
    // Check if code is expired
    if (isExpired || (codeTimestamp && Date.now() - codeTimestamp > EXPIRATION_TIME)) {
      setError('Verification code has expired. Please request a new code.');
      setIsExpired(true);
      return;
    }
    
    const enteredCode = code.join('');
    if (enteredCode === expectedCode) {
      onSuccess();
    } else {
      setError('Invalid code. Please check your email and try again.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    const success = await onResend();
    if (success) {
      setIsExpired(false);
      setCode(Array(CODE_LENGTH).fill(''));
      setError('New verification code sent!');
    }
    setIsResending(false);
  };

  return (
    <div className="confirmation-code-container">
      <div className="confirmation-card">
        <h2>Email Confirmation</h2>
        <p className="confirmation-instructions">
          Enter the 6-character code sent to {email}.
          <br />
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            This code will expire in 10 minutes.
          </span>
        </p>
        <form onSubmit={handleSubmit} className="confirmation-form">
          <div className="code-inputs">
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="text"
                maxLength={1}
                value={digit}
                ref={el => { inputsRef.current[idx] = el; }}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="code-input"
                autoFocus={idx === 0}
                disabled={isExpired}
                style={{ 
                  opacity: isExpired ? 0.5 : 1,
                  cursor: isExpired ? 'not-allowed' : 'text'
                }}
              />
            ))}
          </div>
          {error && <div className="confirmation-error">{error}</div>}
          <button 
            type="submit" 
            className="confirmation-submit"
            disabled={isExpired}
            style={{ 
              opacity: isExpired ? 0.5 : 1,
              cursor: isExpired ? 'not-allowed' : 'pointer'
            }}
          >
            Verify
          </button>
          <button 
            type="button" 
            className="confirmation-resend"
            onClick={handleResend}
            disabled={isResending}
            style={{
              marginTop: '1rem',
              background: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isResending ? 'not-allowed' : 'pointer',
              opacity: isResending ? 0.7 : 1
            }}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </form>
        <div className="confirmation-hint">
          {!isExpired ? (
            <>Didn't get the code? Check your spam folder or click "Resend Code" above.</>
          ) : (
            <>Code expired after 10 minutes. Click "Resend Code" to get a new one.</>
          )}
        </div>
      </div>
    </div>
  );
};

export { ConfirmationCode };
export default ConfirmationCode;
