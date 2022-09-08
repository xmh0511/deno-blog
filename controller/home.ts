// deno-lint-ignore-file
import { Message } from "https://deno.land/std@0.104.0/hash/hasher.ts";
import {
	BodyForm,
	BodyFormData,
	Cookies,
	Router,
} from "https://deno.land/x/oak/mod.ts";

import { Md5 } from "https://raw.githubusercontent.com/denoland/deno_std/main/hash/md5.ts";

import { MymiddleWare, Utilities } from "../utilities/authorization.ts";

import {
	Article,
	Comment,
	Level,
	ReadCount,
	Tag,
	User,
} from "../model/model.ts";
import { Model } from "https://raw.githubusercontent.com/xmh0511/denodb/master/mod.ts";

import { format } from "https://deno.land/std@0.148.0/datetime/mod.ts";

import { Dao, Database } from "../dao.ts";
import { FieldValue } from "https://raw.githubusercontent.com/xmh0511/denodb/master/lib/data-types.ts";

import { MySQLClient } from "https://raw.githubusercontent.com/xmh0511/denodb/master/deps.ts";

const baseUrl = "/";

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

async function getHotestArticles(): Promise<any[]> {
	const client = (Dao as Database).getClient() as MySQLClient;
	const r = await client.query(`SELECT
	T.title , T.id , T.Counts
FROM
	(
	SELECT
		a.id,
		a.title,
		COUNT( c.id ) AS Counts 
	FROM
		article_tb a
		LEFT JOIN comment_tb c ON a.id = c.article_id 
	GROUP BY
		a.id 
	) AS T 
ORDER BY 
	T.Counts DESC LIMIT 8;`);
	return r;
}

async function addViewCount(ip: string, id: number): Promise<boolean> {
	const info = await ReadCount.where({ "article_id": id, ip }).get();
	if (info.length === 0) {
		const viewCount = new ReadCount();
		viewCount.article_id = id;
		viewCount.create_time = new Date();
		viewCount.ip = ip;
		await viewCount.save();
		return true;
	}
	return true;
}

export namespace HomeCtr {
	export function index(router: any) {
		const emptyString = (a: string) => {
			return a === "";
		}
		router.get("/home/:page", async (ctx:any) => {
			try {
				const cookie = new Cookies(ctx.request, ctx.response);
				const token = await cookie.get("token");
				//console.log("token:", token);
				const count = 10;
				const page = await ctx.params.page;
				const pageNumber = parseInt(page as string) >= 1 ? parseInt(page) : 1;
				const total = await Article.count();
				let articles = await Article.select(
					"article_tb.title",
					"article_tb.id",
					"article_tb.create_time",
					"article_tb.update_time",
					"tag_tb.name as tagName",
					"user_tb.name as userName",
					"article_tb.article_state",
				).orderBy("article_tb.update_time","desc").join(Tag, Tag.field("id"), Article.field("tag_id")).join(
					User,
					User.field("id"),
					Article.field("user_id"),
				).where("article_state", "1").orderBy("article_tb.update_time","desc").offset(
					(pageNumber - 1) * count,
				).orderBy("article_tb.update_time","desc").limit(count).orderBy("article_tb.update_time","desc").get() as Model[];
				//console.log(articles);
				for (const item of articles) {
					const id = item.id;
					const count = await Comment.where("article_id", id as FieldValue)
						.count();
					const views = await ReadCount.where("article_id", id as FieldValue)
						.count();
					item.commentCount = count;
					item.read_count = views;
				}
				//console.log(articles);
				const hotArticles = await getHotestArticles();
				//console.log(hotArticles);
				if (token !== null && token !== undefined && token !== "") {
					//console.log("true");
					const data = await Utilities.getInfoFromJWT(token as string);
					const postCount = await Article.where("user_id", data.data.id).select(
						"*",
					).all();
					const userInfo = await User.where({ id: data.data.id }).get() as Model[];
					await ctx.render("home.html", {
						login: true,
						data: data,
						post_count: postCount.length,
						articles,
						page,
						total,
						format,
						baseUrl,
						hotArticles,
						avatar: userInfo[0].avatar,
						emptyString
					});
				} else {
					//console.log("abc");
					await ctx.render("home.html", {
						login: false,
						articles,
						page,
						total,
						format,
						baseUrl,
						hotArticles,
					});
				}
			} catch (e) {
				console.log(e);
				await ctx.render("home.html", { login: false, baseUrl });
			}
		});
	}

