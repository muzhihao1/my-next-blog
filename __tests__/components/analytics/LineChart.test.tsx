import React from "react";
import { render } from "@testing-library/react";
import { LineChart } from "@/components/analytics/charts/LineChart";
import { ThemeProvider } from "@/lib/hooks/useTheme";

// Mock canvas context
const mockContext = {
  scale: jest.fn(),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  closePath: jest.fn(),
  arc: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  setLineDash: jest.fn(),
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  measureText: jest.fn(() => ({ width: 100 })),
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);

describe("LineChart", () => {
  const mockData = [
    { x: "1月", y: 100, label: "100次" },
    { x: "2月", y: 150, label: "150次" },
    { x: "3月", y: 120, label: "120次" },
    { x: "4月", y: 200, label: "200次" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(
      HTMLCanvasElement.prototype,
      "getBoundingClientRect",
      {
        value: () => ({
          width: 600,
          height: 300,
          left: 0,
          top: 0,
          right: 600,
          bottom: 300,
        }),
      },
    );
  });

  it("renders without crashing", () => {
    const { container } = render(
      <ThemeProvider>
        <LineChart data={mockData} />
      </ThemeProvider>,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders with title", () => {
    render(
      <ThemeProvider>
        <LineChart data={mockData} title="测试图表" />
      </ThemeProvider>,
    );
    expect(mockContext.fillText).toHaveBeenCalledWith(
      "测试图表",
      expect.any(Number),
      expect.any(Number),
    );
  });

  it("renders axis labels", () => {
    render(
      <ThemeProvider>
        <LineChart data={mockData} xLabel="月份" yLabel="访问量" />
      </ThemeProvider>,
    );
    expect(mockContext.fillText).toHaveBeenCalledWith(
      "月份",
      expect.any(Number),
      expect.any(Number),
    );
    expect(mockContext.fillText).toHaveBeenCalledWith(
      "访问量",
      expect.any(Number),
      expect.any(Number),
    );
  });

  it("draws grid when showGrid is true", () => {
    render(
      <ThemeProvider>
        <LineChart data={mockData} showGrid={true} />
      </ThemeProvider>,
    );
    expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 5]);
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it("draws dots when showDots is true", () => {
    render(
      <ThemeProvider>
        <LineChart data={mockData} showDots={true} />
      </ThemeProvider>,
    );
    expect(mockContext.arc).toHaveBeenCalledTimes(mockData.length);
  });

  it("handles empty data", () => {
    render(
      <ThemeProvider>
        <LineChart data={[]} />
      </ThemeProvider>,
    );
    expect(mockContext.fillText).toHaveBeenCalledWith(
      "暂无数据",
      expect.any(Number),
      expect.any(Number),
    );
  });

  it("applies custom color", () => {
    const customColor = "#FF0000";
    render(
      <ThemeProvider>
        <LineChart data={mockData} color={customColor} />
      </ThemeProvider>,
    );
    expect(mockContext.strokeStyle).toBe(customColor);
  });

  it("formats values with custom formatter", () => {
    const formatY = (value: number) => `¥${value}`;
    render(
      <ThemeProvider>
        <LineChart data={mockData} formatY={formatY} />
      </ThemeProvider>,
    );
    // Check if formatter is applied to Y-axis labels
    expect(mockContext.fillText).toHaveBeenCalledWith(
      expect.stringMatching(/¥\d+/),
      expect.any(Number),
      expect.any(Number),
    );
  });

  it("respects height prop", () => {
    const customHeight = 500;
    const { container } = render(
      <ThemeProvider>
        <LineChart data={mockData} height={customHeight} />
      </ThemeProvider>,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas?.style.height).toBe(`${customHeight}px`);
  });

  it("handles dark theme", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <LineChart data={mockData} />
      </ThemeProvider>,
    );
    // Check if dark theme colors are applied
    expect(mockContext.fillStyle).toMatch(/#[A-F0-9]{6}/i);
  });
});
