import { Application, Cookies, Router, helpers } from "https://deno.land/x/oak/mod.ts";

import { viewEngine, oakAdapter, denjuckEngine } from "https://deno.land/x/view_engine@v10.5.1c/mod.ts";


import { Utilities, MymiddleWare } from "./utilities/authorization.ts"



import { User, Article, initDB } from "./dao.ts";

import { HomeCtr } from "./controller/home.ts";


const key = await crypto.subtle.generateKey(
	{ name: "HMAC", hash: "SHA-512" },
	true,
	["sign", "verify"],
);


initDB();



const router = new Router();


router.get("/public/:filename*", async (ctx) => {
	const url = await ctx.params.filename;
	await ctx.send({
		root: `${Deno.cwd()}/public`,
		path: `/${url}`
	});
});

HomeCtr.index(router);
HomeCtr.register(router);
HomeCtr.reg(router);
HomeCtr.loginPage(router);
HomeCtr.login(router);
HomeCtr.add(router);
HomeCtr.postadd(router);
HomeCtr.viewArticle(router);


router.get("/", (ctx) => {
	ctx.response.redirect("/1");
})


router.get("/test", async (ctx) => {
	console.log(key);
	const jwt = await Utilities.generateJWT({ id: 10 });
	const cookie = new Cookies(ctx.request, ctx.response);
	cookie.set("token", jwt);
	ctx.response.body = `ok:${jwt}`;
})





const app = new Application();
app.use(
	viewEngine(oakAdapter, denjuckEngine, {
		viewRoot: "./views/",
	})
);
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 5000 });