# Deployment Scripts

This directory contains helper scripts for deploying the Maui Lane Care Home application to production.

## Version 59 Deployment

### Prerequisites

Before running the deployment script, ensure you have:

1. **dfx CLI installed and configured**
   ```bash
   dfx --version
   ```

2. **Wallet configured with sufficient cycles**
   ```bash
   dfx wallet balance --network ic
   ```

3. **Frontend build completed successfully**
   ```bash
   cd frontend
   npm run build
   ```

### Running the Deployment Script

From the project root directory:

