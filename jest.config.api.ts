import type { Config }
from 'jest' const config: Config = { preset: 'ts-jest', testEnvironment: 'node', moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1', }, transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'preserve', allowJs: true, esModuleInterop: true, skipLibCheck: true, moduleResolution: 'node', resolveJsonModule: true, isolatedModules: true, noEmit: true, strict: true, forceConsistentCasingInFileNames: true, }
}
]}, testMatch: [ '**/
app/api/**/
__tests__/**/*.test.ts', '**/
tests/api-integration/**/*.test.ts' ], setupFilesAfterEnv: ['<rootDir>/jest.setup.api.ts'], moduleDirectories: ['node_modules', '<rootDir>'], globals: { 'ts-jest': { isolatedModules: true }
} }
export default config