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
      entry: './lib/index.ts',
      name: 'vite-plugin-html-tags',
      fileName: 'vite-plugin-html-tags',
    },
    rollupOptions: {
      external: isExternal,
    }
  },
  plugins: [dts()],
});