import type { Plugin, ResolvedConfig, HtmlTagDescriptor, IndexHtmlTransformContext } from 'vite'

import { partition, pick } from './utils.js'

/**
 * Information about the Vite Build.
 */
export interface TagGeneratorParams {
  ctx: IndexHtmlTransformContext

  base: ResolvedConfig['base']
  command: ResolvedConfig['command']
  env: ResolvedConfig['env']
  mode: ResolvedConfig['mode']
  ssr: ResolvedConfig['ssr']
}

/**
 * Tag or tags to be injected into the HTML, if any.
 */
export type TagGeneratorResult = HtmlTagDescriptor | HtmlTagDescriptor[] | null | undefined

/**
 * A function that generates HTML tag descriptors to be injected into HTML files based on Vite's
 * build information.
 */
export type TagGenerator = (
  params: TagGeneratorParams,
) => Promise<TagGeneratorResult> | TagGeneratorResult

export type PluginHtmlTagsSelection = HtmlTagDescriptor | TagGenerator

/**
 * Vite Plugin to inject Tags to HTML entries.
 *
 * @example
 * import react from "@vitejs/plugin-react-swc"
 * import { defineConfig } from "vite"
 * import { PluginHtmlTags } from "vite-plugin-html-tags"
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     PluginHtmlTags(({ env }) => [
 *       {
 *         tag: "link",
 *         attrs: {
 *           rel: "preconnect",
 *           href: env.VITE_API_URL,
 *         },
 *       },
 *     ]),
 *   ],
 * })
 */
export const PluginHtmlTags = (
  generators: PluginHtmlTagsSelection | PluginHtmlTagsSelection[],
): Plugin => {
  let params: Omit<TagGeneratorParams, 'ctx'>

  // Optimization: Separate static objects from functions so there's no need to iterate and check
  // all elements.
  const [fixed, dynamic] = partition<PluginHtmlTagsSelection, HtmlTagDescriptor, TagGenerator>(
    Array.isArray(generators) ? generators : [generators],
    (generatorOrDescriptor) => typeof generatorOrDescriptor !== 'function',
  )

  return {
    name: 'vite-plugin-custom-html-tags',
    configResolved: (resolved) => {
      params = pick(resolved, ['base', 'env', 'mode', 'command', 'ssr'])
    },
    transformIndexHtml: {
      order: 'post',
      async handler(_, ctx) {
        return Promise.all([
          ...fixed,
          ...(dynamic
            .map((generator) => generator({ ...params, ctx }))
            .flat()
            .filter(Boolean) as HtmlTagDescriptor[]),
        ])
      },
    },
  }
}
