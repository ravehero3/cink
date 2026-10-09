/**
 * Oracle VPS Storage Configuration
 * Handles SFTP uploads to your Oracle VPS for video storage
 * 
 * NOTE: This module is NOT used in production builds.
 * Import only in API routes that need VPS access.
 */

// This is a stub - actual implementation only imported when needed
export const ORACLE_VPS_CONFIG = {
  host: process.env.ORACLE_VPS_HOST || '130.61.26.156',
  user: process.env.ORACLE_VPS_USER || 'ubuntu',
  privateKeyPath: process.env.ORACLE_VPS_KEY_PATH || '/var/secrets/oracle-ssh-key',
  remoteBasePath: '/home/ubuntu/ufosport-videos',
  remoteWebPath: process.env.ORACLE_VPS_WEB_URL || 'https://videos.ufosport.cz',
}

// Stub functions - will throw if called without proper setup
export async function uploadToOracleVPS(
  file: Buffer,
  filename: string
): Promise<{ vpsPath: string; url: string }> {
  throw new Error('Oracle VPS upload not available in this build')
}

export async function deleteFromOracleVPS(vpsPath: string): Promise<boolean> {
  throw new Error('Oracle VPS delete not available in this build')
}
