export type NewRoute = {
	id: string,
	host: string,
	upstreams: string
};

export type RouteDetails = {
	id: string,
	host: string,
	upstreams: string[]
}

import { error } from '@sveltejs/kit';


/** @type {import('./$types').PageData} */
export async function load(event) {
	const routes = await event.fetch('/api/proxy', {
		method: 'GET'
	})
		.then(res => res.json());

	if (routes) {
		return { 'routes': routes };
	}

	error(404, 'Not found');
}