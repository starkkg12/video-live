// 应用版本号 - 更新应用时修改此版本号
const APP_VERSION = '1.0.1';

// 缓存名称和版本
const CACHE_NAME = `pwtk-cache-v${APP_VERSION}`;
const DATA_CACHE_NAME = `pwtk-data-cache-v${APP_VERSION}`;

// 核心静态资源 - 应用外壳 (基础路径，不指定具体文件)
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // 离线页面
  '/share.png'
];

// 离线回退页面URL
const OFFLINE_PAGE = '/offline.html';

// 安装Service Worker
self.addEventListener('install', event => {
  console.log(`[ServiceWorker] 安装中，版本: ${APP_VERSION}`);
  
  // 跳过等待，直接激活
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] 预缓存应用外壳');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        // 安装完成后设置定期清理任务
        setCacheCleanupInterval();
      })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  console.log(`[ServiceWorker] 激活中，版本: ${APP_VERSION}`);
  
  // 立即控制页面
  self.clients.claim();
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[ServiceWorker] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // 预热缓存
      warmUpCache(),
      
      // 通知客户端
      self.clients.matchAll({ type: 'window' })
        .then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: APP_VERSION
            });
          });
        })
    ])
  );
});

// 处理请求
self.addEventListener('fetch', event => {
  // 跳过不支持缓存的请求
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // 跳过不支持的协议
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log(`[ServiceWorker] 跳过不支持的协议: ${url.protocol}, URL: ${url.href}`);
    return;
  }
  
  // 处理API请求（网络优先，离线回退到缓存）
  if (url.pathname.startsWith('/api/') || url.pathname.includes('biz')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // 处理HTML导航请求（网络优先，离线回退到缓存或模板）
  if (event.request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(event.request)
    );
    return;
  }
  
  // 获取不带查询参数的路径，用于匹配静态资源
  const cleanPathname = getPathWithoutQueryParams(url.pathname);
  
  // 静态资源（缓存优先，网络回退）- 使用正则表达式匹配各种可能的静态资源路径模式
  if (
    // 基本静态资源文件扩展名
    cleanPathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/) ||
    // 预定义的APP_SHELL资源
    APP_SHELL.includes(cleanPathname) ||
    // 可能的静态资源路径模式
    cleanPathname.includes('/static/') ||
    cleanPathname.includes('/_next/') ||
    cleanPathname.includes('/assets/') ||
    cleanPathname.includes('/images/') ||
    cleanPathname.includes('/fonts/') ||
    cleanPathname.includes('/css/') ||
    cleanPathname.includes('/js/') ||
    cleanPathname.includes('/ts/') ||
    // 本地开发专用路径
    url.pathname.includes('/@fs/') && cleanPathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)
  ) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // 其他请求（网络优先，缓存回退）
  event.respondWith(networkFirstWithCacheFallback(event.request));
});

// 从URL路径中移除查询参数
function getPathWithoutQueryParams(pathname) {
  // 查找第一个'?'并移除它之后的所有内容
  const questionMarkIndex = pathname.indexOf('?');
  if (questionMarkIndex !== -1) {
    return pathname.substring(0, questionMarkIndex);
  }
  return pathname;
}

// 检查路径是否是静态资源路径
function isStaticResourcePath(pathname) {
  // 移除查询参数以正确匹配扩展名
  const cleanPathname = getPathWithoutQueryParams(pathname);
  
  // 已知的静态资源路径模式
  const staticPatterns = [
    '/static/',
    '/_next/',
    '/assets/',
    '/images/',
    '/fonts/',
    '/css/',
    '/js/',
    '/@fs/' // 本地开发服务器路径
  ];
  
  // 已知的静态资源扩展名
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', 
    '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  
  // 检查路径是否匹配任一模式
  const matchesPattern = staticPatterns.some(pattern => pathname.includes(pattern));
  
  // 检查扩展名
  const hasStaticExtension = staticExtensions.some(ext => cleanPathname.endsWith(ext));
  
  // 检查APP_SHELL中的路径
  const isInAppShell = APP_SHELL.includes(cleanPathname);
  
  return matchesPattern || hasStaticExtension || isInAppShell;
}

