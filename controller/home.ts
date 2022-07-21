// deno-lint-ignore-file
import { Message } from "https://deno.land/std@0.104.0/hash/hasher.ts";
import { BodyForm, Cookies, Router } from "https://deno.land/x/oak/mod.ts";

import { Md5 } from "https://raw.githubusercontent.com/denoland/deno_std/main/hash/md5.ts";

import { MymiddleWare, Utilities } from "../utilities/authorization.ts";

import { Article, Comment, Level, Tag, User } from "../model/model.ts";
import { Model } from "https://raw.githubusercontent.com/xmh0511/denodb/master/mod.ts";

import { format } from "https://deno.land/std@0.148.0/datetime/mod.ts";

async function userHasExist(
	name: string,
): Promise<{ exist: boolean; result: Model | undefined }> {
	try {
		//console.log("find", name);
		const user = await User.where("name", name).select("*").all();
		//console.log(user);
		if (user.length > 0) {
			return { exist: true, result: user[0] };
		}
		return { exist: false, result: undefined };
	} catch (e) {
		return { exist: false, result: undefined };
	}
}

export namespace HomeCtr {
	export function index(router: Router<Record<string, any>>) {
		router.get("/home/:page", async (ctx) => {
			try {
				const cookie = new Cookies(ctx.request, ctx.response);
				const token = await cookie.get("token");
				//console.log("token:", token);
				const count = 10;
				const page = await ctx.params.page;
				const pageNumber = parseInt(page as string) >= 1 ? parseInt(page) : 1;
				const total = await Article.count();
				const articles = await Article.select(
					"article_tb.title",
					"article_tb.id",
					"article_tb.create_time",
					"article_tb.update_time",
					"tag_tb.name as tagName",
					"user_tb.name as userName",
				).join(Tag, Tag.field("id"), Article.field("tag_id")).join(
					User,
					User.field("id"),
					Article.field("user_id"),
				).offset((pageNumber - 1) * count).limit(count).get();
				//console.log(articles);
				if (token !== null && token !== undefined && token !== "") {
					//console.log("true");
					const data = await Utilities.getInfoFromJWT(token as string);
					const postCount = await Article.where("user_id", data.data.id).select(
						"*",
					).all();
					await ctx.render("home.html", {
						login: true,
						data: data,
						post_count: postCount.length,
						articles,
						page,
						total,
						format,
					});
				} else {
					//console.log("abc");
					await ctx.render("home.html", {
						login: false,
						articles,
						page,
						total,
						format,
					});
				}
			} catch (e) {
				//console.log(e);
				await ctx.render("home.html", { login: false });
			}
		});
	}

	export function register(router: Router<Record<string, any>>) {
		router.get("/register", async (ctx) => {
			await ctx.render("reg.html");
		});
	}

	export function loginPage(router: Router<Record<string, any>>) {
		router.get("/login", async (ctx) => {
			await ctx.render("login.html");
		});
	}

	export function login(router: Router<Record<string, any>>) {
		router.post("/login", async (ctx) => {
			try {
				if (ctx.request.hasBody) {
					const form = await ctx.request.body() as BodyForm;
					const formData = await form.value;
					const nickName = formData.get("nickName");
					const pass = formData.get("password");
					const hasExist = await userHasExist(nickName as string);
					//console.log(hasExist);
					if (hasExist.exist === false) {
						ctx.response.body = { code: 404, msg: "不存在该用户" };
					} else {
						const data = hasExist.result;
						//console.log(data);
						const hash = new Md5().update(pass as Message);
						if (hash.toString() === data?.password) {
							const jwt = await Utilities.generateJWT({
								name: data?.name,
								id: data?.id,
								level: data?.privilege,
							});
							ctx.response.body = { code: 200, msg: "登录成功", token: jwt };
						} else {
							ctx.response.body = { code: 400, msg: "用户名或密码错误" };
						}
						//ctx.response.body = { code: 200, msg: "注册成功", token: jwt };
					}
				} else {
					ctx.response.body = { code: 400, msg: "无效请求" };
				}
			} catch (e) {
				ctx.response.body = { code: 400, msg: e };
			}
		});
	}

	export function reg(router: Router<Record<string, any>>) {
		router.post("/reg", async (ctx) => {
			try {
				if (ctx.request.hasBody) {
					const form = await ctx.request.body() as BodyForm;
					const formData = await form.value;
					const nickName = formData.get("nickName");
					const pass = formData.get("password");
					const hasExist = await userHasExist(nickName as string);
					//console.log(hasExist);
					if (hasExist.exist === false) {
						const user = new User();
						const hash = new Md5().update(pass as Message);
						user.name = nickName;
						user.password = hash.toString();
						user.privilege = 1;
						const current = new Date();
						user.create_time = current;
						user.update_time = current;
						const r = await user.save();
						const jwt = await Utilities.generateJWT({
							name: r.name,
							id: r.lastInsertId,
							level: r.privilege,
						});
						ctx.response.body = { code: 200, msg: "注册成功", token: jwt };
					} else {
						ctx.response.body = { code: 404, msg: "该用户名已注册" };
					}
					// console.log(r.lastInsertId);
				} else {
					ctx.response.body = { code: 404, msg: "无效请求" };
				}
			} catch (e) {
				//console.log(e);
			}
		});
	}

