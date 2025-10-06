#!/bin/bash

# Create pre-commit hook
cat > ../.git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Check if we're in the frontend directory or if frontend files are being committed
if git diff --cached --name-only | grep -q "^frontend/"; then
  echo "Frontend files detected, running pre-commit checks..."
  cd frontend
  npm run pre-commit
  if [ $? -ne 0 ]; then
    echo "Pre-commit checks failed. Please fix the issues and try again."
    exit 1
  fi
  cd ..
fi
EOF

chmod +x ../.git/hooks/pre-commit
echo "Pre-commit hook installed successfully!"