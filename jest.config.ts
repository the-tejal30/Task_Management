import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^commoncomponent/(.*)$': '<rootDir>/src/commoncomponent/$1',
    '^store/(.*)$': '<rootDir>/src/store/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^mocks/(.*)$': '<rootDir>/src/mocks/$1',
    '^pages/(.*)$': '<rootDir>/src/app/pages/$1',
    '^icons$': '<rootDir>/src/icons/index.tsx',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.test.json',
    }],
  },
  testMatch: ['**/tests/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/mocks/**',
    '!src/tests/**',
    '!src/**/*.d.ts',
  ],
}

export default config
