<script lang="ts">
	import { demos, demoHref, demoImage } from '$lib/demos';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Logo from '$lib/components/Logo.svelte';

	const sorted = [...demos].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
</script>

<svelte:head>
	<title>music.nodestar.se – musikvisualiseringar</title>
	<meta name="description" content="Demos av musikvisualiseringar." />
</svelte:head>

<div class="min-h-svh bg-background text-foreground">
	<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
		<Logo />
		<a
			href="https://github.com/Nodestar/music.nodestar.se"
			target="_blank"
			rel="noreferrer"
			class="font-mono text-sm lowercase text-muted-foreground transition-colors hover:text-foreground"
		>
			github
		</a>
	</header>

	<main class="mx-auto max-w-6xl px-6 pb-24">
		<section class="py-10">
			<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Musikvisualiseringar</h1>
			<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
				En samling experiment med ljud, rytm och grafik. Klicka på en demo för att öppna den.
			</p>
		</section>

		{#if sorted.length === 0}
			<p class="text-muted-foreground">Inga demos ännu.</p>
		{:else}
			<section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each sorted as demo (demo.slug)}
					<a href={demoHref(demo)} class="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<Card.Root class="h-full overflow-hidden py-0 transition-colors group-hover:border-foreground/30">
							<div class="aspect-video w-full overflow-hidden bg-muted">
								<img
									src={demoImage(demo)}
									alt="Skärmdump av {demo.title}"
									loading="lazy"
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
								/>
							</div>
							<Card.Header class="pb-4 pt-4">
								<Card.Title class="flex items-center justify-between gap-2">
									<span>{demo.title}</span>
									{#if demo.date}
										<time datetime={demo.date} class="text-xs font-normal text-muted-foreground">{demo.date}</time>
									{/if}
								</Card.Title>
								<Card.Description>{demo.description}</Card.Description>
							</Card.Header>
							{#if demo.tags?.length}
								<Card.Footer class="flex flex-wrap gap-2 pb-4">
									{#each demo.tags as tag (tag)}
										<Badge variant="secondary">{tag}</Badge>
									{/each}
								</Card.Footer>
							{/if}
						</Card.Root>
					</a>
				{/each}
			</section>
		{/if}
	</main>

	<footer class="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
		© {new Date().getFullYear()} Nodestar
	</footer>
</div>