	export function register(router: any) {
		router.get("/register", async (ctx:any) => {
			await ctx.render("reg.html", { baseUrl });
		});
	}

	export function loginPage(router: any) {
		router.get("/login", async (ctx:any) => {
			await ctx.render("login.html", { baseUrl });
		});
	}

	export function login(router: any) {
		router.post("/login", async (ctx:any) => {
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
							ctx.response.body = {
								code: 200,
								msg: "登录成功",
								token: jwt,
								baseUrl,
							};
						} else {
							ctx.response.body = { code: 400, msg: "用户名或密码错误" };
						}
						//ctx.response.body = { code: 200, msg: "注册成功", token: jwt };
					}
				} else {
					ctx.response.body = { code: 400, msg: "无效请求" };
				}
			} catch (e) {
				ctx.response.body = { code: 500, msg: "服务器错误" };
			}
		});
	}

	export function reg(router: any) {
		router.post("/reg", async (ctx:any) => {
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
						ctx.response.body = { code: 200, msg: "注册成功", token: jwt, baseUrl };
					} else {
						ctx.response.body = { code: 404, msg: "该用户名已注册" };
					}
					// console.log(r.lastInsertId);
				} else {
					ctx.response.body = { code: 500, msg: "无效请求" };
				}
			} catch (e) {
				//console.log(e);
				ctx.response.body = { code: 500, msg: "服务器错误" };
			}
		});
	}

	export function add(router: any) {
		router.get("/add", MymiddleWare.authorized, async (ctx:any) => {
			//const user = ctx.state.userData.data;
			try {
				const tags = await Tag.select("*").all();
				const levels = await Level.select("*").all();
				await ctx.render("add.html", { tags, levels, baseUrl });
			} catch (e) {
				//console.log(e);
			}
		});
	}

	export function postadd(router: any) {
		router.post(
			"/add",
			MymiddleWare.authorizedWithJson,
			MymiddleWare.hasformbody,
			async (ctx:any) => {
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
					ctx.response.body = { code: 500, msg: "服务器错误" };
				}
			},
		);
	}

	export function viewArticle(router: any) {
		router.get("/article/:id", async (ctx:any) => {
			const equal = (a: number, b: number) => {
				//console.log(a, b);
				return a === b;
			};
			const emptyString = (a: string) => {
				return a === "";
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
					"user_tb.avatar as avatar"
				).join(User, Comment.field("user_id"), User.field("id")).where(
					"article_id",
					id,
				).get();
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
					ctx.render("404.html", { code: 404, msg: "文章不存在", baseUrl });
					ctx.response.status = 404;
				} else {
					const info = article[0];
					if (info.level === 1) {
						let client_ip = ctx.request.ip;
						if (ctx.request.headers.get("x-forwarded-for") !==undefined){
							client_ip = ctx.request.headers.get("x-forwarded-for");
						}
						await addViewCount(client_ip, info.id as number);
						ctx.render("article.html", {
							info,
							format,
							comments,
							equal,
							currentId: currentData.data?.id,
							baseUrl,
							emptyString
						});
					} else {
						if (currentData.data?.level < (info.level as number)) {
							ctx.render("404.html", { code: 404, msg: "没有阅读权限", baseUrl });
							ctx.response.status = 404;
						} else {
							await addViewCount(ctx.request.ip, info.id as number);
							ctx.render("article.html", {
								info,
								format,
								comments,
								equal,
								currentId: currentData.data?.id,
								baseUrl,
								emptyString
							});
						}
					}
				}
			} catch (e) {
				console.log("line 292 ", e);
				ctx.render("404.html", { code: 404, msg: "服务器错误", baseUrl });
				ctx.response.status = 500;
			}
		});
	}

	export function articleList(router: any) {
		router.get("/list/:page", MymiddleWare.authorized, async (ctx:any) => {
			const emptyString = (a: string) => {
				return a === "";
			}
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
					"article_tb.article_state",
				).orderBy("article_tb.update_time","desc").join(Tag, Tag.field("id"), Article.field("tag_id")).where(
					"user_id",
					user.id,
				).orderBy("article_tb.update_time","desc").offset((page - 1) * count).orderBy("article_tb.update_time","desc").limit(count).get() as Model[];
				for (const item of articles) {
					const count = await Comment.where("article_id", item.id as FieldValue)
						.count();
					const views = await ReadCount.where(
						"article_id",
						item.id as FieldValue,
					).count();
					item.commentCount = count;
					item.read_count = views;
				}
				const total = await Article.where("user_id", user.id).count();
				const hotArticles = await getHotestArticles();
				//console.log(articles);
				const userInfo = await User.where({ "id": user.id, }).get() as Model[];
				await ctx.render("list.html", {
					login: true,
					data: ctx.state.userData,
					post_count: total,
					articles,
					page,
					total,
					format,
					baseUrl,
					hotArticles,
					avatar: userInfo[0].avatar,
					emptyString
				});
			} catch (e) {
				await ctx.render("404.html", { code: 404, msg: "服务器错误", baseUrl });
			}
		});
	}

	export function editArticle(router: any) {
		router.get("/edit/:id", MymiddleWare.authorized, async (ctx:any) => {
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
					ctx.render("edit.html", {
						article: article[0],
						tags,
						levels,
						equal,
						baseUrl,
					});
				} else {
					ctx.render("404.html", { code: 404, msg: "改文章不存在", baseUrl });
					ctx.response.status = 404;
				}
			} catch (e) {
				ctx.render("404.html", { code: 404, msg: "服务器错误", baseUrl });
			}
		});
	}

	export function postEdit(router: any) {
		router.post("/edit", MymiddleWare.authorizedWithJson, async (ctx:any) => {
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
					//console.log(articleArr);
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
				ctx.response.body = { code: 500, msg: "服务器错误" };
			}
		});
	}

	export function deleteArticle(router: any) {
		router.post("/delete/:id", MymiddleWare.authorizedWithJson, async (ctx:any) => {
			try {
				const user = ctx.state.userData.data;
				const id = ctx.params.id;
				const info = await Article.where({ "id": id, "user_id": user.id })
					.get() as Model[];
				if (info.length === 1) {
					const model = info[0];
					const state = model.article_state as number;
					//console.log("state: ", model);
					if (state === 1) {
						model.article_state = 0;
					} else {
						console.log("set to 1");
						model.article_state = 1;
					}
					model.update_time = new Date();
					await model.update();
					ctx.response.body = { code: 200, msg: "设置成功" };
				} else {
					ctx.response.body = { code: 400, msg: "不存在该文章" };
				}
			} catch (e) {
				ctx.response.body = { code: 500, msg: "服务器错误" };
			}
		});
	}

	export function postComment(router: any) {
		router.post(
			"/comment/:id",
			MymiddleWare.authorizedWithJson,
			async (ctx:any) => {
				try {
					const user = ctx.state.userData.data;
					const articleId = ctx.params.id;
					//console.log(articleId, user.level);
					const count = await Article.where({ id: articleId }).where(
						"level",
						"<=",
						user.level,
					).count();
					//console.log(count);
					if (count > 0) {
						const body = ctx.request.body() as BodyForm;
						const form = await body.value;
						const comment = form.get("comment");
						const md_content = form.get("md_content");
						const info = new Comment();
						info.create_time = new Date();
						info.update_time = new Date();
						info.article_id = articleId;
						info.user_id = user.id;
						info.comment = comment;
						info.md_content = md_content;
						await info.save();
						ctx.response.body = { code: 200, msg: "提交成" };
					} else {
						ctx.response.body = { code: 400, msg: "评论失败" };
					}
				} catch (e) {
					ctx.response.body = { code: 500, msg: "服务器错误" };
				}
			},
		);
	}

	export function delComment(router: any) {
		router.post(
			"/delcomment/:id",
			MymiddleWare.authorizedWithJson,
			async (ctx:any) => {
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
					ctx.response.body = { code: 500, msg: "服务器错误" };
				}
			},
		);
	}

	export function commentedit(router: any) {
		router.get("/commentedit/:id", MymiddleWare.authorized, async (ctx:any) => {
			try {
				const user = ctx.state.userData.data;
				const info = await Comment.where({
					"user_id": user.id,
					"id": ctx.params.id,
				}).get() as Model[];
				if (info.length === 1) {
					ctx.render("editcomment.html", { info: info[0], baseUrl });
				} else {
					ctx.render("404.html", { code: 400, msg: info, baseUrl });
					ctx.response.status = 400;
				}
			} catch (e) {
				ctx.render("404.html", { code: 400, msg: "服务器错误", baseUrl });
				ctx.response.status = 500;
			}
		});
	}

	export function postCommentEdit(router: any) {
		router.post(
			"/editcomment/:id",
			MymiddleWare.authorizedWithJson,
			async (ctx:any) => {
				try {
					const user = ctx.state.userData.data;
					const body = ctx.request.body() as BodyForm;
					const form = await body.value;
					const comment = form.get("comment");
					if (comment === "" || comment === null || comment === undefined) {
						ctx.response.body = { code: 400, msg: "内容为空" };
						return;
					}
					const info = await Comment.where({
						"user_id": user.id,
						"id": ctx.params.id,
					}).get() as Model[];
					if (info.length === 1) {
						const data = info[0];
						data.update_time = new Date();
						data.comment = comment;
						await data.update();
						ctx.response.body = { code: 200, msg: "" };
					} else {
						ctx.response.body = { code: 400, msg: info };
						ctx.response.status = 400;
					}
				} catch (e) {
					ctx.response.body = { code: 400, msg: "服务器错误" };
					ctx.response.status = 500;
				}
			},
		);
	}

	export async function personEdit(router: any) {
		router.get("/personEdit", MymiddleWare.authorized, async (ctx:any) => {
			const emptyString = (a: string) => {
				return a === "";
			}
			try {
				const user = ctx.state.userData.data;
				const userInfo = await User.where({ id: user.id }).get() as Model[];
				//console.log(userInfo);
				ctx.render("person.html", { info: userInfo[0], emptyString });
			} catch (e) {
				ctx.render("404.html", { code: 400, msg: "服务器错误" });
				ctx.response.status = 500;
			}
		})
	}

	export async function saveAvatar(router: any) {
		router.post("/saveAvatar", MymiddleWare.authorized, async (ctx:any) => {
			try {
				const user = ctx.state.userData.data;
				const body = ctx.request.body() as BodyForm;
				const form = await body.value;
				const path = form.get("path");
				if (path === "" || path === null || path === undefined) {
					ctx.response.body = { code: 400, msg: "路径为空" }
					return;
				}
				const userInfo = await User.where({ id: user.id }).get() as Model[];
				if (userInfo.length !== 0) {
					const info = userInfo[0];
					//console.log("avatar path: ",path);
					//console.log(info);
					info.avatar = path;
					await info.update();
					ctx.response.body = { code: 200, msg: "修改成功" }
				}
			} catch (e) {
				ctx.response.body = { code: 500, msg: "服务器错误" }
			}
		})
	}
}
