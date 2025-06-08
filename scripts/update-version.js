/**
 * PWA版本注入脚本
 * 在构建过程中自动更新Service Worker的版本号
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import './create-version-file.js';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从create-version-file.js获取版本信息
import versionInfo from './create-version-file.js';

// 复制SW文件到dist目录
const copySWToDist = () => {
  const sourcePath = path.join(__dirname, '../public/sw.js');
  const destPath = path.join(__dirname, '../dist/sw.js');
  
  try {
    if (!fs.existsSync(sourcePath)) {
      console.error(`源Service Worker文件不存在: ${sourcePath}`);
      return false;
    }
    
    // 确保dist目录存在
    const distDir = path.dirname(destPath);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(sourcePath, destPath);
    console.log(`已将Service Worker文件复制到: ${destPath}`);
    return true;
  } catch (error) {
    console.error('复制Service Worker文件失败:', error);
    return false;
  }
};

// 更新Service Worker版本
const updateServiceWorkerVersion = () => {
  console.log(`开始更新Service Worker版本至: ${versionInfo.fullVersion}`);
  
  // 读取sw.js
  const swPath = path.join(__dirname, '../dist/sw.js');
  
  // 如果dist目录中没有sw.js，先尝试复制
  if (!fs.existsSync(swPath) && !copySWToDist()) {
    console.error('无法更新Service Worker版本，文件不存在且无法复制');
    return;
  }
  
  try {
    let swContent = fs.readFileSync(swPath, 'utf8');
    
    // 替换版本号
    swContent = swContent.replace(
      /const APP_VERSION = ['"](.+)['"]/,
      `const APP_VERSION = '${versionInfo.fullVersion}'`
    );
    
    // 写回文件
    fs.writeFileSync(swPath, swContent);
    console.log(`已成功更新Service Worker版本至: ${versionInfo.fullVersion}`);
  } catch (error) {
    console.error('更新Service Worker版本失败:', error);
  }
};

// 执行版本更新
updateServiceWorkerVersion(); 