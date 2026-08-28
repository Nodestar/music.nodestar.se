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
			'Åtta grundläggande reggaetrummönster på ett spelbart 16-stegs MIDI-rutnät, med noter och historik bakom varje.',
		tags: ['webaudio', 'reggae', 'midi', 'sequencer'],
		date: '2026-08-27'
	},
	{
		slug: 'version-excursion',
		no: 2,
		title: 'Version Excursion',
		description:
			'Ett dubmixerbord byggt från Messian Dreads tutorial: sex riddims, tre trumkit, percussion och fyra effektreturer.',
		tags: ['webaudio', 'dub', 'mixer', 'reggae'],
		date: '2026-08-27'
	},
	{
		slug: 'house-machine',
		no: 3,
		title: 'House Machine',
		description:
			'Fem housetrummönster från Studio Brootle – 707, 909, 606, en jazzsamplad loop och en konstig – lästa ur MIDI-filerna till ett spelbart 16-stegsrutnät.',
		tags: ['webaudio', 'house', 'midi', 'sequencer'],
		date: '2026-08-27'
	}
];

export function demoHref(d: Demo): string {
	return d.href ?? `/demos/${d.slug}/index.html`;
}

export function demoImage(d: Demo): string {
	return d.image ?? `/demos/${d.slug}/screenshot.png`;
}
