import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			prerender: {
				// Demos live in static/demos/<slug>/ and are copied as-is; the crawler can't see them.
				handleHttpError: ({ path, message }) => {
					if (path.startsWith('/demos/')) return;
					throw new Error(message);
				}
			},
			// Static build → build/ (plain HTML/CSS/JS, no Node needed on the server)
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: undefined,
				precompress: false,
				strict: true
			})
		})
	]
});
