const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 指向 Next.js 應用的路徑
  dir: './',
})

// Jest 的自定義配置
const customJestConfig = {
  // 添加更多自定義配置
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // 處理模塊別名
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
}

// createJestConfig 會自動處理一些配置，如 Next.js 的轉換器
module.exports = createJestConfig(customJestConfig)
