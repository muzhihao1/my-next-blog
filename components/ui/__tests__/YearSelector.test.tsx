import { render, screen, fireEvent }
from "@testing-library/react";
import YearSelector from "../YearSelector";
// Get the mocked router from jest.setup.ts const mockPush = jest.fn() // Override the mock from jest.setup.ts jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn(), refresh: jest.fn(), back: jest.fn(), forward: jest.fn(), prefetch: jest.fn(), }), usePathname: () => '', useSearchParams: () => new URLSearchParams(), })) describe('YearSelector', () => { beforeEach(() => { jest.clearAllMocks() // Mock current date to ensure consistent tests jest.useFakeTimers() jest.setSystemTime(new Date('2024-01-01')) })
afterEach(() => { jest.useRealTimers() })
it('renders with current year selected', () => { render(<YearSelector currentYear={2024}
/>
)
const select = screen.getByRole('combobox') expect(select).toHaveValue('2024') expect(screen.getByText('2024 年')).toBeInTheDocument() })
it('generates years from 2023 to current year when availableYears not provided', () => { render(<YearSelector currentYear={2024}
/>
)
const options = screen.getAllByRole('option') expect(options).toHaveLength(2) // 2024 and 2023 expect(screen.getByText('2024 年')).toBeInTheDocument() expect(screen.getByText('2023 年')).toBeInTheDocument() })
it('uses custom availableYears when provided', () => { render(<YearSelector currentYear={2022}
availableYears={[2022, 2021, 2020]
}
/>
)
const options = screen.getAllByRole('option') expect(options).toHaveLength(3) expect(screen.getByText('2022 年')).toBeInTheDocument() expect(screen.getByText('2021 年')).toBeInTheDocument() expect(screen.getByText('2020 年')).toBeInTheDocument() })
it('navigates to selected year when dropdown changes', () => { render(<YearSelector currentYear={2024}
/>
)
const select = screen.getByRole('combobox') fireEvent.change(select, { target: { value: '2023' }
}) expect(mockPush).toHaveBeenCalledWith('/year-in-review?year=2023') })
it('does not navigate when selecting current year', () => { render(<YearSelector currentYear={2024}
/>
)
const select = screen.getByRole('combobox') fireEvent.change(select, { target: { value: '2024' }
}) expect(mockPush).not.toHaveBeenCalled() })
it('navigates to previous year when prev button clicked', () => { render(<YearSelector currentYear={2024}
/>
)
const prevButton = screen.getByRole('button', { name: '上一年' }) fireEvent.click(prevButton) expect(mockPush).toHaveBeenCalledWith('/year-in-review?year=2023') })
it('navigates to next year when next button clicked', () => { render(<YearSelector currentYear={2023}
/>
)
const nextButton = screen.getByRole('button', { name: '下一年' }) fireEvent.click(nextButton) expect(mockPush).toHaveBeenCalledWith('/year-in-review?year=2024') })
it('disables prev button when at start year (2023)', () => { render(<YearSelector currentYear={2023}
/>
)
const prevButton = screen.getByRole('button', { name: '上一年' }) expect(prevButton).toBeDisabled() expect(prevButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed') })
it('disables next button when at current year', () => { render(<YearSelector currentYear={2024}
/>
)
const nextButton = screen.getByRole('button', { name: '下一年' }) expect(nextButton).toBeDisabled() expect(nextButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed') })
it('does not navigate when clicking disabled buttons', () => { render(<YearSelector currentYear={2023}
/>
)
const prevButton = screen.getByRole('button', { name: '上一年' }) fireEvent.click(prevButton) expect(mockPush).not.toHaveBeenCalled() })
it('renders navigation icons correctly', () => { render(<YearSelector currentYear={2024}
/>
)
const prevButton = screen.getByRole('button', { name: '上一年' }) const nextButton = screen.getByRole('button', { name: '下一年' }) const prevIcon = prevButton.querySelector('svg') const nextIcon = nextButton.querySelector('svg') expect(prevIcon).toBeInTheDocument() expect(nextIcon).toBeInTheDocument() expect(prevIcon).toHaveClass('w-5', 'h-5') expect(nextIcon).toHaveClass('w-5', 'h-5') })
it('applies correct styling classes', () => { const { container } = render(<YearSelector currentYear={2024}
/>
)
const wrapper = container.firstChild expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'gap-2', 'mb-8') const select = screen.getByRole('combobox') expect(select).toHaveClass( 'px-4', 'py-2', 'bg-white', "", 'border', 'border-gray-300', "", 'rounded-lg' ) })
it('handles year boundary correctly', () => { // Test with a future year jest.setSystemTime(new Date('2025-12-31')) render(<YearSelector currentYear={2025}
/>
)
const options = screen.getAllByRole('option') expect(options).toHaveLength(3) // 2025, 2024, 2023 const nextButton = screen.getByRole('button', { name: '下一年' }) expect(nextButton).toBeDisabled() })
it('converts string year to number when navigating', () => { render(<YearSelector currentYear={2024}
/>
)
const select = screen.getByRole('combobox') fireEvent.change(select, { target: { value: '2023' }
}) // Verify it passes a number, not a string expect(mockPush).toHaveBeenCalledWith('/year-in-review?year=2023') const calledUrl = mockPush.mock.calls[0][0]
expect(calledUrl).toBe('/year-in-review?year=2023') })
it('maintains hover states on buttons', () => { render(<YearSelector currentYear={2024}
/>
)
const prevButton = screen.getByRole('button', { name: '上一年' }) const nextButton = screen.getByRole('button', { name: '下一年' }) expect(prevButton).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800') expect(nextButton).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800') }) })
