import { render, screen, fireEvent }
from "@testing-library/react";
import { ThemeToggle }
from "../ThemeToggle";
import { useTheme }
from "@/lib/hooks/useTheme";
// Mock the useTheme hook jest.mock('@/lib/hooks/useTheme') const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme> describe('ThemeToggle', () => { const mockToggleTheme = jest.fn() beforeEach(() => { jest.clearAllMocks() })
it('renders placeholder when not mounted', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: false, }) const { container } = render(<ThemeToggle />) // Should render a placeholder div const placeholder = container.querySelector('.w-9.h-9') expect(placeholder).toBeInTheDocument() // Should not render button const button = screen.queryByRole('button') expect(button).not.toBeInTheDocument() })
it('renders moon icon when theme is light', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const button = screen.getByRole('button') expect(button).toBeInTheDocument() expect(button).toHaveAttribute('aria-label', '切换到深色模式') // Check for moon icon path const svg = button.querySelector('svg') expect(svg).toBeInTheDocument() const path = svg?.querySelector('path') expect(path).toHaveAttribute('d', expect.stringContaining('M20.354 15.354A9 9')) })
it('renders sun icon when theme is dark', () => { mockUseTheme.mockReturnValue({ theme: 'dark', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const button = screen.getByRole('button') expect(button).toBeInTheDocument() expect(button).toHaveAttribute('aria-label', '切换到浅色模式') // Check for sun icon path const svg = button.querySelector('svg') expect(svg).toBeInTheDocument() const path = svg?.querySelector('path') expect(path).toHaveAttribute('d', expect.stringContaining('M12 3v1m0 16v1')) })
it('calls toggleTheme when button is clicked', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const button = screen.getByRole('button') fireEvent.click(button) expect(mockToggleTheme).toHaveBeenCalledTimes(1) })
it('has correct hover styles', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const button = screen.getByRole('button') expect(button).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800') })
it('has transition classes for smooth animations', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const button = screen.getByRole('button') expect(button).toHaveClass('transition-colors', 'duration-200') })
it('svg icons have correct size classes', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const svg = screen.getByRole('button').querySelector('svg') expect(svg).toHaveClass('w-5', 'h-5') })
it('handles multiple clicks correctly', () => { mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) render(<ThemeToggle />
)
const button = screen.getByRole('button') // Click multiple times fireEvent.click(button) fireEvent.click(button) fireEvent.click(button) expect(mockToggleTheme).toHaveBeenCalledTimes(3) })
it('updates aria-label when theme changes', () => { const { rerender } = render(<ThemeToggle />) // Start with light theme mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme, mounted: true, }) rerender(<ThemeToggle />
)
let button = screen.getByRole('button') expect(button).toHaveAttribute('aria-label', '切换到深色模式') // Change to dark theme mockUseTheme.mockReturnValue({ theme: 'dark', toggleTheme: mockToggleTheme, mounted: true, }) rerender(<ThemeToggle />) button = screen.getByRole('button') expect(button).toHaveAttribute('aria-label', '切换到浅色模式') }) })
