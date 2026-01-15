import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { randomUUID } from "crypto";

const PROFILE_IMAGE_SIZE = 200;
const APP_BLOCK_ICON_SIZE = 300;

// DigitalOcean Spaces configuration from environment variables
const DO_SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const DO_SPACES_KEY = process.env.DO_SPACES_KEY;
const DO_SPACES_SECRET = process.env.DO_SPACES_SECRET;
const DO_SPACES_BUCKET = process.env.DO_SPACES_BUCKET;
const DO_SPACES_REGION = process.env.DO_SPACES_REGION || "nyc3";
const DO_SPACES_CDN_URL = process.env.DO_SPACES_CDN_URL; // Optional CDN URL

// Initialize S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: DO_SPACES_ENDPOINT,
  region: DO_SPACES_REGION,
  credentials: {
    accessKeyId: DO_SPACES_KEY || "",
    secretAccessKey: DO_SPACES_SECRET || "",
  },
  forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted-style
});

/**
 * Validates, processes, and uploads a base64 encoded image to DigitalOcean Spaces.
 * The image will be resized to exactly 200x200px before upload.
 * 
 * @param base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param userId - Optional user ID to include in the filename
 * @returns Promise<string> - Public URL of the uploaded image
 * @throws Error if the image cannot be processed or uploaded
 */
export async function uploadProfileImageToDO(
  base64Image: string,
  userId?: string
): Promise<string> {
  if (!base64Image) {
    throw new Error("Profile image is required");
  }

  // Validate environment variables
  if (!DO_SPACES_ENDPOINT || !DO_SPACES_KEY || !DO_SPACES_SECRET || !DO_SPACES_BUCKET) {
    throw new Error(
      "DigitalOcean Spaces configuration is missing. Please set DO_SPACES_ENDPOINT, DO_SPACES_KEY, DO_SPACES_SECRET, and DO_SPACES_BUCKET environment variables."
    );
  }

  // Remove data URI prefix if present (e.g., "data:image/png;base64,")
  const base64Data = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  // Decode base64 to buffer
  let imageBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(base64Data, "base64");
  } catch {
    throw new Error("Invalid base64 encoded image");
  }

  // Process image with sharp to ensure 200x200px
  let processedImage: Buffer;
  try {
    processedImage = await sharp(imageBuffer)
      .resize(PROFILE_IMAGE_SIZE, PROFILE_IMAGE_SIZE, {
        fit: "cover",
        position: "center",
      })
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Generate unique filename
  const filename = userId
    ? `profile-pictures/${userId}-${randomUUID()}.png`
    : `profile-pictures/${randomUUID()}.png`;

  // Upload to DigitalOcean Spaces
  try {
    const command = new PutObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: filename,
      Body: processedImage,
      ContentType: "image/png",
      ACL: "public-read", // Make the image publicly accessible
    });

    await s3Client.send(command);

    // Return the public URL
    if (DO_SPACES_CDN_URL) {
      // Use CDN URL if provided
      return `${DO_SPACES_CDN_URL}/${filename}`;
    } else {
      // Use the Spaces endpoint URL
      const endpointUrl = DO_SPACES_ENDPOINT.replace(/^https?:\/\//, "");
      return `https://${DO_SPACES_BUCKET}.${endpointUrl}/${filename}`;
    }
  } catch (error) {
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validates, processes, and uploads an app block icon to DigitalOcean Spaces.
 * The image will be resized to exactly 300x300px before upload.
 * 
 * @param base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param appBlockId - The app block ID to include in the filename
 * @returns Promise<string> - Public URL of the uploaded image
 * @throws Error if the image cannot be processed or uploaded
 */
export async function uploadAppBlockIcon(
  base64Image: string,
  appBlockId: string
): Promise<string> {
  if (!base64Image) {
    throw new Error("App block icon image is required");
  }

  // Validate environment variables
  if (!DO_SPACES_ENDPOINT || !DO_SPACES_KEY || !DO_SPACES_SECRET || !DO_SPACES_BUCKET) {
    throw new Error(
      "DigitalOcean Spaces configuration is missing. Please set DO_SPACES_ENDPOINT, DO_SPACES_KEY, DO_SPACES_SECRET, and DO_SPACES_BUCKET environment variables."
    );
  }

  // Remove data URI prefix if present (e.g., "data:image/png;base64,")
  const base64Data = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  // Decode base64 to buffer
  let imageBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(base64Data, "base64");
  } catch {
    throw new Error("Invalid base64 encoded image");
  }

  // Process image with sharp to ensure 300x300px
  let processedImage: Buffer;
  try {
    processedImage = await sharp(imageBuffer)
      .resize(APP_BLOCK_ICON_SIZE, APP_BLOCK_ICON_SIZE, {
        fit: "cover",
        position: "center",
      })
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Generate unique filename in app-block-icons folder
  const filename = `app-block-icons/${appBlockId}-${randomUUID()}.png`;

  // Upload to DigitalOcean Spaces
  try {
    const command = new PutObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: filename,
      Body: processedImage,
      ContentType: "image/png",
      ACL: "public-read", // Make the image publicly accessible
    });

    await s3Client.send(command);

    // Return the public URL
    if (DO_SPACES_CDN_URL) {
      // Use CDN URL if provided
      return `${DO_SPACES_CDN_URL}/${filename}`;
    } else {
      // Use the Spaces endpoint URL
      const endpointUrl = DO_SPACES_ENDPOINT.replace(/^https?:\/\//, "");
      return `https://${DO_SPACES_BUCKET}.${endpointUrl}/${filename}`;
    }
  } catch (error) {
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
