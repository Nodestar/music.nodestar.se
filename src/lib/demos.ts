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
	/** Löpnummer, stabilt över tid: äldsta demot är 1, nya får nästa lediga. */
	no: number;
	title: string;
	description: string;
	/** Absolut eller relativ URL till demon. Default: `/demos/<slug>/index.html` */
	href?: string;
	/** Bild-URL. Default: `/demos/<slug>/screenshot.png` */
	image?: string;
	tags?: string[];
	/** ISO-datum, t.ex. 2026-08-27 */
	date?: string;
};

export const demos: Demo[] = [
	{
		slug: 'one-drop-machine',
		no: 1,
		title: 'One Drop Machine',
		description:
			'Eight foundation reggae drum patterns on a playable 16-step MIDI grid, with the notes and history behind each one.',
		tags: ['webaudio', 'reggae', 'midi', 'sequencer'],
		date: '2026-08-27'
	},
	{
		slug: 'version-excursion',
		no: 2,
		title: 'Version Excursion',
		description:
			"A dub mixing desk built from Messian Dread's tutorial: six riddims, three drum kits, percussion and four effect returns.",
		tags: ['webaudio', 'dub', 'mixer', 'reggae'],
		date: '2026-08-27'
	},
	{
		slug: 'house-machine',
		no: 3,
		title: 'House Machine',
		description:
			'Five house drum patterns from Studio Brootle – 707, 909, 606, a jazz-sampled loop and a weird one – read from the MIDI files onto a playable 16-step grid.',
		tags: ['webaudio', 'house', 'midi', 'sequencer'],
		date: '2026-08-27'
	},
	{
		slug: 'instant-haus-web',
		no: 4,
		title: 'Instant Haus Web',
		description:
			"Alexkid's Max for Live device rebuilt in the browser: 96 patterns read straight out of the .amxd file, four tracks with per-track swing, shift and velocity — plus MIDI out.",
		tags: ['webaudio', 'webmidi', 'house', 'maxforlive', 'sequencer'],
		date: '2026-09-01'
	}
];

export function demoHref(d: Demo): string {
	return d.href ?? `/demos/${d.slug}/index.html`;
}

export function demoImage(d: Demo): string {
	return d.image ?? `/demos/${d.slug}/screenshot.png`;
}
