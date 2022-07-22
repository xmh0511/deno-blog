import { Application, Cookies, Router, helpers, BodyForm, BodyFormData, FormDataFile } from "https://deno.land/x/oak/mod.ts";

import { viewEngine, oakAdapter, denjuckEngine } from "https://deno.land/x/view_engine@v10.5.1c/mod.ts";


import { Utilities, MymiddleWare } from "./utilities/authorization.ts";

import { ensureDirSync, moveSync } from "https://deno.land/std@0.149.0/fs/mod.ts";

import { basename } from "https://deno.land/std@0.149.0/path/mod.ts";





import { initDB } from "./dao.ts";

import { HomeCtr } from "./controller/home.ts";
import { move } from "https://deno.land/std@0.148.0/fs/move.ts";


ensureDirSync("./public/upload");



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
HomeCtr.articleList(router);
HomeCtr.editArticle(router);
HomeCtr.postEdit(router);
HomeCtr.deleteArticle(router);
HomeCtr.postComment(router);
HomeCtr.delComment(router);
HomeCtr.commentedit(router);
HomeCtr.postCommentEdit(router);
HomeCtr.personEdit(router);
HomeCtr.saveAvatar(router);


router.get("/", (ctx) => {
	ctx.response.redirect("/home/1");
})

router.get("/home", (ctx) => {
	ctx.response.redirect("/home/1");
})

router.get("/list", (ctx) => {
	ctx.response.redirect("/list/1");
})


const baseUrl = "/";

router.post("/upload", MymiddleWare.authorized, async (ctx) => {
	try {
		if (ctx.request.hasBody) {
			const body = ctx.request.body() as BodyFormData;
			const value = await body.value;
			const res = [];
			for await (const [name, data] of value.stream()) {
				name;
				const file = data as FormDataFile;
				//console.log(file, Deno.cwd());
				if (file.name !== undefined) {
					const filepath = file.filename as string;
					const filename = basename(filepath);
					await move(file.filename as string, `${Deno.cwd()}/public/upload/${filename}`);
					res.push({ error: 0, url: `${baseUrl}./public/upload/${filename}`, name: filename });
				} else {
					ctx.response.body = { error: "无效请求" };
					break;
				}
			}
			if (res.length !== 0) {
				ctx.response.body = res;
			}
		}
	} catch (e) {
		ctx.response.body = { error: e };
	}
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