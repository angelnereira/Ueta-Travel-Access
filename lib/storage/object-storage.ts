/**
 * Oracle Object Storage Service
 * Handles image and file uploads to Oracle Cloud Object Storage
 */

import * as os from 'oci-objectstorage';
import * as common from 'oci-common';

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  publicAccess?: boolean;
}

interface UploadResult {
  url: string;
  objectName: string;
  bucket: string;
}

class ObjectStorageService {
  private client: os.ObjectStorageClient | null = null;
  private namespace: string;
  private bucketName: string;
  private region: string;

  constructor() {
    this.namespace = process.env.OCI_NAMESPACE || '';
    this.bucketName = process.env.OCI_BUCKET_NAME || 'ueta-travel-images';
    this.region = process.env.OCI_REGION || 'sa-bogota-1';
  }

  /**
   * Initialize the Object Storage client
   */
  private async getClient(): Promise<os.ObjectStorageClient> {
    if (this.client) {
      return this.client;
    }

    try {
      // Use Instance Principal authentication (for OCI compute instances)
      // or config file authentication for local development
      const provider = process.env.NODE_ENV === 'production'
        ? await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build()
        : new common.ConfigFileAuthenticationDetailsProvider();

      this.client = new os.ObjectStorageClient({
        authenticationDetailsProvider: provider
      });

      // Set region
      this.client.region = this.region as any;

      console.log('✅ Object Storage client initialized');
      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize Object Storage client:', error);
      throw new Error('Object Storage client initialization failed');
    }
  }

  /**
   * Upload file to Object Storage
   */
  async uploadFile(
    file: Buffer | string,
    objectName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const client = await this.getClient();

      const putObjectRequest: os.requests.PutObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        objectName,
        putObjectBody: file,
        contentType: options.contentType || 'application/octet-stream',
        opcMeta: options.metadata
      };

      await client.putObject(putObjectRequest);

      console.log(`✅ File uploaded: ${objectName}`);

      // Generate public URL
      const url = this.getPublicUrl(objectName);

      return {
        url,
        objectName,
        bucket: this.bucketName
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload image with automatic format detection
   */
  async uploadImage(
    imageBuffer: Buffer,
    fileName: string,
    folder: string = 'products'
  ): Promise<UploadResult> {
    // Detect image type from buffer
    const contentType = this.detectImageType(imageBuffer);

    // Generate unique object name with timestamp
    const timestamp = Date.now();
    const ext = contentType.split('/')[1];
    const objectName = `${folder}/${timestamp}-${fileName}.${ext}`;

    return this.uploadFile(imageBuffer, objectName, {
      contentType,
      metadata: {
        'uploaded-at': new Date().toISOString(),
        'original-name': fileName
      }
    });
  }

  /**
   * Delete file from Object Storage
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      const client = await this.getClient();

      const deleteObjectRequest: os.requests.DeleteObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        objectName
      };

      await client.deleteObject(deleteObjectRequest);

      console.log(`✅ File deleted: ${objectName}`);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get public URL for an object
   */
  getPublicUrl(objectName: string): string {
    // Format: https://objectstorage.{region}.oraclecloud.com/n/{namespace}/b/{bucket}/o/{object}
    return `https://objectstorage.${this.region}.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${encodeURIComponent(objectName)}`;
  }

  /**
   * Get pre-authenticated request (PAR) URL for temporary access
   */
  async createPreAuthenticatedRequest(
    objectName: string,
    expirationHours: number = 24
  ): Promise<string> {
    try {
      const client = await this.getClient();

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + expirationHours);

      const createPreauthenticatedRequestDetails: os.models.CreatePreauthenticatedRequestDetails = {
        name: `temp-access-${Date.now()}`,
        objectName,
        accessType: os.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,
        timeExpires: expirationTime
      };

      const createPARRequest: os.requests.CreatePreauthenticatedRequestRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        createPreauthenticatedRequestDetails
      };

      const response = await client.createPreauthenticatedRequest(createPARRequest);

      // Build full URL
      const parUrl = `https://objectstorage.${this.region}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;

      console.log(`✅ PAR URL created for: ${objectName}`);
      return parUrl;
    } catch (error) {
      console.error('❌ Error creating PAR URL:', error);
      throw error;
    }
  }

  /**
   * List objects in a folder
   */
  async listObjects(prefix: string = ''): Promise<string[]> {
    try {
      const client = await this.getClient();

      const listObjectsRequest: os.requests.ListObjectsRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        prefix
      };

      const response = await client.listObjects(listObjectsRequest);

      return (response.listObjects.objects || []).map(obj => obj.name);
    } catch (error) {
      console.error('❌ Error listing objects:', error);
      throw error;
    }
  }

  /**
   * Detect image type from buffer
   */
  private detectImageType(buffer: Buffer): string {
    // Check magic numbers
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg';
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }

    // Default to JPEG
    return 'image/jpeg';
  }
}

// Export singleton instance
export const objectStorage = new ObjectStorageService();

// Helper functions
export async function uploadProductImage(
  imageBuffer: Buffer,
  productId: string,
  index: number = 0
): Promise<string> {
  const fileName = `product-${productId}-${index}`;
  const result = await objectStorage.uploadImage(imageBuffer, fileName, 'products');
  return result.url;
}

export async function uploadUserAvatar(
  imageBuffer: Buffer,
  userId: string
): Promise<string> {
  const fileName = `avatar-${userId}`;
  const result = await objectStorage.uploadImage(imageBuffer, fileName, 'avatars');
  return result.url;
}

export async function uploadPromotionBanner(
  imageBuffer: Buffer,
  promotionId: string
): Promise<string> {
  const fileName = `banner-${promotionId}`;
  const result = await objectStorage.uploadImage(imageBuffer, fileName, 'promotions');
  return result.url;
}
