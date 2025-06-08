// @ts-check
import { defineConfig } from 'astro/config'
import fs from 'fs'
import vue from '@astrojs/vue'
import node from '@astrojs/node'

// 检查certs目录是否存在
const certsExist =
  fs.existsSync('./certs') &&
  fs.existsSync('./certs/localhost.key') &&
  fs.existsSync('./certs/localhost.crt')

// https://astro.build/config
export default defineConfig({
  integrations: [vue({ jsx: true, appEntrypoint: '/src/app.entrypoint' })],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  build: {
    // CDN Url
    assetsPrefix: 'https://short197.dating141.com',
  },
  
  // vite: {
  //   server: {
  //     https: {
  //                 key: './certs/localhost.key',
  //                 cert: './certs/localhost.crt',
  //               },
  //     proxy: {
  //       '/api': {
  //         target: 'http://localhost:8787',
  //         changeOrigin: true,
  //         rewrite: path => path.replace(/^\/api/, ''),
  //       },
  //     },
  //   },
  //   resolve: {
  //     alias: {
  //       '@': '/src',
  //       '@components': '/src/components',
  //     },
  //   },
  // },
  vite: {
    server: certsExist
      ? {
          https: {
            key: './certs/localhost.key',
            cert: './certs/localhost.crt',
          },
        }
      : {},
    // test: {
    //   globals: true,
    //   environment: 'jsdom',
    //   coverage: {
    //     provider: 'v8',
    //     reporter: ['text', 'json', 'html'],
    //     include: ['src/components/**/*.vue'],
    //     exclude: [
    //       'node_modules/**',
    //       'dist/**',
    //       'src/components/**/index.ts',
    //       'src/components/**/*.d.ts',
    //     ],
    //   },
    // },
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
      },
    },
  },
})