// 缓存优先策略
async function cacheFirstStrategy(request) {
  // 先检查是否可缓存
  try {
    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return fetch(request);
    }
  } catch (error) {
    console.error('[ServiceWorker] URL解析失败:', error);
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // 后台更新缓存
    fetchAndCache(request).catch(error => console.error('后台缓存更新失败:', error));
    return cachedResponse;
  }
  return fetchAndCache(request);
}

// 网络优先策略
async function networkFirstStrategy(request) {
  try {
    // 检查请求URL是否使用可缓存的协议(http或https)
    const url = new URL(request.url);
    const isCacheable = url.protocol === 'http:' || url.protocol === 'https:';
    
    if (!isCacheable) {
      console.log(`[ServiceWorker] 跳过不支持的协议: ${url.protocol}`);
      return fetch(request);
    }
    
    const networkResponse = await fetch(request);
    // 只缓存成功的响应
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 网络请求失败时回退到缓存
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('无网络且无缓存');
  }
}

// 获取并缓存资源
async function fetchAndCache(request) {
  try {
    // 检查请求URL是否使用可缓存的协议(http或https)
    const url = new URL(request.url);
    const isCacheable = url.protocol === 'http:' || url.protocol === 'https:';
    
    if (!isCacheable) {
      console.log(`[ServiceWorker] 跳过不支持的协议: ${url.protocol}`);
      return fetch(request);
    }
    
    const response = await fetch(request);
    
    // 只缓存成功的响应
    if (response && response.status === 200) {
      // 检查是否是可缓存的内容类型
      const contentType = response.headers.get('content-type') || '';
      const cacheableTypes = [
        'text/css', 
        'text/javascript', 
        'application/javascript',
        'application/json',
        'image/',
        'font/',
        'text/html'
      ];
      
      const isCacheableType = cacheableTypes.some(type => contentType.includes(type));
      
      if (isCacheableType || isStaticResourcePath(url.pathname)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        
        // 记录缓存成功的资源
        console.log(`[ServiceWorker] 已缓存资源: ${url.pathname}`);
      } else {
        console.log(`[ServiceWorker] 跳过非静态内容类型: ${contentType}, URL: ${url.pathname}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] 获取资源失败:', error);
    throw error;
  }
}

// 后台同步API
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // 处理离线数据同步
      syncOfflineData()
    );
  }
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 同步离线数据的示例函数
async function syncOfflineData() {
  // 实际项目中可以从IndexedDB读取离线存储的数据并同步到服务器
  console.log('[ServiceWorker] 执行后台同步');
}

// 错误限制计数器
let messageErrorCount = 0;
const MAX_MESSAGE_ERRORS = 20;

// 处理来自页面的消息
self.addEventListener('message', event => {
  const message = event.data;
  const client = event.source;
  const clientId = client ? client.id : 'unknown';
  
  // 错误限制：如果发生太多错误，进入保护模式
  if (messageErrorCount > MAX_MESSAGE_ERRORS) {
    console.error(`[ServiceWorker] 已达到最大错误数 ${MAX_MESSAGE_ERRORS}，进入保护模式`);
    // 一段时间后重置错误计数
    setTimeout(() => {
      messageErrorCount = 0;
      console.log('[ServiceWorker] 错误计数已重置');
    }, 5 * 60 * 1000); // 5分钟后重置
    
    return; // 不处理更多消息
  }
  
  try {
    if (message && message.type === 'CHECK_VERSION') {
      console.log(`[ServiceWorker] 收到来自客户端(${clientId})的版本检查请求`);
      
      // 检查是否有MessageChannel端口
      if (event.ports && event.ports[0]) {
        try {
          // 通过MessageChannel端口回复
          event.ports[0].postMessage({
            type: 'VERSION_INFO',
            version: APP_VERSION,
            timestamp: Date.now() // 添加时间戳避免缓存问题
          });
          console.log('[ServiceWorker] 通过MessageChannel回复版本信息:', APP_VERSION);
        } catch (error) {
          messageErrorCount++;
          console.error('[ServiceWorker] MessageChannel回复失败:', error);
          
          // 尝试通过client接口回复
          if (client) {
            try {
              client.postMessage({
                type: 'VERSION_INFO',
                version: APP_VERSION,
                timestamp: Date.now(),
                fallback: true
              });
              console.log('[ServiceWorker] 通过client.postMessage回复(降级)');
            } catch (e) {
              messageErrorCount++;
              console.error('[ServiceWorker] 无法发送任何响应:', e);
            }
          }
        }
      } else if (client) {
        // 向请求的客户端发送当前版本信息 (旧方式)
        try {
          client.postMessage({
            type: 'VERSION_INFO',
            version: APP_VERSION,
            timestamp: Date.now()
          });
          console.log('[ServiceWorker] 通过postMessage回复版本信息:', APP_VERSION);
        } catch (error) {
          messageErrorCount++;
          console.error('[ServiceWorker] 通过客户端回复失败:', error);
        }
      } else {
        messageErrorCount++;
        console.error('[ServiceWorker] 没有可用的通信通道');
      }
    }
    
    if (message && message.type === 'SKIP_WAITING') {
      console.log(`[ServiceWorker] 收到来自客户端(${clientId})的跳过等待请求`);
      self.skipWaiting().then(() => {
        console.log('[ServiceWorker] 已成功跳过等待状态');
        
        // 如果有MessageChannel端口，发送确认
        if (event.ports && event.ports[0]) {
          try {
            event.ports[0].postMessage({
              type: 'SKIP_WAITING_DONE',
              success: true,
              timestamp: Date.now()
            });
          } catch (error) {
            messageErrorCount++;
            console.warn('[ServiceWorker] 无法通过MessageChannel确认SKIP_WAITING:', error);
          }
        }
      }).catch(error => {
        messageErrorCount++;
        console.error('[ServiceWorker] 跳过等待失败:', error);
      });
    }
  } catch (error) {
    messageErrorCount++;
    console.error('[ServiceWorker] 处理消息时发生错误:', error);
  }
  
  // 如果错误计数大于0，但不超过限制，每隔一段时间减少错误计数
  if (messageErrorCount > 0) {
    setTimeout(() => {
      messageErrorCount = Math.max(0, messageErrorCount - 1);
    }, 60 * 1000); // 每分钟减少1个错误计数
  }
});

// 新增：网络优先但缓存回退策略
async function networkFirstWithCacheFallback(request) {
  try {
    // 尝试从网络获取
    const networkResponse = await fetch(request);
    
    // 只缓存成功的响应
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是HTML请求，提供离线页面
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match(OFFLINE_PAGE);
    }
    
    // 其他资源类型无法提供
    console.error('[ServiceWorker] 无法提供资源:', request.url);
    throw error;
  }
}

// 周期性缓存清理（每24小时）
function setCacheCleanupInterval() {
  // 检查periodicSync API是否可用
  if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('cache-cleanup', {
      minInterval: 24 * 60 * 60 * 1000 // 24小时
    }).catch(error => {
      console.error('[ServiceWorker] 无法注册周期性同步:', error);
      setFallbackInterval();
    });
  } else {
    console.log('[ServiceWorker] periodicSync API不可用，使用fallback');
    setFallbackInterval();
  }
}

// 设置备用清理间隔
function setFallbackInterval() {
  // 回退：使用普通计时器
  setInterval(() => {
    console.log('[ServiceWorker] 执行计划缓存清理');
    cleanupCaches();
  }, 24 * 60 * 60 * 1000);
}

// 清理过期缓存和限制缓存大小
async function cleanupCaches() {
  try {
    console.log('[ServiceWorker] 开始清理缓存');
    
    // 清理旧版本缓存
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] 删除旧缓存:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );
    
    // 限制数据缓存大小（最多保留100个项目）
    const MAX_ITEMS = 100;
    const dataCache = await caches.open(DATA_CACHE_NAME);
    const requests = await dataCache.keys();
    
    if (requests.length > MAX_ITEMS) {
      console.log(`[ServiceWorker] 数据缓存超过限制，删除旧项目 (${requests.length} > ${MAX_ITEMS})`);
      // 删除最早的缓存项目
      const itemsToDelete = requests.slice(0, requests.length - MAX_ITEMS);
      await Promise.all(
        itemsToDelete.map(request => dataCache.delete(request))
      );
    }
    
    console.log('[ServiceWorker] 缓存清理完成');
  } catch (error) {
    console.error('[ServiceWorker] 缓存清理异常:', error);
  }
}

// 缓存预热函数
async function warmUpCache() {
  try {
    // 获取首页HTML
    const homeResponse = await fetch('/');
    if (homeResponse && homeResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(new Request('/'), homeResponse.clone());
      console.log('[ServiceWorker] 首页预热完成');
      
      // 解析HTML并获取关键资源
      const html = await homeResponse.clone().text();
      const resourceUrls = extractResourceUrls(html);
      
      // 预缓存关键资源
      for (const url of resourceUrls) {
        try {
          const resourceResponse = await fetch(url);
          if (resourceResponse && resourceResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(new Request(url), resourceResponse.clone());
            console.log(`[ServiceWorker] 预热缓存资源: ${url}`);
          }
        } catch (err) {
          console.warn(`[ServiceWorker] 无法预热资源: ${url}`, err);
        }
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] 缓存预热失败:', error);
  }
}

// 从HTML中提取关键资源URL
function extractResourceUrls(html) {
  const urls = [];
  
  // 提取CSS链接
  const cssRegex = /<link[^>]*href=["']([^"']+\.css)["'][^>]*>/g;
  let match;
  while ((match = cssRegex.exec(html)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  
  // 提取JS脚本
  const jsRegex = /<script[^>]*src=["']([^"']+\.js)["'][^>]*>/g;
  while ((match = jsRegex.exec(html)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  
  // 提取关键图像
  const imgRegex = /<img[^>]*src=["']([^"']+\.(png|jpg|jpeg|gif|svg))["'][^>]*>/g;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  
  return urls;
}

// 检查是否是动态路由
function isDynamicRoute(pathname) {
  // 常见动态路由格式，包括多级路由模式
  const dynamicPatterns = [
    /^\/user\/[^\/]+$/,                    // /user/{id}
    /^\/user\/follow\/[^\/]+$/,            // /user/follow/{id}
    /^\/user\/following\/[^\/]+$/,         // /user/following/{id}
    /^\/user\/[^\/]+\/[^\/]+$/,            // /user/{type}/{id}
    /^\/product\/[^\/]+$/,                 // /product/{id}
    /^\/article\/\d+\/\d+\/[^\/]+$/,       // /article/{year}/{month}/{slug}
    /^\/profile\/[^\/]+$/,                 // /profile/{username}
    /^\/video\/[^\/]+$/,                   // /video/{id}
    /^\/live\/[^\/]+$/,                    // /live/{id}
    /^\/category\/[^\/]+$/,                // /category/{id}
    /^\/tag\/[^\/]+$/,                     // /tag/{id}
    /^\/post\/[^\/]+$/                     // /post/{id}
  ];
  
  return dynamicPatterns.some(pattern => pattern.test(pathname));
}

// 获取动态路由的模式（移除ID部分，保留查询参数）
function getRoutePattern(pathname) {
  // 多级路由的特殊处理
  if (pathname.startsWith('/user/follow/')) {
    return '/user/follow/template';
  }
  
  if (pathname.startsWith('/user/following/')) {
    return '/user/following/template';
  }
  
  // 一般路由处理
  const parts = pathname.split('/');
  
  if (parts.length >= 3) {
    // 假设最后一部分是动态ID
    parts[parts.length - 1] = 'template';
    return parts.join('/');
  }
  
  return pathname;
}

// 处理导航请求（包括动态路由和查询参数）
async function handleNavigationRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const fullUrl = url.pathname + url.search; // 包含查询参数的完整URL路径
  
  console.log(`[ServiceWorker] 处理导航请求: ${fullUrl}`);
  
  try {
    // 尝试从网络获取
    const networkResponse = await fetch(request);
    
    // 如果网络请求成功，缓存结果
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      
      // 缓存完整的请求（包括查询参数）
      cache.put(request, networkResponse.clone());
      console.log(`[ServiceWorker] 缓存导航请求(完整URL): ${fullUrl}`);
      
      // 对于动态路由，存储路由模板版本（带查询参数）
      if (isDynamicRoute(pathname)) {
        // 1. 存储去除ID的路由模板，保留查询参数（/user/template?tab=followers）
        const routePattern = getRoutePattern(pathname);
        const templateUrl = new URL(request.url);
        templateUrl.pathname = routePattern;
        const templateRequest = new Request(templateUrl);
        cache.put(templateRequest, networkResponse.clone());
        console.log(`[ServiceWorker] 存储动态路由模板(带查询参数): ${routePattern}${url.search}`);
        
        // 2. 额外存储一个不带查询参数的基本模板，用作后备
        const baseTemplateUrl = new URL(routePattern, request.url);
        const baseTemplateRequest = new Request(baseTemplateUrl);
        cache.put(baseTemplateRequest, networkResponse.clone());
        console.log(`[ServiceWorker] 存储动态路由基本模板: ${routePattern}`);
      }
      
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`[ServiceWorker] 网络请求失败，尝试从缓存获取: ${fullUrl}`);
    
    // 尝试匹配的优先级顺序：
    // 1. 首先尝试精确匹配完整URL（包括查询参数）
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`[ServiceWorker] 使用精确匹配缓存: ${fullUrl}`);
      return cachedResponse;
    }
    
    // 2. 如果是动态路由，尝试匹配相同查询参数的路由模板
    if (isDynamicRoute(pathname)) {
      const routePattern = getRoutePattern(pathname);
      const templateUrl = new URL(request.url);
      templateUrl.pathname = routePattern;
      const templateRequest = new Request(templateUrl);
      
      const templateResponse = await caches.match(templateRequest);
      if (templateResponse) {
        console.log(`[ServiceWorker] 使用动态路由模板(带查询参数): ${routePattern}${url.search}`);
        return templateResponse;
      }
      
      // 3. 尝试匹配不带查询参数的基本模板
      const baseTemplateUrl = new URL(routePattern, request.url);
      const baseTemplateRequest = new Request(baseTemplateUrl);
      const baseTemplateResponse = await caches.match(baseTemplateRequest);
      
      if (baseTemplateResponse) {
        console.log(`[ServiceWorker] 使用动态路由基本模板: ${routePattern}`);
        return baseTemplateResponse;
      }
      
      // 4. 尝试查找路由前缀匹配
      const matchedResponse = await findMatchingRouteInCache(pathname, url.search);
      if (matchedResponse) {
        return matchedResponse;
      }
    }
    
    // 如果找不到任何匹配，回退到离线页面
    console.log('[ServiceWorker] 未找到匹配的缓存，使用离线页面');
    return caches.match(OFFLINE_PAGE);
  }
}

// 在缓存中查找匹配的路由模板（考虑查询参数）
async function findMatchingRouteInCache(pathname, searchParams) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    // 提取路由的基本部分（例如，/user/follow/ 从 /user/follow/12345）
    const pathParts = pathname.split('/');
    let routeBase = '';
    
    // 对于多级路由特殊处理
    if (pathParts.length >= 4 && pathParts[1] === 'user' && 
        (pathParts[2] === 'follow' || pathParts[2] === 'following')) {
      routeBase = `/${pathParts[1]}/${pathParts[2]}/`;
    } else if (pathParts.length >= 3) {
      // 一般路由
      routeBase = pathname.split('/').slice(0, -1).join('/') + '/';
    } else {
      routeBase = pathname + '/';
    }
    
    console.log(`[ServiceWorker] 查找路由前缀: ${routeBase}`);
    
    // 查找策略：
    // 1. 优先匹配有相同查询参数的缓存
    // 2. 其次匹配相同路由前缀的任何缓存
    for (const key of keys) {
      const keyUrl = new URL(key.url);
      
      // 完全匹配 - 路径前缀+相同查询参数
      if (keyUrl.pathname.startsWith(routeBase) && keyUrl.search === searchParams) {
        console.log(`[ServiceWorker] 找到精确匹配路由(带参数): ${keyUrl.pathname}${keyUrl.search}`);
        return cache.match(key);
      }
    }
    
    // 没有找到带参数的匹配，尝试只匹配路径前缀
    for (const key of keys) {
      const keyUrl = new URL(key.url);
      if (keyUrl.pathname.startsWith(routeBase)) {
        console.log(`[ServiceWorker] 找到相似路由模板(忽略参数): ${keyUrl.pathname}`);
        return cache.match(key);
      }
    }
    
    // 找不到匹配项
    return null;
  } catch (error) {
    console.error('[ServiceWorker] 查找路由模板时出错:', error);
    return null;
  }
} 