// src/components/Signup.js
import React, { useState } from 'react';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null); // Reset any previous error

        try {
            const response = await fetch('http://localhost:5004/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed. Please try again.');
            }

            alert('Signup successful');
            window.location.href = '/login'; // Redirect to the login page after successful signup
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div style={styles.authPage}>
            <div style={styles.authCard}>
                <h2 style={styles.heading}>Sign Up</h2>
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        style={styles.input}
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Sign Up</button>
                </form>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <a href="/login" style={styles.authLink}>
                    Already have an account? Log In
                </a>
            </div>
        </div>
    );
}

const styles = {
    authPage: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f9',
    },
    authCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    heading: {
        marginBottom: '1.5rem',
        fontSize: '1.8rem',
        color: '#333',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    button: {
        padding: '0.75rem',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        width: '100%',
        marginTop: '1rem',
    },
    errorMessage: {
        color: 'red',
        marginTop: '1rem',
    },
    authLink: {
        marginTop: '1rem',
        display: 'block',
        color: '#007BFF',
        textDecoration: 'none',
    },
};

export default Signup;
