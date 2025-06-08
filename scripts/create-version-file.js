/**
 * 生成版本信息文件脚本
 * 创建包含版本信息的JSON文件，供前端使用
 * 
 * 用法:
 *   node create-version-file.js            # 使用package.json中的版本号
 *   node create-version-file.js --dev      # 添加开发标记
 *   node create-version-file.js --bump     # 自动递增补丁版本
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// 使用createRequire来导入JSON文件，解决ESM中导入JSON的问题
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 处理命令行参数
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const shouldBump = args.includes('--bump');

// 获取Git提交信息
const getGitInfo = () => {
  try {
    const { execSync } = require('child_process');
    
    // 获取最近的提交哈希
    const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
    
    // 获取最近的提交信息
    const gitCommitMessage = execSync('git log -1 --pretty=%B').toString().trim();
    
    // 获取分支名
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    // 获取最近的提交日期
    const gitCommitDate = execSync('git log -1 --format=%cd --date=iso').toString().trim();
    
    // 获取修改状态
    const isDirty = execSync('git status --porcelain').toString().trim() !== '';
    
    return {
      hash: gitHash + (isDirty ? '-dirty' : ''),
      branch: gitBranch,
      message: gitCommitMessage,
      date: gitCommitDate,
      isDirty: isDirty
    };
  } catch (error) {
    console.error('获取Git信息失败:', error.message);
    return {
      hash: 'unknown',
      branch: 'unknown',
      message: 'unknown',
      date: new Date().toISOString(),
      isDirty: false
    };
  }
};

// 生成环境标记
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (isDev) return 'development';
  return 'unknown';
};

// 生成版本信息
const generateVersionInfo = () => {
  const packageVersion = pkg.version || '1.0.0';
  const buildDate = new Date().toISOString();
  const buildTimestamp = Date.now();
  const gitInfo = getGitInfo();
  const env = getEnvironment();
  
  // 构建版本号: [package版本]-[构建日期]-[Git哈希]
  const dateStr = buildDate.split('T')[0].replace(/-/g, '');
  const fullVersion = `${packageVersion}-${dateStr}-${gitInfo.hash}`;
  
  const versionInfo = {
    version: packageVersion,
    fullVersion: fullVersion,
    environment: env,
    buildDate: buildDate,
    buildTimestamp: buildTimestamp,
    git: gitInfo
  };
  
  return versionInfo;
};

// 创建版本文件
const createVersionFile = () => {
  const versionInfo = generateVersionInfo();
  console.log('生成版本信息:', versionInfo);
  
  // 创建两个版本信息文件
  // 1. 开发环境 - public/version.json
  const publicDir = path.join(__dirname, '../public');
  const publicFile = path.join(publicDir, 'version.json');
  
  // 2. 生产环境 - dist/version.json
  const distDir = path.join(__dirname, '../dist');
  const distFile = path.join(distDir, 'version.json');
  
  // 确保输出目录存在
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // 写入开发环境版本信息
  fs.writeFileSync(publicFile, JSON.stringify(versionInfo, null, 2));
  console.log(`开发环境版本信息已写入: ${publicFile}`);
  
  // 如果dist目录存在，也写入生产环境版本信息
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distFile, JSON.stringify(versionInfo, null, 2));
    console.log(`生产环境版本信息已写入: ${distFile}`);
  }
  
  return versionInfo;
};

// 执行主函数
const versionInfo = createVersionFile();

// 导出版本信息供其他脚本使用
export default versionInfo; 