/**
 * Lista över demos som visas i gridet på startsidan.
 *
 * Varje demo är en fristående statisk sida/app som ligger under
 * `static/demos/<slug>/` (byggs utanför SvelteKit, t.ex. i en annan
 * Claude-instans). Lägg en skärmdump på `static/demos/<slug>/screenshot.png`
 * (1600×900 rekommenderas) och registrera demon här.
 */
export type Demo = {
	slug: string;
	title: string;
	description: string;
	/** Absolut eller relativ URL till demon. Default: `/demos/<slug>/` */
	href?: string;
	/** Bild-URL. Default: `/demos/<slug>/screenshot.png` */
	image?: string;
	tags?: string[];
	/** ISO-datum, t.ex. 2026-08-27 */
	date?: string;
};

export const demos: Demo[] = [
	{
		slug: 'example',
		title: 'Exempeldemo',
		description: 'Placeholder – byt ut mot din första visualisering.',
		tags: ['placeholder'],
		image: '/demos/example/screenshot.svg',
		date: '2026-08-27'
	}
];

export function demoHref(d: Demo): string {
	return d.href ?? `/demos/${d.slug}/`;
}

export function demoImage(d: Demo): string {
	return d.image ?? `/demos/${d.slug}/screenshot.png`;
}
