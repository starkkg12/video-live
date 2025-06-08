import { globSync } from 'glob';
import fs from 'fs';
import path from 'path';

// 获取所有Vue组件文件
const getAllComponents = () => {
  const componentFiles = globSync('src/components/**/*.vue');
  return componentFiles.map(file => {
    const componentName = path.basename(file, '.vue');
    return {
      name: componentName,
      path: file,
      used: false,
      importCount: 0,
      templateCount: 0
    };
  });
};

// 检查组件在其他文件中的引用
const checkComponentUsage = (components) => {
  // 获取所有可能使用组件的文件
  const allFiles = globSync(['src/**/*.vue', 'src/**/*.ts', 'src/**/*.js', '*/**/*.astro']);
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    for (const component of components) {
      // 检查引入语句
      const importRegex = new RegExp(`import\\s+${component.name}\\s+from\\s+['"]`, 'g');
      const importMatches = content.match(importRegex);
      if (importMatches) {
        component.importCount += importMatches.length;
        component.used = true;
      }
      
      // 检查模板中的使用
      const templateRegex = new RegExp(`<\\s*${component.name}[\\s>]`, 'g');
      const templateMatches = content.match(templateRegex);
      if (templateMatches) {
        component.templateCount += templateMatches.length;
        component.used = true;
      }
    }
  }
  
  return components;
};

// 执行分析
const analyzeComponents = () => {
  const components = getAllComponents();
  const analyzedComponents = checkComponentUsage(components);
  
  // 过滤出未使用的组件
  const unusedComponents = analyzedComponents.filter(c => !c.used);
  
  // 按照使用频率排序所有组件
  const sortedComponents = analyzedComponents.sort((a, b) => 
    (a.importCount + a.templateCount) - (b.importCount + b.templateCount)
  );
  
  console.log('\n===== 未使用组件 =====');
  if (unusedComponents.length === 0) {
    console.log('没有发现未使用的组件');
  } else {
    unusedComponents.forEach(c => {
      console.log(`- ${c.name} (${c.path})`);
    });
  }
  
  console.log('\n===== 组件使用频率 (低到高) =====');
  sortedComponents.forEach(c => {
    console.log(`- ${c.name}: 引入次数 ${c.importCount}, 模板使用次数 ${c.templateCount}, 文件路径: ${c.path}`);
  });
};

analyzeComponents(); 