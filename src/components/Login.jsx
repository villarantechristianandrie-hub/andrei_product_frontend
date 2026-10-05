import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now Log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <a className="brand brand-light" href="#login"><span className="brand-mark">F</span><span>FIELDWORK<span className="brand-subtitle">PRODUCT REGISTER</span></span></a>
        <div className="intro-copy"><p className="eyebrow">STOCK, IN GOOD ORDER.</p><h1>Know what<br />you have.</h1><p>A considered view of your product catalogue, quantities, and value.</p></div>
        <div className="intro-baseline"><span>INVENTORY SYSTEM</span><span>01 / SECURE ACCESS</span></div>
      </section>
      <section className="auth-panel" id="login">
        <div className="auth-box">
          <p className="eyebrow">ACCOUNT ACCESS</p>
          <h2>{mode === 'login' ? 'Welcome back.' : 'Create an account.'}</h2>
          <p className="auth-description">{mode === 'login' ? 'Sign in to view the product register.' : 'Register to get read-only product access.'}</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <form onSubmit={submit}>
            <label>Username
              <input value={form.username} onChange={set('username')} required autoFocus autoComplete="username" />
            </label>
            {mode === 'register' && (
              <label>Email address
                <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
              </label>
            )}
            <label>Password
              <input type="password" value={form.password} onChange={set('password')} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}<span aria-hidden="true">→</span></button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'New to Fieldwork?' : 'Already have an account?'}{' '}
            <a href="#login" onClick={(e) => { e.preventDefault(); setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </a>
          </p>
        </div>
        <footer className="auth-footnote">Your account is protected with secure sign-in.</footer>
      </section>
    </main>
  );
}
