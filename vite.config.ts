import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const isRelativeImport = (id: string): boolean => id.startsWith('.') || id.startsWith('/')
// Exclude entry-point from the check, if there's not parentId, that's the entry-point.
const isExternal = (id: string, parentId?: string) => Boolean(parentId) && !isRelativeImport(id)

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    lib: {
      entry: [
        './lib/index.ts',
        './lib/plugin.ts',
        './lib/index.ts',
        './lib/recipes/resource-hints.ts',
      ],
    },
    rollupOptions: {
      external: isExternal,
    },
  },
  plugins: [
    dts({
      exclude: ['node_module/**', 'vite.config.ts'],
    }),
  ],
})
