/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50730
 Source Host           : localhost:3306
 Source Schema         : deno

 Target Server Type    : MySQL
 Target Server Version : 50730
 File Encoding         : 65001

 Date: 22/07/2022 17:45:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article_tb
-- ----------------------------
DROP TABLE IF EXISTS `article_tb`;
CREATE TABLE `article_tb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `content` longtext,
  `title` varchar(255) DEFAULT NULL,
  `level` int(255) DEFAULT NULL,
  `tag_id` int(11) DEFAULT NULL,
  `article_state` int(255) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of article_tb
-- ----------------------------
BEGIN;
INSERT INTO `article_tb` VALUES (1, 20, '2022-07-20 09:18:05', '2022-07-20 09:18:05', '<p>ddfdfdsfdf</p>', 'abc', 1, 1, 1);
INSERT INTO `article_tb` VALUES (2, 20, '2022-07-20 10:55:48', '2022-07-22 16:48:45', '<p><span style=\"background-color: rgb(221, 217, 195); color: rgb(0, 176, 240);\">dfdfdfdfdf (^_^)  (&gt;_&lt;)  (&gt;_&lt;)  (&gt;_&lt;)  (&gt;_&lt;)  (&gt;_&lt;)  (*&gt;﹏&lt;*)  (*&gt;﹏&lt;*)  (*&gt;﹏&lt;*) </span></p><p><span style=\"background-color: rgb(221, 217, 195); color: rgb(0, 176, 240);\"><br></span></p><p>2323213123</p><p><img src=\"/./public/upload/26a8638a99225484f12360e88908c252bd2af0b5.jpeg\" width=\"100\" height=\"200\"><br></p><p>111111<br></p>', '1123', 1, 2, 1);
INSERT INTO `article_tb` VALUES (4, 20, '2022-07-22 16:36:57', '2022-07-22 16:36:57', '<p>dfjfkjdskfjdksjfkjflk</p>', '111111abckdjfjkdjflsjflfjlkfj', 1, 2, 1);
COMMIT;

-- ----------------------------
-- Table structure for comment_tb
-- ----------------------------
DROP TABLE IF EXISTS `comment_tb`;
CREATE TABLE `comment_tb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `article_id` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `comment` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of comment_tb
-- ----------------------------
BEGIN;
INSERT INTO `comment_tb` VALUES (1, 20, 1, '2022-07-21 17:16:22', '2022-07-21 17:16:22', '<p>2323213131</p>');
INSERT INTO `comment_tb` VALUES (3, 20, 1, '2022-07-21 17:54:13', '2022-07-22 13:31:16', '<p>just a comment.12</p><p><br></p><p><img src=\"https://t7.baidu.com/it/u=2168645659,3174029352&amp;fm=193&amp;f=GIF\" width=\"100\" height=\"50\"><br></p>');
INSERT INTO `comment_tb` VALUES (4, 20, 2, '2022-07-22 16:11:06', '2022-07-22 16:11:06', '<p>独立开发京东方节点数量咖啡机劳动节风口浪尖反垄断法</p>');
INSERT INTO `comment_tb` VALUES (5, 20, 4, '2022-07-22 17:43:31', '2022-07-22 17:43:31', '<p>11111</p>');
COMMIT;

-- ----------------------------
-- Table structure for level_tb
-- ----------------------------
DROP TABLE IF EXISTS `level_tb`;
CREATE TABLE `level_tb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` int(255) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of level_tb
-- ----------------------------
BEGIN;
INSERT INTO `level_tb` VALUES (1, 1, '2022-07-20 09:25:25', 'test');
COMMIT;

-- ----------------------------
-- Table structure for tag_tb
-- ----------------------------
DROP TABLE IF EXISTS `tag_tb`;
CREATE TABLE `tag_tb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tag_tb
-- ----------------------------
BEGIN;
INSERT INTO `tag_tb` VALUES (1, '前端', '2022-07-15 17:30:58');
INSERT INTO `tag_tb` VALUES (2, 'deno', '2022-07-15 17:31:16');
COMMIT;

-- ----------------------------
-- Table structure for user_tb
-- ----------------------------
DROP TABLE IF EXISTS `user_tb`;
CREATE TABLE `user_tb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `privilege` smallint(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of user_tb
-- ----------------------------
BEGIN;
INSERT INTO `user_tb` VALUES (20, 'abc', '2022-07-15 13:18:35', '2022-07-15 13:18:35', NULL, 'c4ca4238a0b923820dcc509a6f75849b', 1, '/./public/upload/4377fdfa6d132689b74a4226237da8391c6a31ea.png');
COMMIT;

-- ----------------------------
-- Table structure for view_tb
-- ----------------------------
DROP TABLE IF EXISTS `view_tb`;
CREATE TABLE `view_tb` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of view_tb
-- ----------------------------
BEGIN;
INSERT INTO `view_tb` VALUES (6, 1, '2022-07-22 15:45:29', '127.0.0.1');
INSERT INTO `view_tb` VALUES (7, 2, '2022-07-22 16:10:03', '127.0.0.1');
INSERT INTO `view_tb` VALUES (8, 4, '2022-07-22 16:48:56', '127.0.0.1');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