	export function add(router: Router<Record<string, any>>) {
		router.get("/add", MymiddleWare.authorized, async (ctx) => {
			//const user = ctx.state.userData.data;
			try {
				const tags = await Tag.select("*").all();
				const levels = await Level.select("*").all();
				await ctx.render("add.html", { tags, levels });
			} catch (e) {
				//console.log(e);
			}
		});
	}

	export function postadd(router: Router<Record<string, any>>) {
		router.post(
			"/add",
			MymiddleWare.authorizedWithJson,
			MymiddleWare.hasformbody,
			async (ctx) => {
				try {
					//console.log("evaluation");
					const user = ctx.state.userData.data;
					const form = ctx.request.body() as BodyForm;
					const formData = await form.value;
					//console.log("formData: ", formData);
					const title = formData.get("title");
					const tag = formData.get("tag");
					const content = formData.get("content");
					const level = formData.get("level");
					if (title === "" || tag === "" || content === "" || level === "") {
						ctx.response.body = { code: 200, msg: "提交完整信息" };
						return;
					}
					const article = new Article();
					article.user_id = user.id;
					article.create_time = new Date();
					article.update_time = new Date();
					article.content = content;
					article.title = title;
					article.level = level;
					article.tag_id = tag;
					await article.save();
					ctx.response.body = { code: 200, msg: "ok" };
				} catch (e) {
					//console.log(e);
					ctx.response.body = { code: 400, msg: "error" };
				}
			},
		);
	}

	export function viewArticle(router: Router<Record<string, any>>) {
		router.get("/article/:id", async (ctx) => {
			const equal = (a: number, b: number) => {
				console.log(a, b)
				return a === b;
			}
			try {
				const id = await ctx.params.id;
				const article = await Article.select(
					"article_tb.id",
					"article_tb.level",
					"article_tb.content",
					"article_tb.title",
					"article_tb.create_time",
					"article_tb.update_time",
					"user_tb.name as userName",
				).join(User, User.field("id"), Article.field("user_id")).where(
					"article_tb.id",
					id,
				).get() as Model[];
				//console.log("line 244 ",article);
				const comments = await Comment.select(
					"comment_tb.id",
					"comment_tb.comment",
					"comment_tb.user_id",
					"comment_tb.update_time",
					"comment_tb.create_time",
					"user_tb.name as userName",
					"user_tb.privilege as level",
				).join(User, Comment.field("user_id"), User.field("id")).where("article_id", id).get();
				let currentData = { data: { id: -1, level: -1 } };
				try {
					const cookie = new Cookies(ctx.request, ctx.response);
					const token = await cookie.get("token");
					currentData = await Utilities.getInfoFromJWT(token as string);
				} catch (err) {
					//console.log("line 260")
					currentData = { data: { id: -1, level: -1 } };
				}
				//console.log(currentData);
				//console.log("262 line");
				if (article.length === 0) {
					ctx.render("404.html", { code: 404, msg: "文章不存在" });
					ctx.response.status = 404;
				} else {
					const info = article[0];
					console.log("line 270 ", info.level)
					if (info.level === 1) {
						console.log("270 line")
						ctx.render("article.html", { info, format, comments, equal, currentId: currentData.data?.id });
					} else {
						// const cookie = new Cookies(ctx.request, ctx.response);
						// const jwt = await cookie.get("token");
						// const data = await Utilities.getInfoFromJWT(jwt as string);
						if (currentData.data?.level < (info.level as number)) {
							ctx.render("404.html", { code: 404, msg: "没有阅读权限" });
							ctx.response.status = 404;
						} else {
							ctx.render("article.html", {
								info,
								format,
								comments,
								equal,
								currentId: currentData.data?.id
							});
						}
					}
				}
			} catch (e) {
				console.log("line 292 ", e);
				ctx.render("404.html", { code: 404, msg: e });
				ctx.response.status = 500;
			}
		});
	}

	export function articleList(router: Router<Record<string, any>>) {
		router.get("/list/:page", MymiddleWare.authorized, async (ctx) => {
			try {
				const user = ctx.state.userData.data;
				const count = 10;
				const page = parseInt(ctx.params.page) >= 1
					? parseInt(ctx.params.page)
					: 1;
				const articles = await Article.select(
					"article_tb.id",
					"article_tb.title",
					"article_tb.create_time",
					"tag_tb.name as tagName",
				).join(Tag, Tag.field("id"), Article.field("tag_id")).where(
					"user_id",
					user.id,
				).offset((page - 1) * count).limit(count).get();
				const total = await Article.where("user_id", user.id).count();
				//console.log(articles);
				await ctx.render("list.html", {
					login: true,
					data: ctx.state.userData,
					post_count: total,
					articles,
					page,
					total,
					format,
				});
			} catch (e) {
				await ctx.render("404.html", { code: 404, msg: e });
			}
		});
	}

