/**
 * Oracle VPS Storage Configuration
 * Handles SFTP uploads to your Oracle VPS for video storage
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const ORACLE_VPS_CONFIG = {
  host: process.env.ORACLE_VPS_HOST || '130.61.26.156',
  user: process.env.ORACLE_VPS_USER || 'ubuntu',
  privateKeyPath: process.env.ORACLE_VPS_KEY_PATH || '/var/secrets/oracle-ssh-key',
  remoteBasePath: '/home/ubuntu/ufosport-videos', // Will create if doesn't exist
  remoteWebPath: process.env.ORACLE_VPS_WEB_URL || 'https://videos.ufosport.cz', // Nginx reverse proxy
}

export async function uploadToOracleVPS(
  file: Buffer,
  filename: string
): Promise<{ vpsPath: string; url: string }> {
  try {
    // Write file to temp directory first
    const tempDir = tmpdir();
    const tempPath = join(tempDir, `upload-${Date.now()}-${filename}`);
    await writeFile(tempPath, file);

    // Dynamically import node-ssh (added as optional dependency for production)
    const { NodeSSH } = await import('node-ssh')
    const ssh = new NodeSSH()

    await ssh.connect({
      host: ORACLE_VPS_CONFIG.host,
      username: ORACLE_VPS_CONFIG.user,
      privateKey: ORACLE_VPS_CONFIG.privateKeyPath,
      readyTimeout: 30000,
    })

    // Ensure remote directory exists
    const remotePath = `${ORACLE_VPS_CONFIG.remoteBasePath}/${filename}`
    await ssh.execCommand(`mkdir -p ${ORACLE_VPS_CONFIG.remoteBasePath}`)

    // Upload file from temp path
    await ssh.putFile(
      tempPath,
      remotePath,
      undefined,
      0o644
    )

    // Verify file exists
    const checkCmd = await ssh.execCommand(`test -f ${remotePath} && echo "OK" || echo "FAILED"`)
    if (checkCmd.stdout.trim() !== 'OK') {
      throw new Error('File verification failed on VPS')
    }

    // Get file size for verification
    const sizeCmd = await ssh.execCommand(`stat -f%z "${remotePath}" 2>/dev/null || stat -c%s "${remotePath}"`)
    const remoteSize = parseInt(sizeCmd.stdout.trim())
    if (remoteSize !== file.length) {
      throw new Error(`Size mismatch: local=${file.length}, remote=${remoteSize}`)
    }

    await ssh.dispose()

    return {
      vpsPath: remotePath,
      url: `${ORACLE_VPS_CONFIG.remoteWebPath}/${filename}`,
    }
  } catch (error) {
    console.error('Oracle VPS upload error:', error)
    throw new Error(
      `Failed to upload to Oracle VPS: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function deleteFromOracleVPS(vpsPath: string): Promise<boolean> {
  try {
    const { NodeSSH } = await import('node-ssh')
    const ssh = new NodeSSH()

    await ssh.connect({
      host: ORACLE_VPS_CONFIG.host,
      username: ORACLE_VPS_CONFIG.user,
      privateKey: ORACLE_VPS_CONFIG.privateKeyPath,
      readyTimeout: 30000,
    })

    await ssh.execCommand(`rm -f "${vpsPath}"`)
    await ssh.dispose()

    return true
  } catch (error) {
    console.error('Oracle VPS delete error:', error)
    return false
  }
}
