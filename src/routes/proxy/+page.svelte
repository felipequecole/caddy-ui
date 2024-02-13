<script lang="ts">
	import { getModalStore, Table, tableMapperValues } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalStore, TableSource } from '@skeletonlabs/skeleton';
	import type { RouteDetails } from './+page';
	import { onMount } from 'svelte';

	type PageData = {
		routes: RouteDetails[];
	};

	export let data: PageData;
	let routes: RouteDetails[] = [];

	let routeTable: TableSource | undefined;

	$: routeTable = routes ? setTableSource() : undefined;
	$: console.log(data);

	// TODO: receive updates (maybe use a store)
	onMount(async () => {
		routes = data.routes;
	});

	async function updatePageData() {
		console.log('Refreshing data');
		const res = await fetch('/api/proxy');
		routes = await res.json();
	}

	// Todo handle multiple upstreams
	function setTableSource(): TableSource {
		console.log(JSON.stringify(routes), null, 2);
		return {
			head: ['id', 'Host', 'Address'],
			body: tableMapperValues(routes, ['id', 'host', 'upstreams']),
			meta: tableMapperValues(routes, ['id', 'host', 'upstreams']),
			foot: ['Total Elements', '', `<span class="badge variant-soft-primary">${routes ? routes.length : 0}</span>`]
		};
	}

	const modalStore: ModalStore = getModalStore();

	const newRouteModal: ModalSettings = {
		type: 'component',
		component: 'AddProxyModal',
		title: 'Add a new proxy',
		body: 'Insert your proxy configuration',
		async response(r) {
			console.log('Response', r);
			await fetch('/api/proxy', {
					method: 'POST',
					body: JSON.stringify(r.data),
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			await updatePageData();
		}
	};

	function openModal() {
		console.log('Opening modal');
		modalStore.clear();
		modalStore.trigger(newRouteModal);
	}

	function editRoute(row) {
		console.log('Editing route', row.detail);
		const route = routes.find((r) => r.id === row.detail[0]);
		console.log(route);
		const editModalSettings: ModalSettings = {
			type: 'component',
			component: 'AddProxyModal',
			title: 'Edit proxy',
			body: 'Edit your proxy configuration',
			async response(r) {
				const payload = r.data;
				console.log('Response', r);
				if (r.is_delete) {
					await fetch(`/api/proxy?id=${payload.id}`, {
							method: 'DELETE'
						}
					);
				} else {
					await fetch(`/api/proxy?id=${payload.id}`, {
							method: 'PUT',
							body: JSON.stringify(payload),
							headers: {
								'Content-Type': 'application/json'
							}
						}
					);
				}
				await updatePageData();
			},
			valueAttr: route
		};
		modalStore.trigger(editModalSettings);
	}


</script>

<div class="grid grid-cols-1 justify-items-center">
	<div class="w-3/5">
		{#if routeTable}
			<Table source={routeTable} interactive={true} on:selected={editRoute} />
		{/if}
	</div>
	<button type="button" class="btn variant-filled mt-10" on:click={openModal}>Add new proxy</button>
</div>


<!-- @component This example creates a simple form modal. -->

