import { useState, type FormEvent } from 'react';
import type { AxiosError } from 'axios';

import { useLogin, useRegister } from './features/CanvasEditor/hooks/useCanvasData';
import { CanvasEditor } from './features/CanvasEditor/components/CanvasEditor';
import { getAuthToken, setAuthToken } from './services/api';

const USER_EMAIL_KEY = 'workflow-canvas-user-email';

const getMutationErrorMessage = (error: unknown) => {
	const axiosError = error as AxiosError<{ message?: string }>;
	return axiosError?.response?.data?.message || axiosError?.message || null;
};

function AuthScreen({
	onAuthenticated
}: {
	onAuthenticated: (token: string, email: string) => void;
}) {
	const [mode, setMode] = useState<'login' | 'register'>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const loginMutation = useLogin();
	const registerMutation = useRegister();

	const busy = loginMutation.isPending || registerMutation.isPending;
	const error = getMutationErrorMessage(loginMutation.error) || getMutationErrorMessage(registerMutation.error);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const payload = { email: email.trim(), password };
		if (!payload.email || !payload.password) {
			return;
		}

		const result = mode === 'register'
			? await registerMutation.mutateAsync(payload)
			: await loginMutation.mutateAsync(payload);

		onAuthenticated(result.token, result.user.email);
	};

	return (
		<main className="auth-shell">
			<section className="auth-card">
				<p className="eyebrow">Secure Workspace</p>
				<h1>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
				<p className="subtitle">Each account sees only its own saved architectures.</p>
				<form className="auth-form" onSubmit={handleSubmit}>
					<label>
						<span>Email</span>
						<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
					</label>
					<label>
						<span>Password</span>
						<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
					</label>
					<button type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register'}</button>
				</form>
				{error ? <p className="error-message">{error}</p> : null}
				<button
					className="auth-switch"
					type="button"
					onClick={() => setMode((value) => value === 'login' ? 'register' : 'login')}
				>
					{mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
				</button>
			</section>
		</main>
	);
}

function App() {
	const [token, setToken] = useState<string | null>(() => getAuthToken());
	const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem(USER_EMAIL_KEY) || '');

	const handleAuthenticated = (nextToken: string, email: string) => {
		setAuthToken(nextToken);
		localStorage.setItem(USER_EMAIL_KEY, email);
		setUserEmail(email);
		setToken(nextToken);
	};

	const handleLogout = () => {
		setAuthToken(null);
		localStorage.removeItem(USER_EMAIL_KEY);
		setUserEmail('');
		setToken(null);
	};

	if (!token) {
		return <AuthScreen onAuthenticated={handleAuthenticated} />;
	}

	return (
		<main className="app-shell">
			<header className="app-header">
				<p className="eyebrow">MERN + Zustand + TanStack Query</p>
				<h1>Interactive Workflow Canvas</h1>
				<p className="subtitle">
					Build editable node architectures, attach small images, and switch across saved workflows.
				</p>
				<div className="session-strip">
					<span>{userEmail || 'Signed in'}</span>
					<button type="button" onClick={handleLogout}>Logout</button>
				</div>
			</header>
			<CanvasEditor />
		</main>
	);
}

export default App;
