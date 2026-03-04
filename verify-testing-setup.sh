#!/bin/bash

# Verify testing setup is complete
echo "🔍 Verifying Testing Setup..."
echo ""

# Check backend
echo "Backend Testing Setup:"
if [ -f "backend/jest.config.js" ]; then echo "  ✓ jest.config.js"; else echo "  ✗ jest.config.js"; fi
if [ -f "backend/jest.setup.js" ]; then echo "  ✓ jest.setup.js"; else echo "  ✗ jest.setup.js"; fi
if [ -f "backend/.env.test" ]; then echo "  ✓ .env.test"; else echo "  ✗ .env.test"; fi
if [ -f "backend/src/utils/helpers.test.ts" ]; then echo "  ✓ helpers.test.ts"; else echo "  ✗ helpers.test.ts"; fi
echo ""

# Check frontend
echo "Frontend Testing Setup:"
if [ -f "frontend/jest.config.js" ]; then echo "  ✓ jest.config.js"; else echo "  ✗ jest.config.js"; fi
if [ -f "frontend/jest.setup.js" ]; then echo "  ✓ jest.setup.js"; else echo "  ✗ jest.setup.js"; fi
if [ -f "frontend/src/components/UI.test.tsx" ]; then echo "  ✓ UI.test.tsx"; else echo "  ✗ UI.test.tsx"; fi
echo ""

# Check documentation
echo "Documentation:"
if [ -f "TESTING.md" ]; then echo "  ✓ TESTING.md"; else echo "  ✗ TESTING.md"; fi
if [ -f "TEST_QUICK_START.md" ]; then echo "  ✓ TEST_QUICK_START.md"; else echo "  ✗ TEST_QUICK_START.md"; fi
if [ -f "TESTING_SUMMARY.md" ]; then echo "  ✓ TESTING_SUMMARY.md"; else echo "  ✗ TESTING_SUMMARY.md"; fi
echo ""

# Check backend packages
echo "Backend Packages Installed:"
cd backend 2>/dev/null
if npm list jest > /dev/null 2>&1; then echo "  ✓ jest"; else echo "  ✗ jest"; fi
if npm list ts-jest > /dev/null 2>&1; then echo "  ✓ ts-jest"; else echo "  ✗ ts-jest"; fi
if npm list supertest > /dev/null 2>&1; then echo "  ✓ supertest"; else echo "  ✗ supertest"; fi
cd .. 2>/dev/null
echo ""

# Check frontend packages
echo "Frontend Packages Installed:"
cd frontend 2>/dev/null
if npm list jest > /dev/null 2>&1; then echo "  ✓ jest"; else echo "  ✗ jest"; fi
if npm list @testing-library/react > /dev/null 2>&1; then echo "  ✓ @testing-library/react"; else echo "  ✗ @testing-library/react"; fi
if npm list ts-jest > /dev/null 2>&1; then echo "  ✓ ts-jest"; else echo "  ✗ ts-jest"; fi
cd .. 2>/dev/null
echo ""

echo "✅ Testing setup verification complete!"
echo ""
echo "To run tests:"
echo "  Backend:  cd backend && npm test"
echo "  Frontend: cd frontend && npm test"
