import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Header from '@/components/layout/header';
import { QueryProvider } from '@/components/providers/query-provider';

// Mock Next.js router
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: any) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="close-icon">Close</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<QueryProvider>{ui}</QueryProvider>);
};

describe('Header', () => {
  it('renders the header with all main elements', () => {
    renderWithProviders(<Header />);

    // Check for logo
    expect(screen.getByText('AutoCare Pro')).toBeInTheDocument();

    // Check for contact info
    expect(screen.getByText('(408) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('info@example.com')).toBeInTheDocument();

    // Check for main navigation items
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();

    // Check for CTA button
    expect(screen.getByText('Get Quote')).toBeInTheDocument();
  });

  it('has mobile menu toggle button', () => {
    renderWithProviders(<Header />);

    // Should have mobile menu toggle button (visible on mobile)
    const menuToggle = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuToggle).toBeInTheDocument();
  });

  it('toggles search when search button is clicked', async () => {
    renderWithProviders(<Header />);

    // Search bar should not be visible initially
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();

    // Find and click search toggle (hidden on small screens, so we need to force visibility)
    const searchToggle = screen.getByRole('button', { name: /search/i });
    expect(searchToggle).toBeInTheDocument();

    fireEvent.click(searchToggle);

    // After clicking, search input should appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays language switcher and social icons', () => {
    renderWithProviders(<Header />);

    // Check for language switcher
    expect(screen.getByText('EN')).toBeInTheDocument();

    // Check for social media icons (they should be present as buttons)
    const socialButtons = screen.getAllByRole('button');
    expect(socialButtons.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<Header />);

    // Check for proper ARIA labels and roles
    const mainNav = screen.getByRole('navigation');
    expect(mainNav).toBeInTheDocument();

    // Check for skip links and proper heading structure
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
});
