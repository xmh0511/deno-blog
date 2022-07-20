import { Database, MySQLConnector } from "https://raw.githubusercontent.com/xmh0511/denodb/master/mod.ts";
import { User, Article, Tag, Level } from "./model/model.ts";


export function initDB() {
	const connector = new MySQLConnector({
		database: 'deno',
		host: 'localhost',
		username: 'root',
		password: '970252187',
		port: 3306, // optional
	});
	const db = new Database(connector);
	db.link([User, Article, Tag, Level]);
}



export { User, Article, Tag, Level };