import { render, screen } from '@testing-library/react';

import Footer from '@/components/layout/footer';
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
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  MapPin: () => <div data-testid="map-icon">Map</div>,
  Facebook: () => <div data-testid="facebook-icon">Facebook</div>,
  Instagram: () => <div data-testid="instagram-icon">Instagram</div>,
  Twitter: () => <div data-testid="twitter-icon">Twitter</div>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<QueryProvider>{ui}</QueryProvider>);
};

describe('Footer', () => {
  it('renders footer with all main sections', () => {
    renderWithProviders(<Footer />);

    // Check for company info
    expect(screen.getByText('AutoCare Pro')).toBeInTheDocument();
    expect(screen.getByText(/Your trusted partner/)).toBeInTheDocument();

    // Check for services section
    expect(screen.getByText('Our Services')).toBeInTheDocument();
    expect(screen.getByText('Ceramic Coating')).toBeInTheDocument();
    expect(screen.getByText('Paint Protection Film')).toBeInTheDocument();
    expect(screen.getByText('Window Tinting')).toBeInTheDocument();

    // Check for quick links
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();

    // Check for contact info
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('(408) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('info@autocarepro.com')).toBeInTheDocument();
    expect(screen.getByText(/San Jose/)).toBeInTheDocument();
    expect(screen.getByText(/95125/)).toBeInTheDocument();
  });

  it('displays business hours', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('Business Hours')).toBeInTheDocument();
    expect(screen.getByText('Monday - Friday: 8:00 AM - 6:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Saturday: 9:00 AM - 4:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Sunday: Closed')).toBeInTheDocument();
  });

  it('shows social media icons', () => {
    renderWithProviders(<Footer />);

    // Check for social media icons
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
  });

  it('displays copyright and legal links', () => {
    renderWithProviders(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} AutoCare Pro. All rights reserved.`),
    ).toBeInTheDocument();

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Sitemap')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<Footer />);

    // Check for proper landmark elements
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer landmark

    // Check for proper link accessibility
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // All links should have href attributes
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('service links are properly structured', () => {
    renderWithProviders(<Footer />);

    const serviceLinks = screen.getAllByRole('link');
    const serviceHrefs = serviceLinks.map((link) => link.getAttribute('href'));

    // Check that service links have proper paths
    expect(serviceHrefs).toContain('/services/ceramic-coating');
    expect(serviceHrefs).toContain('/services/ppf');
    expect(serviceHrefs).toContain('/services/window-tint');
  });
});
