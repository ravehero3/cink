import https from 'https';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'alienshop';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function getUser() {
  try {
    const user = await makeRequest('GET', '/v2/user');
    console.log(`✓ Authenticated as: ${user.username || user.email}`);
    return user;
  } catch (error) {
    console.error('❌ Failed to authenticate:', error.message);
    throw error;
  }
}

async function createOrGetProject() {
  try {
    // Try to get existing project
    const projects = await makeRequest('GET', '/v9/projects');
    const existing = projects.projects.find(p => p.name === PROJECT_NAME);
    
    if (existing) {
      console.log(`✓ Project "${PROJECT_NAME}" already exists`);
      return existing;
    }
    
    // Create new project
    console.log(`Creating new project "${PROJECT_NAME}"...`);
    const project = await makeRequest('POST', '/v9/projects', {
      name: PROJECT_NAME,
      framework: 'nextjs',
      buildCommand: 'npm run build',
      devCommand: 'npm run dev',
      installCommand: 'npm install',
      outputDirectory: '.next',
    });
    
    console.log(`✓ Project created: ${project.name}`);
    return project;
  } catch (error) {
    console.error('❌ Failed to create/get project:', error.message);
    throw error;
  }
}

async function setEnvironmentVariables(projectId) {
  console.log('\nSetting environment variables...');
  
  const envVars = [
    {
      key: 'DATABASE_URL',
      value: process.env.DATABASE_URL,
      target: ['production', 'preview'],
      type: 'encrypted'
    },
    {
      key: 'NEXTAUTH_SECRET',
      value: '2kE/zLfKsMcY+UxdYSIjsQed1hkom71BkOaffIaHdxnD+Vo3D54yWTTblb6603YQTnONX0XiNqTAyayWm81VSQ==',
      target: ['production', 'preview'],
      type: 'encrypted'
    },
    {
      key: 'CLOUDINARY_CLOUD_NAME',
      value: process.env.CLOUDINARY_CLOUD_NAME,
      target: ['production', 'preview'],
      type: 'encrypted'
    },
    {
      key: 'CLOUDINARY_API_KEY',
      value: process.env.CLOUDINARY_API_KEY,
      target: ['production', 'preview'],
      type: 'encrypted'
    },
    {
      key: 'CLOUDINARY_API_SECRET',
      value: process.env.CLOUDINARY_API_SECRET,
      target: ['production', 'preview'],
      type: 'encrypted'
    }
  ];
  
  for (const env of envVars) {
    try {
      await makeRequest('POST', `/v10/projects/${projectId}/env`, env);
      console.log(`  ✓ Set ${env.key}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠ ${env.key} already exists (skipping)`);
      } else {
        console.error(`  ❌ Failed to set ${env.key}:`, error.message);
      }
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting Vercel deployment...\n');
    
    // Step 1: Authenticate
    const user = await getUser();
    
    // Step 2: Create or get project
    const project = await createOrGetProject();
    
    // Step 3: Set environment variables
    await setEnvironmentVariables(project.id);
    
    console.log('\n✅ Project configured successfully!');
    console.log(`\nProject ID: ${project.id}`);
    console.log(`Project URL: https://vercel.com/${user.username}/${PROJECT_NAME}`);
    console.log('\nNext: Run deployment using Vercel CLI');
    
    return project;
  } catch (error) {
    console.error('\n❌ Deployment setup failed:', error.message);
    process.exit(1);
  }
}

main();
