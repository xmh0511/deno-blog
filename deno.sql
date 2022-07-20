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

 Date: 20/07/2022 16:41:02
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of article_tb
-- ----------------------------
BEGIN;
INSERT INTO `article_tb` VALUES (1, 20, '2022-07-20 09:18:05', '2022-07-20 09:18:05', '<p>ddfdfdsfdf</p>', '11233', 1, 1);
INSERT INTO `article_tb` VALUES (2, 20, '2022-07-20 10:55:48', '2022-07-20 10:55:48', '<p><span style=\"background-color: rgb(221, 217, 195); color: rgb(0, 176, 240);\">dfdfdfdfdf (^_^)  (&gt;_&lt;)  (&gt;_&lt;)  (&gt;_&lt;)  (&gt;_&lt;)  (&gt;_&lt;)  (*&gt;﹏&lt;*)  (*&gt;﹏&lt;*)  (*&gt;﹏&lt;*) </span></p>', '1123', 1, 1);
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of user_tb
-- ----------------------------
BEGIN;
INSERT INTO `user_tb` VALUES (20, 'abc', '2022-07-15 13:18:35', '2022-07-15 13:18:35', NULL, 'c4ca4238a0b923820dcc509a6f75849b', 1);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
