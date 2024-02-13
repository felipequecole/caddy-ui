<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalStore, ModalSettings } from '@skeletonlabs/skeleton';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore: ModalStore = getModalStore();
	let modalValue: ModalSettings | undefined = undefined;
	let isEdit: boolean = false;

	let formData = {
		id: crypto.randomUUID().toString(),
		host: 'example.com',
		upstreams: '192.168.0.1:8080'
	};

	$: console.log(modalValue);
	$: formData = modalValue?.valueAttr ?? formData;
	$: isEdit = !!modalValue?.valueAttr;

	onMount(() => {
		console.log('Modal Form Mounted');
		modalStore.subscribe((value) => {
			console.log('Modal Form Store:', value);
			modalValue = value[0];
		});
	});

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response({ 'is_delete': false, 'data': formData });
		modalStore.close();
	}

	function onDelete(): void {
		if ($modalStore[0].response) $modalStore[0].response({ 'is_delete': true, 'data': formData });
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold text-center';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<form class="modal-form {cForm}">
			<label class="label">
				<span>Id</span>
				<input
					class="input"
					type="text"
					bind:value={formData.id}
					placeholder="Enter name..."
					disabled="{isEdit}"
				/>
			</label>
			<label class="label">
				<span>Match Host</span>
				<input class="input" type="text" bind:value={formData.host} placeholder="Enter phone..." />
			</label>
			<hr class="!border-t-2" />
			<p class="text-center">Upstreams</p>
			<!--{#each formData.upstreams as addr, i}-->
			<!--TODO: add button to be able to add more upstreams-->
			<label class="label">
				<span>Address</span>
				<input id="addr" class="input" type="text" bind:value={formData.upstreams}
							 placeholder="Enter email address..." />
			</label>
			<!--{/each}-->
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			{#if isEdit}
				<button class="btn variant-filled-error" on:click={onDelete}>Delete Route</button>
			{/if}
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Submit Form</button>
		</footer>
	</div>
{/if}
