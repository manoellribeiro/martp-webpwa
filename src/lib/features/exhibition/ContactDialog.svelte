<script lang="ts">
	import { formatString, strings } from '#lib/strings.ts';
	import ExhibitionDialog from './ExhibitionDialog.svelte';
	import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from './links.ts';

	// Web-only: the exhibition's Contact link. One row per reason to write; the email ones open the
	// visitor's mail app with the subject (and what to tell) already filled in.

	let { onDismiss }: { onDismiss: () => void } = $props();

	function mailto(subject?: string, body?: string): string {
		const params = [
			subject && `subject=${encodeURIComponent(subject)}`,
			body && `body=${encodeURIComponent(body)}`
		].filter(Boolean);
		return `mailto:${CONTACT_EMAIL}${params.length ? `?${params.join('&')}` : ''}`;
	}

	const emailReasons = [
		{
			title: strings.contact_remove_art,
			description: strings.contact_remove_art_description,
			href: mailto(strings.contact_remove_art_subject, strings.contact_remove_art_body)
		},
		{
			title: strings.contact_report_problem,
			description: strings.contact_report_problem_description,
			href: mailto(strings.contact_report_problem_subject, strings.contact_report_problem_body)
		}
	];
</script>

<ExhibitionDialog title={strings.contact_action} {onDismiss}>
	<p class="intro">{strings.contact_description}</p>

	<ul class="reasons">
		{#each emailReasons as reason (reason.title)}
			<li>
				<a class="reason" href={reason.href}>
					<span class="reason-texts">
						<span class="reason-title">{reason.title}</span>
						<span class="reason-description">{reason.description}</span>
					</span>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
				</a>
			</li>
		{/each}
		<li class="reason">
			<span class="reason-texts">
				<span class="reason-title">{strings.contact_say_hi}</span>
				<span class="reason-description">{strings.contact_say_hi_description}</span>
				<span class="channels">
					<a href={mailto()}>{CONTACT_EMAIL}</a>
					<a href={INSTAGRAM_URL} target="_blank" rel="noopener">
						{formatString(strings.contact_on_instagram, INSTAGRAM_HANDLE)}
					</a>
				</span>
			</span>
		</li>
	</ul>
</ExhibitionDialog>

<style>
	.intro {
		margin: 0 0 8px;
	}

	.reasons {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.reasons li + li {
		border-top: 1px solid var(--exhibition-surface-border);
	}

	.reason {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 0;
		color: inherit;
		text-decoration: none;
	}

	.reason-texts {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.reason-title {
		color: var(--blue);
		font-weight: 700;
	}

	a.reason:hover .reason-title {
		text-decoration: underline;
	}

	.reason-description {
		font-size: 15px;
		line-height: 1.45;
	}

	.reason svg {
		flex: none;
		width: 18px;
		height: 18px;
		fill: none;
		stroke: var(--blue);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.channels {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
		padding-top: 6px;
	}

	.channels a {
		min-height: 32px;
		color: var(--green-darker);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
		overflow-wrap: anywhere;
	}
</style>
