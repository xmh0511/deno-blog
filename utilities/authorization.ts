// deno-lint-ignore-file no-namespace
import { ensureFile } from "https://deno.land/std@0.148.0/fs/mod.ts";

import { create, verify } from "https://deno.land/x/djwt@v2.7/mod.ts";

import { Cookies, helpers } from "https://deno.land/x/oak/mod.ts";

import { User } from "../model/model.ts";


async function genereateKey(): Promise<CryptoKey> {
	const file = Deno.openSync("./key.conf", { read: true, write: true, create: true });
	const buff = new Uint8Array(1024);
	const size = file.readSync(buff);
	//console.log("size: ", size);
	if (size === 0 || size === null) {
		const secretKey = await crypto.subtle.generateKey(
			{ name: "HMAC", hash: "SHA-512" },
			true,
			["sign", "verify"],
		);
		const exportKey = await crypto.subtle.exportKey("jwk", secretKey);
		const str = JSON.stringify(exportKey);
		const res = new TextEncoder().encode(str);
		file.writeSync(res);
		return secretKey;
	} else {
		const actualBuff = buff.slice(0, size as number);
		const jsonStr = new TextDecoder().decode(actualBuff);
		const json = JSON.parse(jsonStr) as JsonWebKey;
		const secretKey = await crypto.subtle.importKey("jwk", json, { name: "HMAC", hash: "SHA-512" }, true, ["sign", "verify"]);
		return secretKey;
	}
}

const secretKey = await genereateKey();
// console.log(secretKey);

// const secretKey = await crypto.subtle.generateKey(
// 	{ name: "HMAC", hash: "SHA-512" },
// 	true,
// 	["sign", "verify"],
// );

// const exportKey = await crypto.subtle.exportKey("jwk", secretKey);
// const str = JSON.stringify(exportKey);
// const res = new TextEncoder().encode(str);
// Deno.writeFileSync("./key.conf",new Uint8Array(res));






export namespace Utilities {
	export async function generateJWT(data: any): Promise<string> {
		return await create({ alg: "HS512", typ: "JWT" }, { auth: true, data }, secretKey);
	}

	export async function getInfoFromJWT(jwt: string): Promise<any> {
		return await verify(jwt, secretKey);
	}
}

export namespace MymiddleWare {
	export async function authorized(ctx: any, next: any) {
		try {
			const cookie = new Cookies(ctx.request, ctx.response);
			const token = await cookie.get("token");
			//console.log("line 70 ", token)
			if (token === null || token === undefined) {
				ctx.render("404.html", { message: "无效身份" });
				ctx.response.status = 401;
				return;
			}
			const data = await Utilities.getInfoFromJWT(token);
			if (data.auth === true) {
				ctx.state.userData = data;
				await next(data);
				delete ctx.state.userData;
			} else {
				ctx.render("404.html", { message: "无效身份" });
				ctx.response.status = 401;
			}
		} catch (e) {
			ctx.render("404.html", { message: e });
			ctx.response.status = 401;
		}
	}

	export async function authorizedWithJson(ctx: any, next: any) {
		try {
			const cookie = new Cookies(ctx.request, ctx.response);
			const token = await cookie.get("token");
			if (token === null || token === undefined) {
				ctx.response.body = { code: 401, msg: "无效身份" };
				ctx.response.status = 401;
				return;
			}
			const data = await Utilities.getInfoFromJWT(token);
			if (data.auth === true) {
				const user = await User.where("id", data.data.id).select("*").all();
				if (user.length > 0) {
					ctx.state.userData = data;
					await next(data);
					delete ctx.state.userData;
				} else {
					ctx.response.body = { code: 401, msg: "无效身份" };
					ctx.response.status = 401;
				}
			} else {
				ctx.response.body = { code: 401, msg: "无效身份" };
				ctx.response.status = 401;
			}
		} catch (e) {
			ctx.response.body = { code: 401, msg: "无效身份" };
			ctx.response.status = 401;
		}
	}

	export async function hasformbody(ctx: any, next: any) {
		if (ctx.request.hasBody) {
			const form = await ctx.request.body();
			console.log(form, next);
			if (form.type === "form") {
				await next();
			} else {
				ctx.response.body = { code: 401, msg: "无效请求" };
			}
		}
	}
}