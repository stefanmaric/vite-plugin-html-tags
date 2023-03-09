# vite-plugin-html-tags

Flexible framework to add tags to HTML entries and recipes for resource hints and more

## What is it?

Vite offers a [very convenient way](https://vitejs.dev/guide/api-plugin.html#transformindexhtml) for plugin authors to inject tags into HTML entry points. This plugin exposes these capabilities to Vite users in an even more convenient way and a set of "recipes" to solve common use-cases like preloading build assets.

## Sneak-peek

```typescript
// vite.config.ts

import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { PluginHtmlTags } from "vite-plugin-html-tags"

export default defineConfig({
  plugins: [
    react(),
    PluginHtmlTags(({ env }) => [
      {
        tag: "link",
        attrs: {
          rel: "preconnect",
          href: env.VITE_API_URL,
        },
      },
    ]),
  ],
})
```

In the example above a `<link rel="preconnect" href="<VITE_API_URL>">` will be injected into the HTML `<head>`. The value of `<VITE_API_URL>` will be whatever Vite resolved for the project, env, and mode combination. We call such function a "`TagGenerator`".

## Project stage

Alpha: it is being tested in some projects and will enter beta stage once released to production.

## Recipes

"Recipes" are just predefined Tag Generators that help you with common chores; check the [`/lib/recipes/` folder](./lib/recipes/).

### Resource Hints

A recipe that allows to add [Resource Hints](https://pagespeedchecklist.com/resource-hints) to your site for any asset in the final build.

Example of [font preloading](https://wp-rocket.me/blog/font-preloading-best-practices/) to reduce CLS (Cumulative Layout Shift) and prevent FOIT (Flash of Invisible Text)/FOUT, or Flash of Unstyled Text:

```typescript
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { PluginHtmlTags, buildResourceHints } from 'vite-plugin-html-tags'

export default defineConfig({
  plugins: [
    PluginHtmlTags([
      react(),
      buildResourceHints([
        {
          files: "*.woff2",
          attrs: {
            crossorigin: true,
            rel: 'preload',
          },
        },
      ]),
    ]),
  ],
})

```

## TODO

- [ ] More documentation
- [ ] Tests
- [ ] More recipes

## License

[MIT](./LICENSE) ♥
