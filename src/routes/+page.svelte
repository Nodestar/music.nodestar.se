<script lang="ts">
	import { demos, demoHref, demoImage } from '$lib/demos';
	import Logo from '$lib/components/Logo.svelte';

	const sorted = [...demos].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<svelte:head>
	<title>music.nodestar.se – musikvisualiseringar</title>
	<meta name="description" content="Demos av musikvisualiseringar." />
</svelte:head>

<div class="min-h-svh bg-background font-mono text-foreground lowercase antialiased">
	<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
		<Logo />
		<nav class="flex gap-6 text-sm text-muted-foreground">
			<a
				href="https://github.com/Nodestar/music.nodestar.se"
				target="_blank"
				rel="noreferrer"
				class="transition-colors hover:text-foreground"
			>
				github
			</a>
		</nav>
	</header>

	<main class="mx-auto max-w-6xl px-6 pb-24">
		<section class="grid gap-6 border-b border-border py-16 md:grid-cols-[1fr_2fr]">
			<h1 class="text-sm text-muted-foreground">musikvisualiseringar</h1>
			<p class="max-w-2xl text-xl leading-snug tracking-tight sm:text-2xl">
				experiment med ljud, rytm och grafik. klicka på en demo för att öppna den.
			</p>
		</section>

		{#if sorted.length === 0}
			<p class="py-16 text-sm text-muted-foreground">inga demos ännu.</p>
		{:else}
			<section class="grid gap-x-8 gap-y-14 py-14 sm:grid-cols-2 lg:grid-cols-3">
				{#each sorted as demo, i (demo.slug)}
					<a
						href={demoHref(demo)}
						class="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
					>
						<div class="aspect-video w-full overflow-hidden border border-border bg-muted">
							<img
								src={demoImage(demo)}
								alt="skärmdump av {demo.title}"
								loading="lazy"
								class="h-full w-full object-cover grayscale-[.25] transition duration-300 group-hover:grayscale-0"
							/>
						</div>
						<div class="mt-4 flex items-baseline justify-between gap-4 text-sm">
							<span class="flex items-baseline gap-3">
								<span class="text-muted-foreground">{pad(i + 1)}</span>
								<span class="text-foreground underline decoration-transparent underline-offset-4 transition group-hover:decoration-foreground">{demo.title}</span>
							</span>
							{#if demo.date}
								<time datetime={demo.date} class="shrink-0 text-muted-foreground">{demo.date}</time>
							{/if}
						</div>
						<p class="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{demo.description}</p>
						{#if demo.tags?.length}
							<p class="mt-3 text-xs text-muted-foreground">
								{#each demo.tags as tag, j (tag)}<span>{tag}</span>{#if j < demo.tags.length - 1}<span class="mx-2 opacity-50">/</span>{/if}{/each}
							</p>
						{/if}
					</a>
				{/each}
			</section>
		{/if}
	</main>

	<footer class="mx-auto flex max-w-6xl justify-between border-t border-border px-6 py-8 text-xs text-muted-foreground">
		<span>© {new Date().getFullYear()} nodestar</span>
		<span>{pad(sorted.length)} demos</span>
	</footer>
</div>
