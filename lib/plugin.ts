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

export type TagGenerator = (
  params: TagGeneratorParams,
) => Promise<TagGeneratorResult> | TagGeneratorResult

export type PluginHtmlTagsSelection = HtmlTagDescriptor | TagGenerator

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
      enforce: 'post',
      handler(_, ctx) {
        return [
          ...fixed,
          ...(dynamic
            .map((generator) => generator({ ...params, ctx }))
            .flat()
            .filter(Boolean) as HtmlTagDescriptor[]),
        ]
      },
    },
  }
}
