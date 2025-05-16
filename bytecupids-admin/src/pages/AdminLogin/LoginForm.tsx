import type React from "react";
import styles from "./LoginForm.module.css"; // Import styles as an object
import { useState } from "react";

const LoginForm : React.FC = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }

    return (
      <div className={styles['form-container']}> {/* Use styles object */}
        <h2 className={styles['form-title']}>Admin Login</h2> {/* Use styles object */}
        <p className={styles['form-subtitle']}>Glad you're back.!</p>

        {/* Rest of the form */}
        <form
          onSubmit={handleSubmit}
          className={styles['form-content']} // Use styles object
          autoComplete="off"
        >
          {/* Existing form elements */}
          <div className={styles['form-group']}> {/* Use styles object */}
            <input
              type="email"
              id="login-email"
              className={styles['form-input']} // Use styles object
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off" // Or "username", "new-email"
            />
          </div>

          <div className={styles['form-group']}> {/* Use styles object */}
            <input
              type="password"
              id="login-password"
              className={styles['form-input']} // Use styles object
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password" // Specifically for password fields
            />
          </div>

          <div className={styles['form-row']}> {/* Use styles object */}
            <div className={styles['checkbox-container']}> {/* Use styles object */}
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
          </div>

          <button type="submit" className={`${styles['form-button']} ${styles['primary-button']}`}> {/* Use styles object and combine classes */}
            Log In
          </button>
        </form>
      </div>
    );
}
export default LoginForm;