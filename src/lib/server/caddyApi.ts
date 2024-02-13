import { env } from '$env/dynamic/private' ;
import type { NewRoute, RouteDetails } from '../../routes/proxy/+page';


const api_url = env.CADDY_API_URL;

type CaddyResponse = {
	'@id': string,
	'listen': string[],
	'routes': CaddyRoute[]
}

type CaddyRoute = {
	'@id': string,
	'match': [
		{
			'host': string[]
		}
	],
	'handle': [
		{
			'handler': string,
			'upstreams': [
				{
					'dial': string
				}
			]
		}
	]
}


export async function getCurrentProxies(): Promise<CaddyRoute[]> {
	// TODO: consider other types
	const response = await fetch(`${api_url}/id/myservices`);
	const responseJson: CaddyResponse = await response.json();

	return responseJson.routes.filter((route) => route.handle?.some(handler => handler.handler === 'reverse_proxy'));
}

export async function updateProxy(id: string, route: NewRoute) {
	const upstreams = { 'dial': route.upstreams };
	const requestBody = {
		'@id': id,
		'match': [
			{
				'host': [route.host]
			}
		],
		'handle': [{
			'handler': 'reverse_proxy',
			'upstreams': [upstreams]
		}
		]
	};
	const serializedBody = JSON.stringify(requestBody);
	const response = await fetch(`${api_url}/id/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: serializedBody
	}).then(res => {
		console.log(res.status);
		if (res.status !== 200) {
			return res.json();
		}
		return res;
	});
	console.log(response);
}

export async function deleteProxy(id: string) {
	const response = await fetch(`${api_url}/id/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(res => {
		console.log(res.status);
		if (res.status !== 200) {
			return res.json();
		}
		return res;
	});
	console.log(response);
}

export async function addProxy(route: NewRoute): Promise<void> {
	console.log('Adding new proxy');
	const upstreams = { 'dial': route.upstreams };
	const requestBody = {
		'@id': route.id,
		'match': [
			{
				'host': [route.host]
			}
		],
		'handle': [{
			'handler': 'reverse_proxy',
			'upstreams': [upstreams]
		}
		]
	};
	const serializedBody = JSON.stringify(requestBody);
	// todo return error
	await fetch(`${api_url}/id/myservices/routes/-1`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: serializedBody
	}).then(res => {
		console.log(res.status);
		if (res.status !== 200) {
			return res.json();
		}
		return res;
	});
}

