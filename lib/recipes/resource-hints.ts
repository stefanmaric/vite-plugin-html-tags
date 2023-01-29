import { lookup } from 'mime-types'
import type { HtmlTagDescriptor } from 'vite'
import type { TagGenerator, TagGeneratorParams } from '../plugin.js'

export type Attributes = HtmlTagDescriptor['attrs'] & { rel: HintType }

export type AttributeBuilder = (path: string) => Attributes

/**
 * Defined by: https://www.w3.org/TR/resource-hints/
 */
export type HintType = 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload'

export interface ResourceHintsMatcher {
  /**
   * Regular Expression to match file paths in the final build output.
   */
  files: RegExp
  /**
   * Attributes to include in the Link tag. `as` and `type` are inferred by default but will be
   * overwritten if set here. Alternatively, you can pass an AttributeBuilder, which takes a string
   * as a representation of the full path of the file in the final build output and returns an
   * Attributes object.
   */
  attrs: Attributes | ((path: string) => Attributes)

  /**
   * Regular Expression to exclude files. Takes precedence over the `files` option.
   */
  exclude?: RegExp
  injectTo?: HtmlTagDescriptor['injectTo']
}

/**
 * Possible values to be used for the "as" property on <link /> tags.
 * These come from the Fetch Spec, under the Request Destinations section.
 *
 * See: https://fetch.spec.whatwg.org/#concept-request-destination
 */
export const REQUEST_DESTINATIONS = [
  'report',
  'document',
  'frame',
  'iframe',
  'object',
  'embed',
  'audio',
  'font',
  'image',
  'audioworklet',
  'paintworklet',
  'script',
  'serviceworker',
  'sharedworker',
  'webidentity',
  'worker',
  'style',
  'track',
  'video',
  'image',
  'manifest',
  'xslt',
] as const

export const KNOWN_MIME_TYPES = {
  'application/javascript': 'script',
  'text/css': 'style',
  'text/vtt': 'track',
} as const

export const mimeToDest = (mimeType?: string): string | undefined => {
  if (!mimeType) {
    return undefined
  }

  if (mimeType in KNOWN_MIME_TYPES) {
    return KNOWN_MIME_TYPES[mimeType as keyof typeof KNOWN_MIME_TYPES]
  }

  const segments = mimeType.split('/')
  const base = segments.find(Boolean)

  if (REQUEST_DESTINATIONS.includes(base as (typeof REQUEST_DESTINATIONS)[number])) {
    return base
  }

  return undefined
}

const isAttributeSet = <A extends Attributes, K extends string>(
  attrs: Attributes,
  key: K,
): attrs is A & Exclude<Attributes, undefined> & Record<K, string> => {
  if (attrs && key in attrs && typeof attrs[key] === 'string' && attrs[key]) {
    return true
  }

  return false
}

export const resourceHints = (
  options: ResourceHintsMatcher | ResourceHintsMatcher[],
): TagGenerator => {
  const matchers = Array.isArray(options) ? options : [options]

  return ({ ctx, base }: TagGeneratorParams): HtmlTagDescriptor[] | null => {
    const { bundle } = ctx

    if (!bundle) {
      return null
    }

    const tags = [] as HtmlTagDescriptor[]

    for (const filename of Object.keys(bundle)) {
      for (const matcher of matchers) {
        const fullpath = `${base}${filename}`

        if (!matcher.files.test(fullpath) || matcher.exclude?.test(fullpath)) {
          continue
        }

        const attributes =
          typeof matcher.attrs === 'function' ? matcher.attrs(fullpath) : matcher.attrs

        const mimeType = isAttributeSet(attributes, 'type')
          ? attributes.type
          : lookup(fullpath) || undefined

        const destType = isAttributeSet(attributes, 'as') ? attributes.as : mimeToDest(mimeType)

        tags.push({
          tag: 'link',
          attrs: {
            href: fullpath,
            type: mimeType,
            as: destType,
            ...attributes,
          },
          injectTo: matcher.injectTo ?? 'head',
        })
      }
    }

    return tags
  }
}
