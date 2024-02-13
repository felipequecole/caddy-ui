import { addProxy, deleteProxy, getCurrentProxies, updateProxy } from '$lib/server/caddyApi';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(): Promise<Response> {
	// TODO handle multiple upstreams
	console.log('GET /api/proxy');
	const proxies = await getCurrentProxies();
	console.log(proxies);
	const proxiesData = proxies.map((proxy) => {
		return {
			id: proxy['@id'],
			host: proxy.match?.[0]?.host?.[0],
			upstreams: proxy?.handle?.[0]?.upstreams?.[0]?.dial
		};
	});
	return new Response(JSON.stringify(proxiesData), { status: 200 });
}

export async function PUT(requestEvent: RequestEvent): Promise<Response> {
	const routeId = requestEvent.url?.searchParams?.get('id');
	if (routeId) {
		const route = await requestEvent.request.json();
		await updateProxy(routeId, route);
	}

	return new Response(null, { status: 200 });
}

export async function DELETE(requestEvent: RequestEvent): Promise<Response> {
	const routeId = requestEvent.url?.searchParams?.get('id');
	if (routeId) {
		await deleteProxy(routeId);
	}

	return new Response(null, { status: 200 });
}

export async function POST(requestEvent: RequestEvent): Promise<Response> {
	const route = await requestEvent.request.json();
	await addProxy(route);
	return new Response(null, { status: 201 });
}