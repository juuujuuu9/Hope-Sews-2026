// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: vercel(),
	vite: {
		plugins: [tailwindcss()],
		server: {
			cors: true,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': '*',
			},
		},
	},
	devToolbar: {
		enabled: false,
	},
	security: {
		checkOrigin: false,
	},
	server: {
		allowedHosts: 'all',
	},
});
