#!/bin/bash

# Test runner script for WunPub Social Pilot
# Usage: ./scripts/test.sh [command]

set -e

case "${1:-help}" in
  "all")
    echo "🧪 Running all tests..."
    npm run test:run
    ;;
  "watch")
    echo "👀 Running tests in watch mode..."
    npm run test:watch
    ;;
  "coverage")
    echo "📊 Running tests with coverage..."
    npm run coverage
    ;;
  "ci")
    echo "🚀 Running CI tests..."
    npm run test:ci
    ;;
  "lint")
    echo "🔍 Running linter..."
    npm run lint
    ;;
  "typecheck")
    echo "🔧 Running type check..."
    npx tsc --noEmit
    ;;
  "full")
    echo "🏁 Running full test suite..."
    npm run lint
    npx tsc --noEmit
    npm run test:ci
    ;;
  "help"|*)
    echo "Test runner for WunPub Social Pilot"
    echo ""
    echo "Usage: ./scripts/test.sh [command]"
    echo ""
    echo "Commands:"
    echo "  all        Run all tests once"
    echo "  watch      Run tests in watch mode"
    echo "  coverage   Run tests with coverage report"
    echo "  ci         Run CI tests with verbose output"
    echo "  lint       Run ESLint"
    echo "  typecheck  Run TypeScript compiler check"
    echo "  full       Run complete test suite (lint + typecheck + tests)"
    echo "  help       Show this help message"
    ;;
esac