import { renderToString } from 'react-dom/server';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders the login page at the root route when unauthenticated', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  try {
    const html = renderToString(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    expect(html.includes('Login')).toBe(true);
  } finally {
    errorSpy.mockRestore();
  }
});
