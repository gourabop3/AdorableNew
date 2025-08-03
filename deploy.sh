#!/bin/bash

# Run database migrations
npx drizzle-kit migrate

# Build the application
npm run build

# Start the production server
npm run start
