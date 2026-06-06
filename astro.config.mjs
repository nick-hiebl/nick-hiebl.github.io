// @ts-check

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
    site: 'http://site.jumpoy.com',
    integrations: [mdx(), sitemap(), react()],
    build: {
        assets: 'assets',
    },
})
