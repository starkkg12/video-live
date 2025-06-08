/**
 * 自动版本递增脚本
 * 根据提交记录自动确定版本升级类型
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// 使用createRequire来导入JSON文件
const require = createRequire(import.meta.url);

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取package.json
const pkgPath = path.join(__dirname, '../package.json');
const pkg = require(pkgPath);
const currentVersion = pkg.version;

// 缓存文件路径，用于记录上次执行的信息
const cachePath = path.join(__dirname, '.version-cache.json');

// 读取或创建缓存文件
const getCache = () => {
  try {
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
  } catch (error) {
    console.warn('读取缓存文件失败，将创建新缓存:', error.message);
  }
  
  return { lastVersion: null, lastProcessedCommit: null, lastRunTimestamp: 0 };
};

// 更新缓存文件
const updateCache = (cache) => {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('更新缓存文件失败:', error.message);
  }
};

// 获取最新的提交哈希
const getLatestCommitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.error('获取最新提交哈希失败:', error.message);
    return null;
  }
};

// 读取Git提交记录
const getCommitsSinceLastVersion = (cache) => {
  try {
    // 获取上次版本标签
    const lastVersionTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""').toString().trim();
    
    // 如果当前版本与缓存中的版本相同，且没有新的提交，则返回空数组
    const latestCommitHash = getLatestCommitHash();
    if (currentVersion === cache.lastVersion && latestCommitHash === cache.lastProcessedCommit) {
      console.log('没有检测到新的提交，且版本未变更，跳过版本升级');
      return [];
    }
    
    let commitRange = '';
    if (lastVersionTag) {
      commitRange = `${lastVersionTag}..HEAD`;
    }
    
    // 获取提交记录
    const commits = execSync(`git log ${commitRange} --pretty=format:"%s"`).toString().trim();
    const commitArray = commits ? commits.split('\n') : [];
    
    // 记录处理信息到缓存
    cache.lastVersion = currentVersion;
    cache.lastProcessedCommit = latestCommitHash;
    cache.lastRunTimestamp = Date.now();
    updateCache(cache);
    
    return commitArray;
  } catch (error) {
    console.error('获取提交记录失败:', error.message);
    return [];
  }
};

// 分析提交信息确定版本升级类型
const determineVersionBump = (commits) => {
  // 检测是否有破坏性变更
  const hasMajorChange = commits.some(commit => 
    /\bBREAKING CHANGE\b/i.test(commit) || 
    /\bBREAK\b/i.test(commit) ||
    commit.startsWith('feat!:')
  );
  
  // 检测是否有新功能
  const hasFeature = commits.some(commit => 
    commit.startsWith('feat:') ||
    commit.startsWith('feature:') ||
    /\bnew\b/i.test(commit)
  );
  
  // 根据提交确定升级类型
  if (hasMajorChange) return 'major';
  if (hasFeature) return 'minor';
  return 'patch';
};

// 执行版本升级
const bumpVersion = () => {
  const cache = getCache();
  const commits = getCommitsSinceLastVersion(cache);
  
  if (commits.length === 0) {
    console.log('未找到新的提交记录，保持当前版本:', currentVersion);
    return currentVersion;
  }
  
  const bumpType = determineVersionBump(commits);
  console.log(`根据${commits.length}条提交记录，决定升级版本类型: ${bumpType}`);
  
  // 解析当前版本
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (bumpType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  // 更新package.json
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  
  console.log(`版本已从 ${currentVersion} 升级到 ${newVersion}`);
  
  // 更新缓存信息
  cache.lastVersion = newVersion;
  updateCache(cache);
  
  return newVersion;
};

// 执行版本升级
const newVersion = bumpVersion();

// 导出新版本号
export default newVersion; 