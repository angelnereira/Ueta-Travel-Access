# Oracle Cloud Infrastructure (OCI) Setup Guide

This guide explains how to configure Oracle Cloud Infrastructure services for the Ueta Travel Access PWA.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Oracle Autonomous Database Setup](#oracle-autonomous-database-setup)
- [Oracle Object Storage Setup](#oracle-object-storage-setup)
- [Environment Configuration](#environment-configuration)
- [Testing the Configuration](#testing-the-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Oracle Cloud Account**
   - Free tier or paid OCI account
   - Access to Oracle Cloud Console: https://cloud.oracle.com

2. **Required Services**
   - Oracle Autonomous Database (ATP or ADW)
   - Oracle Object Storage
   - Oracle Cloud Infrastructure CLI (optional, but recommended)

## Oracle Autonomous Database Setup

### 1. Create Autonomous Database Instance

1. Log in to Oracle Cloud Console
2. Navigate to **Oracle Database** > **Autonomous Database**
3. Click **Create Autonomous Database**
4. Configure the following:
   - **Compartment**: Select your compartment
   - **Display Name**: `ueta-travel-db`
   - **Database Name**: `UETATRAVELDB`
   - **Workload Type**: Transaction Processing (ATP)
   - **Deployment Type**: Shared Infrastructure (for cost savings) or Dedicated
   - **Database Version**: 19c or later
   - **OCPU Count**: 1 (can scale up later)
   - **Storage**: 1 TB (adjust as needed)
   - **Auto Scaling**: Enable for production
5. Set administrator credentials:
   - **Username**: ADMIN (default)
   - **Password**: Choose a strong password (save it securely!)
6. **Network Access**:
   - For development: Allow secure access from everywhere
   - For production: Configure VCN with private endpoint
7. Click **Create Autonomous Database**

### 2. Download Wallet Files

The wallet contains credentials and connection information for secure database access.

1. Once the database is created (status: AVAILABLE), click on the database name
2. Click **DB Connection** button
3. Under **Download Client Credentials (Wallet)**:
   - **Wallet Type**: Instance Wallet
   - Click **Download Wallet**
   - Set a wallet password (remember this!)
   - Save the `Wallet_UETATRAVELDB.zip` file
4. Extract the wallet:
   ```bash
   mkdir -p ~/wallets/ueta-travel-db
   unzip Wallet_UETATRAVELDB.zip -d ~/wallets/ueta-travel-db
   ```

### 3. Get Connection String

1. In the DB Connection dialog, you'll see several connection strings
2. For this application, use the **TLS** connection string (e.g., `uetatraveldb_tp`)
3. The format will be:
   ```
   (description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=xxx.oraclecloud.com))(connect_data=(service_name=xxx_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))
   ```

## Oracle Object Storage Setup

### 1. Create Object Storage Bucket

1. In Oracle Cloud Console, navigate to **Storage** > **Object Storage & Archive Storage** > **Buckets**
2. Click **Create Bucket**
3. Configure:
   - **Bucket Name**: `ueta-travel-images`
   - **Default Storage Tier**: Standard
   - **Encryption**: Encrypt using Oracle-managed keys
   - **Emit Object Events**: Enable (optional, for event-driven processing)
4. Click **Create**

### 2. Configure Bucket Permissions

1. Click on the bucket name `ueta-travel-images`
2. Under **Resources**, click **Visibility**
3. Set to **Public** if you want images to be publicly accessible
   - For private images, keep it private and use Pre-Authenticated Requests (PARs)

### 3. Get Bucket Details

You'll need the following information:

- **Namespace**: Found at the top of the Object Storage page
- **Bucket Name**: `ueta-travel-images`
- **Region**: e.g., `sa-bogota-1`, `us-ashburn-1`, etc.

### 4. Create Folder Structure (Optional)

Using OCI CLI or the web console, create the following folders:
```
products/
avatars/
promotions/
```

## Environment Configuration

### 1. Create `.env.local` File

In your project root, create a `.env.local` file:

```bash
# Oracle Autonomous Database Configuration
DB_USER=ADMIN
DB_PASSWORD=your_database_password_here
DB_CONNECT_STRING=(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=your-host.oraclecloud.com))(connect_data=(service_name=your_service_name))(security=(ssl_server_dn_match=yes)))

# Wallet Configuration
WALLET_LOCATION=/absolute/path/to/your/wallet
WALLET_PASSWORD=your_wallet_password_here

# Oracle Object Storage Configuration
OCI_NAMESPACE=your_oci_namespace
OCI_BUCKET_NAME=ueta-travel-images
OCI_REGION=sa-bogota-1

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Update Values

Replace the placeholders with your actual values:

- `your_database_password_here`: ADMIN password you set during database creation
- `your-host.oraclecloud.com`: Host from your connection string
- `your_service_name`: Service name from your connection string
- `/absolute/path/to/your/wallet`: Full path to extracted wallet folder
- `your_wallet_password_here`: Wallet password you set
- `your_oci_namespace`: Your OCI namespace (from Object Storage)
- `sa-bogota-1`: Your actual region identifier

### 3. Secure Your Environment File

Add to `.gitignore` (already included):
```
.env.local
.env*.local
```

**IMPORTANT**: Never commit `.env.local` to version control!

## Testing the Configuration

### 1. Test Database Connection

```bash
npm run test:db
```

This runs the test script at `scripts/test-db-connection.js`.

**Expected Output:**
```
Successfully connected to Oracle Autonomous Database!
Database version: Oracle Database 19c Enterprise Edition Release 19.0.0.0.0
```

**If connection fails**, check:
- Database is running (status: AVAILABLE in OCI Console)
- Wallet path is correct and files are present
- Connection string is properly formatted
- Firewall/network allows outbound connections on port 1522

### 2. Create Database Schema

```bash
node scripts/execute-ddl.js
```

This creates all required tables.

### 3. Insert Sample Data

```bash
node scripts/insert-sample-data.js
```

### 4. Verify Schema

```bash
node scripts/verify-schema.js
```

### 5. Test Object Storage (Manual)

Create a test upload:
```bash
# Using OCI CLI (if installed)
oci os object put \
  --bucket-name ueta-travel-images \
  --name test/test.txt \
  --file test.txt
```

Or test via the application's upload API endpoint once the app is running.

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit:
- Main app: http://localhost:3000
- API example: http://localhost:3000/api-example

### Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues

**Error: "NJS-516: unable to get a connection from pool"**
- Check if wallet files exist at the specified location
- Verify wallet password is correct
- Ensure `WALLET_LOCATION` is an absolute path

**Error: "ORA-01017: invalid username/password"**
- Verify DB_USER and DB_PASSWORD are correct
- Check if password contains special characters that need escaping

**Error: "NJS-518: network connection closed"**
- Database might be stopped (check status in OCI Console)
- Network connectivity issue (check firewall/VPN)
- Connection string might be incorrect

### Object Storage Issues

**Error: "Bucket not found"**
- Verify OCI_BUCKET_NAME matches exactly
- Check OCI_NAMESPACE is correct
- Ensure bucket exists in the specified region

**Error: "Authorization failed"**
- OCI credentials might be missing or incorrect
- Check OCI CLI configuration if using CLI

### General Tips

1. **Enable Debug Logging**: Set `DEBUG=true` in `.env.local` for detailed logs

2. **Check Wallet Files**: Ensure all these files are in your wallet directory:
   - `cwallet.sso`
   - `tnsnames.ora`
   - `sqlnet.ora`
   - `truststore.jks`
   - `keystore.jks`

3. **Verify OCI Limits**: Free tier has limits on:
   - Database OCPU hours (limited per month)
   - Object Storage (10 GB)
   - Outbound data transfer

4. **Monitor Costs**: Set up budget alerts in OCI Console

## Production Deployment Checklist

- [ ] Use private endpoint for Autonomous Database
- [ ] Configure VCN with security lists
- [ ] Enable database backup
- [ ] Set up monitoring and alerts
- [ ] Configure Object Storage lifecycle policies
- [ ] Enable OCI Web Application Firewall (WAF)
- [ ] Set up API Gateway for rate limiting
- [ ] Configure CORS properly
- [ ] Use environment-specific credentials
- [ ] Enable database connection pooling optimization
- [ ] Set up Oracle APM for performance monitoring
- [ ] Configure Oracle Logging for audit trails

## Additional Resources

- [Oracle Autonomous Database Documentation](https://docs.oracle.com/en/cloud/paas/autonomous-database/)
- [Oracle Object Storage Documentation](https://docs.oracle.com/en-us/iaas/Content/Object/home.htm)
- [node-oracledb Documentation](https://node-oracledb.readthedocs.io/)
- [OCI Free Tier](https://www.oracle.com/cloud/free/)

## Support

For issues related to:
- **OCI Services**: Contact Oracle Cloud Support
- **Application Code**: Open an issue in the project repository
- **node-oracledb**: Check the [GitHub repository](https://github.com/oracle/node-oracledb)

---

Last Updated: November 14, 2025
