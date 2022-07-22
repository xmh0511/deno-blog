import { Database, MySQLConnector } from "https://raw.githubusercontent.com/xmh0511/denodb/master/mod.ts";
import { User, Article, Tag, Level, Comment, ReadCount } from "./model/model.ts";

let Dao: any = null;
console.log(Dao);

export function initDB() {
	const connector = new MySQLConnector({
		database: 'deno',
		host: 'localhost',
		username: 'root',
		password: '970252187',
		port: 3306, // optional
	});
	Dao = new Database(connector);
	Dao.link([User, Article, Tag, Level, Comment, ReadCount]);
	return Dao;
}




export { Database, Dao, User, Article, Tag, Level, Comment, ReadCount };