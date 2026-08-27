<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<a href="/" class="group inline-flex items-center gap-2.5 {className}" aria-label="music.nodestar.se – start">
	<svg
		viewBox="0 0 32 32"
		class="h-8 w-8 shrink-0"
		aria-hidden="true"
	>
		<rect x="1" y="1" width="30" height="30" rx="8" class="fill-foreground" />
		<!-- five bars: a waveform frozen mid-beat -->
		<g class="fill-background">
			<rect x="6" y="14" width="3" height="8" rx="1.5" />
			<rect x="11" y="9" width="3" height="18" rx="1.5" class="origin-center transition-transform duration-300 group-hover:scale-y-[1.12]" />
			<rect x="16" y="5" width="3" height="26" rx="1.5" class="origin-center transition-transform duration-300 group-hover:scale-y-[0.85]" />
			<rect x="21" y="11" width="3" height="14" rx="1.5" class="origin-center transition-transform duration-300 group-hover:scale-y-[1.2]" />
			<rect x="26" y="15" width="3" height="6" rx="1.5" />
		</g>
	</svg>
	<span class="flex items-baseline font-semibold tracking-tight leading-none">
		<span class="text-lg">music</span>
		<span class="text-lg text-muted-foreground">.nodestar.se</span>
	</span>
</a>
