import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('<App /> (integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the brand, hero and service cards', () => {
    render(<App />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText(/we can fix it\./i)).toBeInTheDocument();
    expect(screen.getByText('Televisions')).toBeInTheDocument();
    expect(screen.getByText('Washing Machines')).toBeInTheDocument();
  });

  it('renders the contact details', () => {
    render(<App />);
    expect(screen.getByText(/Tech Bazaar, Dhaka 1207/i)).toBeInTheDocument();
    expect(screen.getByText('support@mondalelectronics.com')).toBeInTheDocument();
  });

  it('submits the inquiry form and shows a success message', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    await user.type(screen.getByPlaceholderText('Your name'), 'Rahim');
    await user.type(screen.getByPlaceholderText('+880…'), '+8801700000000');
    await user.type(
      screen.getByPlaceholderText(/TV turns on but no picture/i),
      'No picture, has sound.',
    );
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    await waitFor(() =>
      expect(screen.getByText(/we've received your inquiry/i)).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('shows an error message when the API fails', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'ValidationError' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    await user.type(screen.getByPlaceholderText('Your name'), 'Rahim');
    await user.type(screen.getByPlaceholderText('+880…'), '+8801700000000');
    await user.type(
      screen.getByPlaceholderText(/TV turns on but no picture/i),
      'Broken.',
    );
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    await waitFor(() =>
      expect(screen.getByText(/ValidationError/i)).toBeInTheDocument(),
    );
  });
});
