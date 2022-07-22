import { Model, DataTypes } from "https://raw.githubusercontent.com/xmh0511/denodb/master/mod.ts";

class User extends Model {
	static table = 'user_tb';

	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		name: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			length: 50,
		},
		create_time: {
			type: DataTypes.DATETIME
		},
		update_time: {
			type: DataTypes.DATETIME
		},
		password: {
			type: DataTypes.STRING
		},
		privilege: {
			type: DataTypes.INTEGER
		},
		avatar: {
			type: DataTypes.STRING
		}
	};
}

class Article extends Model {
	static table = 'article_tb';


	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: DataTypes.INTEGER,
		article_state: DataTypes.INTEGER,
		tag_id: DataTypes.INTEGER,
		create_time: {
			type: DataTypes.DATETIME
		},
		update_time: {
			type: DataTypes.DATETIME
		},
		content: {
			type: DataTypes.STRING
		},
		title: {
			type: DataTypes.STRING
		},
		level: DataTypes.INTEGER,
	};
}

class Tag extends Model {
	static table = 'tag_tb';


	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		create_time: {
			type: DataTypes.DATETIME
		},
		name: {
			type: DataTypes.STRING
		},
	};

}

class Level extends Model {
	static table = 'level_tb';

	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		create_time: {
			type: DataTypes.DATETIME
		},
		level: {
			type: DataTypes.INTEGER
		},
		name: {
			type: DataTypes.STRING
		},
	};
}

class Comment extends Model {
	static table = 'comment_tb';


	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		create_time: {
			type: DataTypes.DATETIME
		},
		update_time: {
			type: DataTypes.DATETIME
		},
		comment: {
			type: DataTypes.STRING
		},
		user_id: {
			type: DataTypes.INTEGER
		},
		article_id: {
			type: DataTypes.INTEGER
		},
	};

}

class ReadCount extends Model {
	static table = 'view_tb';


	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		create_time: {
			type: DataTypes.DATETIME
		},
		article_id: {
			type: DataTypes.INTEGER
		},
		ip: {
			type: DataTypes.STRING
		},
	};

}

export { User, Article, Tag, Level, Comment, ReadCount };