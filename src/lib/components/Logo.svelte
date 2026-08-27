<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<!--
	Teenage Engineering-inspired: lowercase, monospaced, monochrome, no ornament.
	The mark is a single knob in a square — the smallest possible piece of hardware.
-->
<a href="/" class="group inline-flex items-center gap-3 {className}" aria-label="music.nodestar.se – start">
	<svg viewBox="0 0 24 24" class="h-6 w-6 shrink-0" aria-hidden="true">
		<rect x="0.75" y="0.75" width="22.5" height="22.5" rx="2" class="fill-none stroke-foreground" stroke-width="1.5" />
		<circle cx="12" cy="12" r="6.25" class="fill-foreground" />
		<!-- pointer: rotates on hover, like turning the knob -->
		<rect x="11.25" y="6.5" width="1.5" height="4.5" rx="0.75" class="fill-background origin-center transition-transform duration-500 ease-out group-hover:rotate-[120deg]" />
	</svg>
	<span class="font-mono text-[15px] leading-none tracking-tight lowercase">
		<span class="text-foreground">music</span><span class="text-muted-foreground">.nodestar.se</span>
	</span>
</a>