	export function editArticle(router: Router<Record<string, any>>) {
		router.get("/edit/:id", MymiddleWare.authorized, async (ctx) => {
			const equal = (a: number, b: number) => {
				//console.log(a, b);
				return a === b;
			};
			try {
				const user = ctx.state.userData.data;
				const articleId = ctx.params.id;
				const article = await Article.where({
					"id": articleId,
					"user_id": user.id,
				}).select("*").get() as Model[];
				const tags = await Tag.select("*").get();
				const levels = await Level.select("*").get();
				//console.log(article);
				if (article.length > 0) {
					ctx.render("edit.html", { article: article[0], tags, levels, equal });
				} else {
					ctx.render("404.html", { code: 404, msg: "改文章不存在" });
					ctx.response.status = 404;
				}
			} catch (e) {
				ctx.render("404.html", { code: 404, msg: e });
			}
		});
	}

	export function postEdit(router: Router<Record<string, any>>) {
		router.post("/edit", MymiddleWare.authorizedWithJson, async (ctx) => {
			try {
				if (ctx.request.hasBody) {
					const body = ctx.request.body() as BodyForm;
					const form = await body.value;
					const id = form.get("id");
					const title = form.get("title");
					const tag = form.get("tag");
					const content = form.get("content");
					const level = form.get("level");
					if (
						id === "" || title === "" || tag === "" || content === "" ||
						level === ""
					) {
						ctx.response.body = { code: 400, msg: "提交完整信息" };
						return;
					}
					const user = ctx.state.userData.data;
					const articleArr = await Article.where({
						"id": id,
						"user_id": user.id,
					}).select("*").get() as Model[];
					console.log(articleArr);
					if (articleArr.length > 0) {
						const article = articleArr[0];
						article.update_time = new Date();
						article.content = content;
						article.title = title;
						article.level = level;
						article.tag_id = tag;
						await article.update();
						ctx.response.body = { code: 200, msg: "ok" };
					} else {
						ctx.response.body = { code: 400, msg: "不存在该文章" };
					}
				}
			} catch (e) {
				console.log(e);
				ctx.response.body = { code: 500, msg: e };
			}
		});
	}

	export function deleteArticle(router: Router<Record<string, any>>) {
		router.post("/delete/:id", MymiddleWare.authorizedWithJson, async (ctx) => {
			try {
				const user = ctx.state.userData.data;
				const id = ctx.params.id;
				const count = await Article.where({ "id": id, "user_id": user.id })
					.count();
				if (count === 1) {
					const r = await Article.deleteById(id);
					ctx.response.body = { code: 200, msg: "删除成功" };
				} else {
					ctx.response.body = { code: 400, msg: "不存在该文章" };
				}
			} catch (e) {
				ctx.response.body = { code: 400, msg: e };
			}
		});
	}

	export function postComment(router: Router<Record<string, any>>) {
		router.post(
			"/comment/:id",
			MymiddleWare.authorizedWithJson,
			async (ctx) => {
				try {
					const user = ctx.state.userData.data;
					const articleId = ctx.params.id;
					console.log(articleId, user.level);
					const count = await Article.where({ id: articleId }).where(
						"level",
						"<=",
						user.level,
					).count();
					console.log(count);
					if (count > 0) {
						const body = ctx.request.body() as BodyForm;
						const form = await body.value;
						const comment = form.get("comment");
						const info = new Comment();
						info.create_time = new Date();
						info.update_time = new Date();
						info.article_id = articleId;
						info.user_id = user.id;
						info.comment = comment;
						await info.save();
						ctx.response.body = { code: 200, msg: "提交成" };
					} else {
						ctx.response.body = { code: 400, msg: "评论失败" };
					}
				} catch (e) {
					ctx.response.body = { code: 500, msg: e };
				}
			},
		);
	}


	export function delComment(router: Router<Record<string, any>>) {
		router.post("/delcomment/:id", MymiddleWare.authorizedWithJson, async (ctx) => {
			try {
				const user = ctx.state.userData.data;
				const id = ctx.params.id;
				const count = await Comment.where({ "id": id, "user_id": user.id })
					.count();
				if (count === 1) {
					const r = await Comment.deleteById(id);
					ctx.response.body = { code: 200, msg: "删除成功" };
				} else {
					ctx.response.body = { code: 400, msg: "删除失败" };
				}
			} catch (e) {
				ctx.response.body = { code: 400, msg: e };
			}
		})
	}
}
