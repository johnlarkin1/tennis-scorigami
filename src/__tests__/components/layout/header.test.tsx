import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/header'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, priority }: { src: string; alt: string; width: number; height: number; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      data-priority={priority}
      data-testid="header-logo"
    />
  ),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}))

describe('Header', () => {
  it('renders the header with correct structure', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('bg-gray-900', 'text-white', 'shadow-md')
  })

  it('renders the logo and title correctly', () => {
    render(<Header />)
    
    const logo = screen.getByTestId('header-logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/favicon/favicon.svg')
    expect(logo).toHaveAttribute('alt', 'Tennis Scorigami Logo')
    expect(logo).toHaveAttribute('width', '40')
    expect(logo).toHaveAttribute('height', '40')

    expect(screen.getByText('Tennis')).toBeInTheDocument()
    expect(screen.getByText('Scorigami')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()

    const exploreLink = screen.getByTestId('link-/explore')
    const aboutLink = screen.getByTestId('link-/about')

    expect(exploreLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    render(<Header />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('flex', 'space-x-6')
  })

  it('logo link points to home page', () => {
    render(<Header />)
    
    const logoLinks = screen.getAllByTestId('link-/')
    expect(logoLinks[0]).toHaveAttribute('href', '/')
  })
})