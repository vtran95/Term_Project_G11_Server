-- MySQL dump 10.13  Distrib 8.0.23, for macos10.15 (x86_64)
--
-- Host: us-cdbr-east-03.cleardb.com    Database: heroku_1ddda9c9cbecd43
-- ------------------------------------------------------
-- Server version	5.6.50-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `apikey`
--

DROP TABLE IF EXISTS `apikey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apikey` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userkey` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `stat` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `fk_has_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apikey`
--

LOCK TABLES `apikey` WRITE;
/*!40000 ALTER TABLE `apikey` DISABLE KEYS */;
INSERT INTO `apikey` VALUES (4,'hNy7oFFOTt5W','vincent',0),(14,'o7IV6NBKccMv','vincent2',0),(24,'qYGOBEa6JqEc','test123',0),(34,'ZxS30U3i8PFw','test1',0),(44,'rOgE59IvDF3i','vincent3',0),(54,'AEPP9I7qkgmP','vincent4',0);
/*!40000 ALTER TABLE `apikey` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apistats`
--

DROP TABLE IF EXISTS `apistats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apistats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `method` varchar(255) DEFAULT NULL,
  `endpoint` varchar(255) DEFAULT NULL,
  `requests` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apistats`
--

LOCK TABLES `apistats` WRITE;
/*!40000 ALTER TABLE `apistats` DISABLE KEYS */;
INSERT INTO `apistats` VALUES (4,'GET','/api/v1/workouts',73),(14,'POST','/api/v1/add_exercise',12),(34,'PUT','/api/v1/update',4),(54,'DELETE','/api/v1/delete/:name',5),(64,'POST','/api/v1/add_session',6),(74,'DELETE','/api/v1/delete_session/:name',1),(84,'PUT','/api/v1/update_session',9),(94,'POST','/api/v1/search_id/:id',8),(104,'GET','/api/v1/search_name/:name',13),(114,'POST','/api/v1/search_fletter/:fletter',9),(124,'GET','/api/v1/random',46),(134,'GET','/api/v1/filter/:category',22),(144,'GET','/api/v1/sessions',25);
/*!40000 ALTER TABLE `apistats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `time` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES (4,'Work Session Test 1\n4/11/2021',60),(14,'Work Session Test 2',50),(24,'Sesh3',50),(44,'Test Session 3',45),(54,'Test4',20);
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('2BjtQbCn6CuyPMVKkJEZR6X91hHUul3i',1618279614,'{\"cookie\":{\"originalMaxAge\":600000,\"expires\":\"2021-04-13T02:06:53.760Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\"}}'),('Bk7lPckzXAY4nJWZ2BKRMWBBUdtdm5Fu',1618315454,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":true,\"httpOnly\":true,\"path\":\"/\"}}'),('JkbbusWOek0OWuouctLEmo3ivJtRfINI',1618349931,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":true,\"httpOnly\":true,\"path\":\"/\"}}'),('PUHdPAhbT5R5srVAn3OsOEhm-mCxxjKv',1618347973,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":true,\"httpOnly\":true,\"path\":\"/\"}}'),('Uzj39xu8Bv-RzgZgD6CGYA7jNAk4t2Wn',1618349911,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":true,\"httpOnly\":true,\"path\":\"/\"},\"loggedin\":true,\"username\":\"vincent\"}'),('f2ARjkxSuFarop6p96jOQvbJjcLC9_Ur',1618315435,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":true,\"httpOnly\":true,\"path\":\"/\"},\"loggedin\":true,\"username\":\"vincent\"}'),('gU-O9bryRnAwtENSDdyP5jeHAneT4FDG',1618279612,'{\"cookie\":{\"originalMaxAge\":600000,\"expires\":\"2021-04-13T02:06:52.426Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\"}}'),('mYABlwM0FzVQ_uA4EWGl2pSpz-9TpZyA',1618279557,'{\"cookie\":{\"originalMaxAge\":600000,\"expires\":\"2021-04-13T02:05:57.349Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\"},\"loggedin\":true,\"username\":\"test1\"}'),('tE1vn-30YZhL5QEUqgIYedloM-XzvLIx',1618341102,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":true,\"httpOnly\":true,\"path\":\"/\"},\"loggedin\":true,\"username\":\"test1\"}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `password` (`password`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (4,'admin','$2b$10$OAM8pNTCwXMv3Z5oEyvTdO2tvlydKtrVauWZLhD8of5JozezpKKXe'),(14,'vincent','$2b$10$b0Uqq8hfAgsr3oOU.NQYOenxf/3ZrUQ8jnjQz6ICJNsbT0onC71Fi'),(24,'vincent2','$2b$10$cdXRa1gPS8.7JXySTIRssuVQdD.wMAa9BNtbus8ypF/gqVY7BhAC2'),(34,'test123','$2b$10$B/XyMwxI8/YH5gxpLH7D0.l9Oi8vRZyRDY83kAhZefB0wEiA0XIBG'),(44,'test1','$2b$10$EfzoeAWPibJaZjcgxh.umu3BSLChi4jIl3bWXDNcTAY1bLGCG20AG'),(54,'vincent3','$2b$10$7hy1x39TpOmLJGTNxetuyOClvZhMDwtk2zWb6gckAzP7JYC4BvuCG'),(64,'vincent4','$2b$10$d3h78cJ7.Q43voXjCOWzdOZZvpldbiDRKCg.ikhZfZKq2xWcj2Mgm');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout`
--

DROP TABLE IF EXISTS `workout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `instructions` varchar(1024) DEFAULT NULL,
  `equipment` varchar(255) DEFAULT NULL,
  `amounts` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=144 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout`
--

LOCK TABLES `workout` WRITE;
/*!40000 ALTER TABLE `workout` DISABLE KEYS */;
INSERT INTO `workout` VALUES (4,'bench press','chest','lift up','bench',1),(14,'push ups','chest','push against floor','none',0),(74,'barbell squat','leg','squat with barbell','barbell',0),(84,'hammer curl','bicep','Get Dumbbell and curl','dumbell',0),(94,'bench press','chest','Lie down on bench, get a barbell and press','Barbell, bench',1),(104,'Tricep Extension','tricep','test tricpe','dumbell',1),(134,'Treadmill','cardio','Run on treadmill','treadmill',1);
/*!40000 ALTER TABLE `workout` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-12 19:08:18
