CREATE DATABASE  IF NOT EXISTS `pos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pos`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: team4-mysql-server.mysql.database.azure.com    Database: pos
-- ------------------------------------------------------
-- Server version	8.0.42-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `active_location`
--

DROP TABLE IF EXISTS `active_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `active_location` (
  `ActiveLocationID` int NOT NULL AUTO_INCREMENT,
  `LocationName` varchar(30) DEFAULT NULL,
  `BeginOperationOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `EndOperationOn` timestamp NULL DEFAULT NULL,
  `DaysOfWeek` set('Mon','Tue','Wed','Thu','Fri','Sat','Sun') DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`ActiveLocationID`),
  KEY `LocationName` (`LocationName`),
  CONSTRAINT `active_location_ibfk_1` FOREIGN KEY (`LocationName`) REFERENCES `location` (`Name`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `active_location`
--

LOCK TABLES `active_location` WRITE;
/*!40000 ALTER TABLE `active_location` DISABLE KEYS */;
INSERT INTO `active_location` VALUES (1,'Heights','2025-10-20 08:00:00','2025-10-25 20:00:00','Mon,Tue,Wed,Thu,Fri',0),(2,'Downtown','2025-10-27 08:00:00','2025-11-01 22:00:00','Mon,Tue,Wed,Thu,Fri,Sat',0),(4,'Galveston','2025-10-24 00:00:00',NULL,'Thu,Fri,Sat,Sun',0),(7,'Heights','2025-11-23 00:00:00','2025-11-29 00:00:00','Wed,Thu,Fri,Sun',0),(9,'Heights','2025-11-23 00:00:00',NULL,'Mon,Fri,Sat,Sun',0),(10,'Downtown','2025-11-23 00:00:00',NULL,'Mon,Tue,Wed,Sun',1),(11,'Downtown','2025-11-22 00:00:00',NULL,'Mon,Tue,Wed',0);
/*!40000 ALTER TABLE `active_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alert`
--

DROP TABLE IF EXISTS `alert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert` (
  `AlertID` int NOT NULL AUTO_INCREMENT,
  `Message` varchar(255) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_open` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`AlertID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert`
--

LOCK TABLES `alert` WRITE;
/*!40000 ALTER TABLE `alert` DISABLE KEYS */;
INSERT INTO `alert` VALUES (1,'Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!','2025-11-21 20:44:00',0),(2,'Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!','2025-11-21 20:45:14',0),(3,'Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!','2025-11-21 21:02:31',0),(4,'Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!','2025-11-22 23:04:04',0),(5,'Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!','2025-11-24 01:40:45',0);
/*!40000 ALTER TABLE `alert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assigns`
--

DROP TABLE IF EXISTS `assigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigns` (
  `AssignID` int NOT NULL AUTO_INCREMENT,
  `ActiveLocationID` int DEFAULT NULL,
  `EmployeeJob` enum('cashier','cook') DEFAULT NULL,
  `StaffID` int DEFAULT NULL,
  `ScheduleStart` timestamp NOT NULL,
  `ScheduleEnd` timestamp NOT NULL,
  `AssignedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AssignID`),
  KEY `ActiveLocationID` (`ActiveLocationID`),
  KEY `StaffID` (`StaffID`),
  CONSTRAINT `assigns_ibfk_1` FOREIGN KEY (`ActiveLocationID`) REFERENCES `active_location` (`ActiveLocationID`) ON DELETE CASCADE,
  CONSTRAINT `assigns_ibfk_2` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assigns`
--

LOCK TABLES `assigns` WRITE;
/*!40000 ALTER TABLE `assigns` DISABLE KEYS */;
INSERT INTO `assigns` VALUES (1,1,'cashier',4,'2025-10-21 09:00:00','2025-10-21 17:00:00','2025-10-26 03:25:30'),(2,1,'cook',5,'2025-10-21 09:00:00','2025-10-21 17:00:00','2025-10-26 03:25:30'),(3,2,'cashier',6,'2025-10-28 10:00:00','2025-10-28 18:00:00','2025-10-26 03:25:30'),(4,2,'cook',7,'2025-10-28 10:00:00','2025-10-28 18:00:00','2025-10-26 03:25:30'),(7,4,'cashier',6,'2025-11-11 10:00:00','2025-11-11 18:00:00','2025-10-26 03:25:30');
/*!40000 ALTER TABLE `assigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `busy_status`
--

DROP TABLE IF EXISTS `busy_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `busy_status` (
  `id` int NOT NULL DEFAULT '1',
  `is_busy` tinyint(1) DEFAULT '0',
  `pending_order_count` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `busy_status`
--

LOCK TABLES `busy_status` WRITE;
/*!40000 ALTER TABLE `busy_status` DISABLE KEYS */;
INSERT INTO `busy_status` VALUES (1,1,27,'2025-11-08 06:23:46');
/*!40000 ALTER TABLE `busy_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `CustomerID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `PhoneNumber` varchar(10) DEFAULT NULL,
  `Fname` varchar(20) DEFAULT NULL,
  `Lname` varchar(20) DEFAULT NULL,
  `IncentivePoints` int DEFAULT '0',
  `OptInMarketing` tinyint(1) DEFAULT '0',
  `PayRate` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'sarah.lee@example.com','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f','8325551201','Sarah','Lee',20,1,NULL,'2025-10-26 03:25:30','2025-10-26 03:25:30'),(2,'tom.nguyen@gmail.com','fbb4a8a163ffa958b4f02bf9cabb30cfefb40de803f2c4c346a9d39b3be1b544','7135559044','Tom','Nguyen',10,0,NULL,'2025-10-26 03:25:30','2025-10-26 03:25:30'),(3,'aisha.k@outlook.com','2f2cfd30b464777e67c4b343d818fe5b2936e93d1c9013c5f3ae51a3a7fe9006','3465553012','Aisha','Khan',50,1,NULL,'2025-10-26 03:25:30','2025-10-26 03:25:30'),(4,'david.rojas@yahoo.com','3e9b04779dbec8bb184bf8efa0439887785ab1801daf5b3f4e287f0db3a379f5','8325557623','David','Rojas',5,0,NULL,'2025-10-26 03:25:30','2025-10-26 03:25:30'),(5,'emily.watson@gmail.com','546526ee8366a03b217f250e9916210bec90c72c39d84c9de336682af81ab93e','2815554477','Emily','Watson',35,1,NULL,'2025-10-26 03:25:30','2025-10-26 03:25:30'),(6,'admin@email.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','1234567889','admin','customer',0,0,NULL,'2025-10-27 06:19:48','2025-11-12 16:41:59'),(7,'mama@gmail.com','12496a8c1c2ce719b77139a63b067035bf16a01ba9643673c97ff8f2b671e79d','1234567890','axuser','jas',0,0,NULL,'2025-11-05 23:43:19','2025-11-05 23:43:19'),(8,'ma@gmail.com','68bd1464f79367d0530965ec2f2e97be9845b19d027f759634fed555030a10e3','8888888888','itsmee','itsmee',0,0,NULL,'2025-11-05 23:49:30','2025-11-05 23:49:30'),(9,'test@email.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','1231233123','12312123','12312',0,0,NULL,'2025-11-06 00:13:24','2025-11-06 00:13:24'),(10,'aaa@email.com','a9e6f36035dbb98ca558ab151fd95e7f082d44f045f8eac36ace83374e96d333','1234325672','aaa','aaa',0,0,NULL,'2025-11-08 05:19:18','2025-11-08 05:19:18'),(11,'bobsmith@gmail.com','8d059c3640b97180dd2ee453e20d34ab0cb0f2eccbe87d01915a8e578a202b11','1111111111','Bob','Smith',0,0,NULL,'2025-11-09 18:39:29','2025-11-09 18:39:29'),(12,'test123@gmail.com','a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3','1234567891','Test','Testing',0,0,NULL,'2025-11-11 05:19:23','2025-11-11 05:19:23'),(13,'han@gmail.com','ded5d903f2fbdd9a57364bb2a36e027ad35efce60aa256d870ddb299904eaa80','8329839363','hancook','cook',0,0,NULL,'2025-11-11 05:24:56','2025-11-11 05:24:56'),(14,'maas@gmail.com','ded5d903f2fbdd9a57364bb2a36e027ad35efce60aa256d870ddb299904eaa80','8329839365','mohamed','mms',0,0,NULL,'2025-11-11 05:42:14','2025-11-11 05:42:14'),(15,'qb@email.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','2342342345','Quang','Bui',0,0,NULL,'2025-11-11 18:55:39','2025-11-11 18:55:39'),(16,'awda@gmail.com','6eff9efbe9ec4716826e179e54e763810cddf48cd0e73c9e6ace6253d377e3d9','1111111111','fdf','assadsa',0,0,NULL,'2025-11-11 23:35:18','2025-11-11 23:35:18'),(17,'cat123@gmail.com','a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3','1232343456','cat','catt',0,0,NULL,'2025-11-11 23:37:13','2025-11-11 23:37:13'),(18,'test@gmail.com','a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3','1234567891','low','high',0,0,NULL,'2025-11-11 23:39:10','2025-11-11 23:39:10'),(19,'nwobu@gmail.com','739fe12643b6e7eb87f150a70fc95a83827cf13725dcb937e17ed848119a1510','8321111111','Jack','John',0,0,NULL,'2025-11-12 17:19:17','2025-11-12 17:22:22'),(20,'123@email.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','1231231231','customer','customer',0,0,NULL,'2025-11-12 17:41:44','2025-11-12 20:13:08'),(21,'jwilson@gmail.com','f4ff83a28eac5a801a80b127e176607761678ed42ea515337b3710f39dc45800','1234567890','James','Wilson',0,0,NULL,'2025-11-12 22:59:32','2025-11-12 23:02:02'),(22,'jsmith@gmail.com','821829111d71b8c0b271d5f5f1c15e1000607d7c5719716455a20eb528f06c92','8321234567','James','Wilson',0,0,NULL,'2025-11-12 23:05:25','2025-11-12 23:23:02'),(23,'jj@gmail.com','f4ff83a28eac5a801a80b127e176607761678ed42ea515337b3710f39dc45800','1111111111','John','James',0,0,NULL,'2025-11-12 23:26:39','2025-11-12 23:26:39'),(24,'james@gmail.com','2a18c4b747ddc57ae267f81709473bac4d3fcef623e85014a0ecd98bb19ae699','1234567890','James','Johnson',0,0,NULL,'2025-11-12 23:50:15','2025-11-12 23:52:20'),(25,'hunggay@gmail.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','1234567890','Hung','Gay',0,0,NULL,'2025-11-14 18:32:49','2025-11-14 18:32:49'),(26,'jd@gmail.com','f4ff83a28eac5a801a80b127e176607761678ed42ea515337b3710f39dc45800','1234567890','John','Doe',0,0,NULL,'2025-11-23 02:27:16','2025-11-23 02:27:16');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_feedback`
--

DROP TABLE IF EXISTS `customer_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_feedback` (
  `FeedbackID` int NOT NULL AUTO_INCREMENT,
  `CustomerID` int DEFAULT NULL,
  `OrderID` int DEFAULT NULL,
  `Rating` int DEFAULT NULL,
  `Comments` varchar(500) DEFAULT NULL,
  `SubmittedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FeedbackID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `OrderID` (`OrderID`),
  CONSTRAINT `customer_feedback_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `customer_feedback_ibfk_2` FOREIGN KEY (`OrderID`) REFERENCES `order` (`OrderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `customer_feedback_chk_1` CHECK (((`Rating` >= 1) and (`Rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_feedback`
--

LOCK TABLES `customer_feedback` WRITE;
/*!40000 ALTER TABLE `customer_feedback` DISABLE KEYS */;
INSERT INTO `customer_feedback` VALUES (4,1,1,5,'Great service and quick delivery!','2025-11-10 01:56:49'),(5,2,2,4,'Everything was good, but food could be hotter.','2025-11-10 01:56:49'),(6,3,3,3,'Average experience, slow checkout.','2025-11-10 01:56:49'),(8,24,76,4,'The food was good','2025-11-12 23:56:01');
/*!40000 ALTER TABLE `customer_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `globalthreshold`
--

DROP TABLE IF EXISTS `globalthreshold`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `globalthreshold` (
  `Id` int NOT NULL,
  `LowStockThreshold` int DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `globalthreshold`
--

LOCK TABLES `globalthreshold` WRITE;
/*!40000 ALTER TABLE `globalthreshold` DISABLE KEYS */;
INSERT INTO `globalthreshold` VALUES (1,10);
/*!40000 ALTER TABLE `globalthreshold` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient`
--

DROP TABLE IF EXISTS `ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient` (
  `IngredientID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(30) NOT NULL,
  `QuantityInStock` int DEFAULT '0',
  `CostPerUnit` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`IngredientID`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient`
--

LOCK TABLES `ingredient` WRITE;
/*!40000 ALTER TABLE `ingredient` DISABLE KEYS */;
INSERT INTO `ingredient` VALUES (1,'Beef Patty',58,1.64,'2025-10-26 03:25:30','2025-11-24 04:54:39',1),(2,'Burger Bun',49,0.50,'2025-10-26 03:25:30','2025-11-24 04:54:39',1),(3,'Cheddar Cheese',123,0.75,'2025-10-26 03:25:30','2025-11-24 04:54:39',1),(4,'Lettuce',77,0.30,'2025-10-26 03:25:30','2025-11-24 04:54:39',1),(5,'Tomato',57,0.60,'2025-10-26 03:25:30','2025-11-24 04:54:39',1),(6,'Chicken Breast',88,1.20,'2025-10-26 03:25:30','2025-11-24 04:54:25',1),(7,'Tortilla',93,0.60,'2025-10-26 03:25:30','2025-11-24 04:54:25',1),(8,'Nutella',27,0.90,'2025-10-26 03:25:30','2025-11-24 05:42:54',1),(9,'Strawberries',9,0.70,'2025-10-26 03:25:30','2025-11-23 23:24:13',1),(10,'Tea Leaves',192,0.20,'2025-10-26 03:25:30','2025-11-11 20:16:11',1),(11,'Lemon',115,0.25,'2025-10-26 03:25:30','2025-11-23 23:24:13',1),(12,'Sugar Syrup',20,0.15,'2025-10-26 03:25:30','2025-11-24 02:01:16',1),(13,'Cream Cheese',53,0.80,'2025-10-26 03:25:30','2025-11-24 02:15:45',1),(14,'Graham Cracker Crust',50,0.50,'2025-10-26 03:25:30','2025-11-24 02:26:48',1),(15,'Vegan Patty',-15,2.50,'2025-10-26 03:25:33','2025-11-24 01:51:25',0),(16,'Vegan Patty',119,2.50,'2025-10-26 03:26:06','2025-11-24 04:54:39',1),(21,'Espresso',19,2.00,'2025-11-11 18:06:40','2025-11-23 06:29:22',1),(22,'Whole Milk',173,1.50,'2025-11-11 18:07:31','2025-11-12 20:19:10',1),(23,'Oat Milk',0,3.00,'2025-11-11 18:07:45','2025-11-21 05:37:46',0),(24,'Avocado',3,1.00,'2025-11-23 22:00:54','2025-11-24 02:02:02',1),(25,'Marshmallow',38,0.25,'2025-11-23 23:25:01','2025-11-24 05:42:54',1),(26,'Potatoes',29,1.00,'2025-11-23 23:52:34','2025-11-24 03:27:57',1),(27,'Salmon',21,20.00,'2025-11-24 01:02:58','2025-11-24 05:42:54',1),(28,'Fish',5,4.00,'2025-11-24 05:38:52','2025-11-24 05:38:52',1);
/*!40000 ALTER TABLE `ingredient` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `notify_low_stock` AFTER UPDATE ON `ingredient` FOR EACH ROW BEGIN
    DECLARE threshold INT;

    SELECT LowStockThreshold INTO threshold
    FROM GlobalThreshold
    WHERE Id = 1;

    IF NEW.QuantityInStock < threshold AND OLD.QuantityInStock >= threshold THEN
        INSERT INTO notifications (Message)
        VALUES (CONCAT('Ingredient "', NEW.Name, '" is low (', NEW.QuantityInStock, ') – reorder!'));
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `inventory_order`
--

DROP TABLE IF EXISTS `inventory_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_order` (
  `InventoryOrderID` int NOT NULL AUTO_INCREMENT,
  `SupplierName` varchar(120) NOT NULL,
  `Status` enum('pending','received','delayed') DEFAULT 'pending',
  `LocationName` varchar(120) DEFAULT NULL,
  `IngredientItem` varchar(120) NOT NULL,
  `CostPerUnit` decimal(10,2) DEFAULT '0.00',
  `Quantity` int DEFAULT '0',
  `ReceivedDate` date DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`InventoryOrderID`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_order`
--

LOCK TABLES `inventory_order` WRITE;
/*!40000 ALTER TABLE `inventory_order` DISABLE KEYS */;
INSERT INTO `inventory_order` VALUES (20,'Mr robert group','pending','Heights','Beef Patty',1.50,10,'2025-11-08','2025-11-09 04:39:26'),(21,'Walmart','pending','University of Houston','Burger Bun',0.50,20,'2025-11-08','2025-11-09 04:39:26'),(22,'Farm land','pending','Galveston','Cheddar Cheese',0.75,15,'2025-11-08','2025-11-09 04:39:26'),(23,'Supermarket','pending','Downtown','Lettuce',0.30,25,'2025-11-08','2025-11-09 04:39:26');
/*!40000 ALTER TABLE `inventory_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_shipment`
--

DROP TABLE IF EXISTS `inventory_shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_shipment` (
  `ShipmentID` int NOT NULL AUTO_INCREMENT,
  `IngredientID` int DEFAULT NULL,
  `QuantityReceived` int DEFAULT NULL,
  `ShipmentDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('pending','received','cancelled') DEFAULT 'pending',
  `Cost` decimal(10,2) DEFAULT NULL,
  `SupplierName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ShipmentID`),
  KEY `IngredientID` (`IngredientID`),
  CONSTRAINT `inventory_shipment_ibfk_1` FOREIGN KEY (`IngredientID`) REFERENCES `ingredient` (`IngredientID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_shipment`
--

LOCK TABLES `inventory_shipment` WRITE;
/*!40000 ALTER TABLE `inventory_shipment` DISABLE KEYS */;
INSERT INTO `inventory_shipment` VALUES (7,1,3,'2025-06-06 00:00:00','received',4.92,NULL),(9,5,105,'2025-04-05 00:00:00','received',63.00,NULL),(14,14,14,'2025-11-23 00:00:00','received',7.00,NULL);
/*!40000 ALTER TABLE `inventory_shipment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `update_inventory_on_shipment_insert` AFTER INSERT ON `inventory_shipment` FOR EACH ROW BEGIN
    -- Only update stock if the shipment status is 'received'
    IF NEW.Status = 'received' THEN
        UPDATE Ingredient
        SET QuantityInStock = QuantityInStock + NEW.QuantityReceived
        WHERE IngredientID = NEW.IngredientID;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `update_inventory_on_shipment_update` AFTER UPDATE ON `inventory_shipment` FOR EACH ROW BEGIN
    -- Only process if status changed from non-received to received
    IF OLD.Status != 'received' AND NEW.Status = 'received' THEN
        UPDATE Ingredient
        SET QuantityInStock = QuantityInStock + NEW.QuantityReceived
        WHERE IngredientID = NEW.IngredientID;
    END IF;
    
    -- If status changed from received to something else, subtract the quantity back
    IF OLD.Status = 'received' AND NEW.Status != 'received' THEN
        UPDATE Ingredient
        SET QuantityInStock = QuantityInStock - OLD.QuantityReceived
        WHERE IngredientID = OLD.IngredientID;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `Name` varchar(30) NOT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `DailyFee` decimal(10,2) DEFAULT NULL,
  `HostPhoneNumber` varchar(10) DEFAULT NULL,
  `HostEmail` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`Name`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES ('Downtown','901 Bagby St, Houston, TX 77002',150.00,'7135558899','downtown.host@houstonpos.com','2025-10-26 03:25:29','2025-10-26 03:25:29',1),('Galveston','2228 Seawall Blvd, Galveston, TX 77550',90.00,'4095553344','galveston.host@houstonpos.com','2025-10-26 03:25:29','2025-10-26 03:25:29',1),('Heights','1423 W 19th St, Houston, TX 77008',100.00,'7135551023','host.heights@houstonpos.com','2025-10-26 03:25:29','2025-10-26 03:25:29',1),('Sugar Land','123 Food St, Sugar Land, TX 77777',20.00,'9987654321',NULL,'2025-11-11 05:02:58','2025-11-11 05:02:58',1),('University of Houston','4800 Calhoun Rd, Houston, TX 77004',120.00,'7135552045','uhhost@houstonpos.com','2025-10-26 03:25:29','2025-10-26 03:25:29',1);
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_item`
--

DROP TABLE IF EXISTS `menu_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item` (
  `MenuItemID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(30) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `ImageURL` varchar(255) DEFAULT NULL,
  `Category` enum('appetizer','entree','dessert','beverage') DEFAULT NULL,
  `Availability` tinyint(1) DEFAULT '1',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`MenuItemID`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_item`
--

LOCK TABLES `menu_item` WRITE;
/*!40000 ALTER TABLE `menu_item` DISABLE KEYS */;
INSERT INTO `menu_item` VALUES (1,'Super Burger','Beef patty with cheese, lettuce, tomato, and house sauce.',12.00,'/menu/SuperBurger.jpeg','entree',1,'2025-10-26 03:25:30','2025-11-24 00:47:37',1),(2,'Classic Burger','Beef patty with cheese, lettuce, tomato, and house sauce.',14.99,'/menu/ClassicBurger.webp','entree',1,'2025-10-26 03:25:30','2025-11-24 00:47:27',1),(3,'Chicken Tacos','Three grilled chicken tacos with cilantro, onion, and lime.',7.49,'/menu/ChickenTacos.jpg','entree',1,'2025-10-26 03:25:30','2025-11-23 03:43:21',1),(4,'Crepe Super Deluxe','Sweet crepe filled with Nutella, strawberries, and whipped cream.',6.99,'/menu/Crepes.jpg','entree',1,'2025-10-26 03:25:30','2025-11-23 03:43:21',1),(5,'Cheesecake Slice','Creamy New York–style cheesecake with graham crust.',3.50,'/menu/CheesecakeSlice.jpg','dessert',1,'2025-10-26 03:25:30','2025-11-23 03:43:22',1),(6,'Iced Tea','Fresh brewed tea served over ice with lemon slice.',2.00,'/menu/IcedTea.jpg','beverage',1,'2025-10-26 03:25:30','2025-11-23 03:43:22',1),(19,'Avocado','Avocado',2.02,'/menu/Avocado.webp','appetizer',1,'2025-11-09 20:05:30','2025-11-23 03:19:20',1),(20,'Latte','Coffee mixed with milk',5.02,'/menu/Latte.jpg','beverage',1,'2025-11-11 17:54:53','2025-11-23 03:43:22',0),(29,'Milkshake','The best drink!',4.99,'/menu/Milkshake.jpg','beverage',1,'2025-11-12 23:11:48','2025-11-24 04:00:11',1),(30,'Green Tea','Hot green tea.',6.99,'/menu/GreenTea.webp','beverage',1,'2025-11-12 23:12:09','2025-11-24 04:00:03',1),(31,'Chicken Tenders','3 crispy, fried chicken tenders.',6.49,'https://www.simplyrecipes.com/thmb/mbGI_EKp-S9ZD5VAQTntW23tAfQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/simply-recipes-air-fryer-chicken-tenders-lead-3-ef50aa06270c41ac8d26c90600d9d8cb.jpg','appetizer',1,'2025-11-23 23:02:10','2025-11-24 00:28:16',1),(32,'S\'mores','Melted marshmallow topped with Nutella in a graham cracker.',5.50,'https://www.allrecipes.com/thmb/OH-rvI7qq5McTSTRBnP1U_1ZaC8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/22146-smores-VAT-001-4x3-c1b1e87400cf46e58858723a2e0431ce.jpg','dessert',1,'2025-11-23 23:26:19','2025-11-24 00:29:47',1),(33,'French Fries','Golden crispy potatoes.',3.95,'https://www.frieddandelions.com/wp-content/uploads/2022/03/frozen-french-fries-2-580x877.jpg','appetizer',1,'2025-11-23 23:51:48','2025-11-24 00:31:02',1),(34,'Loaded baked potato','Rich baked potato topped with cheese.',7.89,'https://tastesbetterfromscratch.com/wp-content/uploads/2023/12/Twice-Baked-Potatoes-1.jpg','entree',1,'2025-11-24 00:00:23','2025-11-24 00:31:39',1),(35,'Chicken Burrito','Seasoned chicken with fresh veggies wrapped in a tortilla.',12.99,'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Burrito.JPG/1200px-Burrito.JPG','entree',1,'2025-11-24 00:37:32','2025-11-24 00:37:54',1),(36,'Seafood','Grilled fish.',30.00,'https://images.squarespace-cdn.com/content/v1/631f5e83d167cc46cf297a43/6c03ad97-5f1d-445e-bbc3-2e4bfda4dc1a/053A2110.jpg?format=2500w','entree',1,'2025-11-24 00:49:06','2025-11-24 03:59:32',1),(37,'eweer','rwewew',22.00,'https://placehold.co/600x400?text=eweer','entree',1,'2025-11-24 01:53:18','2025-11-24 01:53:23',0);
/*!40000 ALTER TABLE `menu_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `Message` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('unread','read') DEFAULT 'unread',
  PRIMARY KEY (`NotificationID`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Ingredient \"Lettuce\" is low (8)– reorder!','2025-10-28 00:15:04','read'),(2,'Ingredient \"Beaunt\" is low (7) – reorder!','2025-10-28 00:45:10','read'),(4,'Ingredient \"Vegan Patty\" is low (5) – reorder!','2025-11-12 02:46:39','read'),(5,'Ingredient \"Tortilla\" is low (9) – reorder!','2025-11-12 02:59:06','read'),(6,'Ingredient \"Oat Milk\" is low (0) – reorder!','2025-11-12 03:27:39','read'),(7,'Ingredient \"Burger Bun\" is low (9) – reorder!','2025-11-12 07:14:51','read'),(8,'Ingredient \"Tortilla\" is low (9) – reorder!','2025-11-12 17:42:09','read'),(9,'Ingredient \"Tortilla\" is low (9) – reorder!','2025-11-12 18:07:50','read'),(10,'Ingredient \"Tortilla\" is low (9) – reorder!','2025-11-12 18:22:20','read'),(11,'Ingredient \"Tortilla\" is low (9) – reorder!','2025-11-12 22:15:39','read'),(12,'Ingredient \"Oat Milk\" is low (0) – reorder!','2025-11-12 23:14:47','read'),(13,'Ingredient \"Tortilla\" is low (9) – reorder!','2025-11-12 23:57:55','read'),(14,'Ingredient \"Vegan Patty\" is low (9) – reorder!','2025-11-22 23:56:45','read'),(15,'Ingredient \"Sugar Syrup\" is low (14) – reorder!','2025-11-23 06:14:55','read'),(16,'Ingredient \"Espresso\" is low (19) – reorder!','2025-11-23 06:29:22','read'),(17,'Ingredient \"Sugar Syrup\" is low (13) – reorder!','2025-11-23 06:37:48','read'),(18,'Ingredient \"Sugar Syrup\" is low (22) – reorder!','2025-11-23 18:57:21','read'),(19,'Ingredient \"Sugar Syrup\" is low (21) – reorder!','2025-11-23 18:57:57','read'),(20,'Ingredient \"Strawberries\" is low (22) – reorder!','2025-11-23 23:02:49','read'),(21,'Ingredient \"Sugar Syrup\" is low (9) – reorder!','2025-11-24 02:00:14','read'),(22,'Ingredient \"Avocado\" is low (3) – reorder!','2025-11-24 02:02:02','read');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `CustomerID` int DEFAULT NULL,
  `StaffID` int DEFAULT NULL,
  `LocationName` varchar(30) DEFAULT NULL,
  `OrderDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `WasPlacedOnline` tinyint(1) DEFAULT '0',
  `PaymentMethod` enum('cash','card') DEFAULT NULL,
  `UsedIncentivePoints` int DEFAULT '0',
  `TotalAmount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `StaffID` (`StaffID`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`) ON DELETE RESTRICT,
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,1,9,'Downtown','2025-10-21 06:30:00',1,'card',10,18.99),(2,2,9,'Heights','2025-10-21 07:10:00',0,'cash',0,22.50),(3,3,7,'University of Houston','2025-10-22 05:45:00',1,'card',20,15.50),(4,4,9,'Galveston','2025-10-22 09:30:00',0,'cash',0,27.00),(5,5,9,'Downtown','2025-10-23 03:50:00',1,'card',15,9.00),(20,1,9,'Galveston','2025-10-26 10:14:30',1,'card',0,19.67),(21,1,1,'Galveston','2025-10-26 12:43:03',1,'card',0,8.24),(22,1,5,'Downtown','2025-10-26 23:00:38',1,'card',0,8.99),(24,6,1,'University of Houston','2025-10-27 15:54:44',1,'card',0,9.89),(25,6,1,'University of Houston','2025-10-27 19:07:10',1,'card',0,9.89),(26,6,1,'University of Houston','2025-10-28 00:12:16',1,'card',0,13.19),(29,1,9,'Galveston','2025-11-05 18:15:21',1,'card',0,8.24),(31,1,9,'Galveston','2025-11-07 23:13:49',1,'card',0,9.89),(32,1,NULL,'Galveston','2025-11-09 17:25:28',1,'card',0,8.24),(33,1,10,'Galveston','2025-11-09 17:31:46',1,'card',0,8.24),(34,1,NULL,'Galveston','2025-11-09 17:34:11',1,'card',0,7.69),(35,1,NULL,'Galveston','2025-11-09 17:41:01',1,'card',0,3.85),(36,1,NULL,'University of Houston','2025-11-09 18:22:38',1,'card',0,2.20),(37,1,9,'University of Houston','2025-11-09 18:27:09',1,'card',0,3.85),(38,1,9,'University of Houston','2025-11-09 19:34:23',1,'card',0,2.20),(39,1,NULL,'University of Houston','2025-11-09 19:36:33',1,'card',0,14.29),(40,1,NULL,'University of Houston','2025-11-09 19:37:33',1,'card',0,10.99),(41,1,NULL,'University of Houston','2025-11-10 10:54:04',1,'card',0,8.24),(42,1,NULL,'University of Houston','2025-11-10 17:04:10',1,'card',0,2.21),(43,1,NULL,'University of Houston','2025-11-10 17:04:46',1,'card',0,12.09),(44,1,NULL,'University of Houston','2025-11-10 17:05:30',1,'card',0,7.69),(45,1,NULL,'University of Houston','2025-11-10 17:11:40',1,'card',0,7.69),(46,12,NULL,'University of Houston','2025-11-10 23:20:34',1,'card',0,14.84),(47,13,NULL,'University of Houston','2025-11-10 23:26:17',1,'card',0,3.85),(48,13,NULL,'University of Houston','2025-11-10 23:27:34',1,'card',0,8.24),(49,12,NULL,'University of Houston','2025-11-11 14:13:22',1,'card',0,12.09),(50,1,NULL,'University of Houston','2025-11-11 08:16:10',1,'card',0,4.42),(51,1,NULL,'University of Houston','2025-11-11 14:25:15',1,'card',0,8.24),(52,1,NULL,'University of Houston','2025-11-11 14:31:50',1,'card',0,2.22),(53,1,NULL,'University of Houston','2025-11-11 14:52:02',1,'card',0,12.10),(54,1,9,'University of Houston','2025-11-11 14:59:06',1,'card',0,8.24),(55,1,9,'University of Houston','2025-11-11 15:11:22',1,'card',0,22.00),(56,1,9,'University of Houston','2025-11-11 15:12:19',1,'card',0,18.70),(57,NULL,9,'University of Houston','2025-11-11 19:14:46',1,'card',0,20.36),(58,6,9,'University of Houston','2025-11-11 19:35:37',1,'card',0,8.79),(60,NULL,9,'University of Houston','2025-11-11 19:55:47',0,'cash',0,9.91),(61,6,9,'University of Houston','2025-11-12 05:09:28',1,'card',0,2.22),(62,19,11,'University of Houston','2025-11-12 05:20:45',1,'card',0,8.24),(63,NULL,16,'University of Houston','2025-11-12 05:27:27',0,'cash',0,25.27),(64,20,NULL,'University of Houston','2025-11-12 05:42:03',1,'card',0,9.34),(65,20,NULL,'University of Houston','2025-11-12 05:43:45',1,'card',0,8.24),(66,20,NULL,'University of Houston','2025-11-12 05:57:31',1,'card',0,25.86),(67,20,NULL,'University of Houston','2025-11-12 06:00:15',1,'card',0,8.24),(68,20,NULL,'University of Houston','2025-11-12 06:03:51',1,'card',0,11.00),(69,20,NULL,'University of Houston','2025-11-12 06:07:45',1,'card',0,9.34),(70,20,NULL,'University of Houston','2025-11-12 06:22:15',1,'card',0,9.34),(71,1,NULL,'University of Houston','2025-11-12 16:13:16',1,'card',0,2.20),(72,1,NULL,'University of Houston','2025-11-12 16:15:39',1,'card',0,9.34),(73,21,11,'University of Houston','2025-11-12 17:00:54',1,'card',0,18.72),(74,22,11,'University of Houston','2025-11-12 17:22:18',1,'card',0,29.81),(75,22,12,'University of Houston','2025-11-12 17:22:19',1,'card',0,29.81),(76,24,10,'University of Houston','2025-11-12 17:51:46',1,'card',0,22.02),(77,NULL,10,'University of Houston','2025-11-12 17:53:15',0,'cash',0,7.69),(78,24,12,'University of Houston','2025-11-12 17:57:55',1,'card',0,9.34),(79,1,11,'University of Houston','2025-11-21 08:34:13',1,'card',0,2.22),(197,1,9,'Galveston','2025-11-22 15:27:08',1,'card',0,21.44),(198,3,11,'Galveston','2025-11-22 18:27:06',1,'card',0,5.52),(199,3,11,'Galveston','2025-11-22 18:27:50',1,'card',0,5.52),(200,3,11,'Galveston','2025-11-22 18:29:21',1,'card',0,5.52),(202,6,11,'Galveston','2025-11-23 07:56:47',1,'card',0,10.44),(203,6,11,'Galveston','2025-11-23 07:58:55',1,'card',0,10.44),(204,6,12,'Galveston','2025-11-23 07:59:48',1,'card',0,10.44),(205,6,13,'Galveston','2025-11-23 08:09:48',1,'card',0,10.44),(206,6,12,'Galveston','2025-11-23 08:14:04',1,'card',0,10.44),(207,6,NULL,'Galveston','2025-11-23 08:39:55',1,'card',0,10.44),(208,NULL,13,'Galveston','2025-11-23 16:40:24',0,'card',0,27.50),(209,NULL,11,'Galveston','2025-11-23 16:41:11',0,'card',0,24.79),(210,NULL,13,'Galveston','2025-11-23 16:41:55',0,'cash',0,68.15),(211,NULL,11,'Galveston','2025-11-23 16:43:25',0,'cash',0,40.70),(212,NULL,9,'Galveston','2025-11-23 16:52:46',0,'cash',0,28.82),(213,NULL,11,'Galveston','2025-11-23 16:53:26',0,'cash',0,23.08),(214,NULL,9,'Galveston','2025-11-23 16:53:54',0,'card',0,32.03),(215,NULL,9,'Galveston','2025-11-23 16:54:57',0,'card',0,26.40),(216,NULL,9,'Galveston','2025-11-23 17:02:00',0,'cash',0,18.70),(217,NULL,9,'Galveston','2025-11-23 17:02:48',0,'card',0,25.27),(218,NULL,9,'Galveston','2025-11-23 17:04:57',0,'card',0,34.21),(219,NULL,11,'Galveston','2025-11-23 17:15:18',0,'card',0,11.55),(220,NULL,9,'Galveston','2025-11-23 17:15:46',0,'cash',0,34.21),(221,NULL,9,'Galveston','2025-11-23 17:16:17',0,'card',0,28.62),(222,NULL,11,'Galveston','2025-11-23 17:18:53',0,'card',0,23.10),(223,NULL,9,'Galveston','2025-11-23 17:19:20',0,'cash',0,7.14),(224,NULL,9,'Galveston','2025-11-23 17:19:39',0,'card',0,13.31),(225,NULL,11,'Galveston','2025-11-23 17:23:44',0,'cash',0,27.08),(226,NULL,11,'Galveston','2025-11-23 17:24:13',0,'card',0,16.48),(227,1,NULL,'Heights','2025-11-23 18:32:38',1,'card',0,9.36),(245,3,18,'Heights','2025-11-23 19:50:14',1,'card',0,41.68),(246,3,NULL,'Heights','2025-11-23 19:51:25',1,'card',0,13.20),(247,NULL,9,'Heights','2025-11-23 19:53:42',0,'cash',0,3.85),(248,NULL,9,'Heights','2025-11-23 19:56:16',0,'card',0,3.85),(249,1,NULL,'Heights','2025-11-23 19:57:56',1,'card',0,3.85),(250,1,NULL,'Heights','2025-11-23 20:00:14',1,'card',0,3.85),(251,NULL,9,'Heights','2025-11-23 20:02:03',0,'card',0,2.22),(252,1,NULL,'Heights','2025-11-23 20:15:45',1,'card',0,9.23),(253,1,NULL,'Heights','2025-11-23 20:45:42',1,'card',0,11.48),(254,1,NULL,'Heights','2025-11-23 21:27:56',1,'card',0,18.63),(259,6,NULL,'Galveston','2025-11-24 04:53:22',1,'card',0,10.44),(262,6,NULL,'Heights','2025-11-24 04:54:25',1,'card',0,10.44),(263,2,NULL,'Heights','2025-11-24 04:54:39',1,'card',0,21.98),(264,2,NULL,'Heights','2025-11-24 04:59:21',1,'card',0,33.00),(265,1,NULL,'Downtown','2025-11-24 05:42:54',1,'card',0,44.54);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `too_many_orders_coming_in_alert` AFTER INSERT ON `order` FOR EACH ROW BEGIN
    DECLARE count_recent INT;
    DECLARE recent_alert_count INT;
    
    SELECT COUNT(*) INTO count_recent
    FROM `order`
    WHERE OrderDate >= (NOW() - INTERVAL 15 MINUTE);
    
    SELECT COUNT(*) INTO recent_alert_count
    FROM alert
    WHERE Message = 'Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!'
    AND CreatedAt >= (NOW() - INTERVAL 15 MINUTE);

    IF count_recent > 15 AND recent_alert_count = 0 THEN
        INSERT INTO alert (Message)
        VALUES ('Over 15 orders have been placed in the past 15 minutes! Busy time. Hurry up!');
    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `OrderItemID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int DEFAULT NULL,
  `MenuItemID` int DEFAULT NULL,
  `Quantity` int DEFAULT '1',
  `Price` decimal(10,2) NOT NULL,
  `Status` enum('pending','in_progress','completed','cancelled','refunded') DEFAULT 'pending',
  PRIMARY KEY (`OrderItemID`),
  KEY `OrderID` (`OrderID`),
  KEY `MenuItemID` (`MenuItemID`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `order` (`OrderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`MenuItemID`) REFERENCES `menu_item` (`MenuItemID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=183 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1,1,2,1,10.50,'completed'),(2,2,6,1,8.49,'completed'),(3,2,3,2,11.25,'completed'),(4,3,4,1,15.50,'cancelled'),(5,3,5,1,5.00,'cancelled'),(6,4,5,2,13.50,'completed'),(7,5,6,1,5.00,'completed'),(27,20,3,1,7.49,'completed'),(28,20,1,1,8.99,'completed'),(30,21,3,1,7.49,'completed'),(33,22,2,1,8.99,'completed'),(34,24,2,1,8.99,'completed'),(35,25,2,1,8.99,'completed'),(36,26,1,1,8.99,'completed'),(39,29,3,1,7.49,'completed'),(42,31,2,1,8.99,'completed'),(43,32,3,2,7.49,'pending'),(44,33,3,1,7.49,'completed'),(45,34,4,1,6.99,'completed'),(46,35,5,1,3.50,'completed'),(47,36,19,1,2.00,'completed'),(48,37,5,1,3.50,'completed'),(49,38,6,1,2.00,'completed'),(50,39,1,1,9.99,'completed'),(51,40,1,1,9.99,'completed'),(52,41,3,1,7.49,'completed'),(53,42,19,2,2.01,'completed'),(54,43,3,1,7.49,'completed'),(55,43,5,2,3.50,'completed'),(56,44,4,1,6.99,'completed'),(57,45,4,1,6.99,'completed'),(58,46,1,22,9.99,'completed'),(59,46,5,1,3.50,'completed'),(60,47,5,2,3.50,'completed'),(61,48,3,1,7.49,'completed'),(62,49,20,27,4.99,'completed'),(63,50,6,7,2.00,'completed'),(64,50,19,1,2.02,'completed'),(65,51,3,1,7.49,'completed'),(66,52,19,1,2.02,'completed'),(67,53,1,1,11.00,'completed'),(68,54,3,1,7.49,'completed'),(69,55,1,1,11.00,'completed'),(70,56,1,1,11.00,'completed'),(71,57,19,1,2.02,'completed'),(72,57,2,1,8.99,'completed'),(73,57,5,1,3.50,'completed'),(74,58,2,1,8.99,'completed'),(75,60,4,1,6.99,'cancelled'),(76,60,19,1,2.02,'cancelled'),(77,61,19,1,2.02,'cancelled'),(78,62,3,1,7.49,'completed'),(79,63,2,1,8.99,'cancelled'),(80,63,4,2,6.99,'cancelled'),(81,64,3,1,7.49,'cancelled'),(82,65,3,1,7.49,'cancelled'),(83,66,2,2,10.00,'cancelled'),(84,66,20,1,5.02,'cancelled'),(85,66,3,1,7.49,'cancelled'),(86,67,3,1,7.49,'cancelled'),(87,68,2,1,10.00,'cancelled'),(88,69,3,1,7.49,'cancelled'),(89,70,3,1,7.49,'cancelled'),(90,71,6,1,2.00,'cancelled'),(91,72,3,1,7.49,'cancelled'),(92,73,2,1,12.00,'completed'),(93,73,20,1,5.02,'completed'),(94,74,1,1,12.10,'completed'),(95,74,2,1,15.00,'completed'),(96,75,1,1,12.10,'completed'),(97,75,2,1,15.00,'completed'),(98,76,2,1,15.00,'completed'),(99,76,20,1,5.02,'completed'),(100,77,4,1,6.99,'cancelled'),(101,78,3,1,7.49,'completed'),(102,79,19,1,2.02,'completed'),(103,197,3,1,7.49,'completed'),(104,197,5,1,3.50,'completed'),(105,197,29,1,5.00,'completed'),(106,197,5,1,3.50,'completed'),(107,198,20,1,5.02,'completed'),(108,199,20,1,5.02,'completed'),(109,200,20,1,5.02,'completed'),(110,202,3,1,7.49,'completed'),(111,203,3,1,7.49,'completed'),(112,204,3,1,7.49,'completed'),(113,205,3,1,7.49,'completed'),(114,206,3,1,7.49,'completed'),(115,207,3,1,7.49,'pending'),(116,208,29,5,5.00,'completed'),(117,209,2,1,15.00,'pending'),(118,209,5,1,3.50,'pending'),(119,209,19,2,2.02,'pending'),(120,210,4,5,6.99,'completed'),(121,210,6,3,2.00,'completed'),(122,210,30,3,7.00,'completed'),(123,211,2,2,15.00,'pending'),(124,211,6,1,2.00,'pending'),(125,211,29,1,5.00,'pending'),(126,212,1,2,12.10,'pending'),(127,212,6,1,2.00,'pending'),(128,213,4,2,6.99,'completed'),(129,213,6,1,2.00,'completed'),(130,213,29,1,5.00,'completed'),(131,214,1,1,12.10,'pending'),(132,214,2,1,15.00,'pending'),(133,214,19,1,2.02,'pending'),(134,215,6,1,2.00,'pending'),(135,215,29,3,5.00,'pending'),(136,215,30,1,7.00,'pending'),(137,216,6,1,2.00,'pending'),(138,216,29,3,5.00,'pending'),(139,217,3,1,7.49,'pending'),(140,217,4,1,8.49,'pending'),(141,217,4,1,6.99,'pending'),(142,218,1,1,12.10,'pending'),(143,218,2,1,19.00,'pending'),(144,219,5,3,3.50,'completed'),(145,220,1,1,12.10,'pending'),(146,220,2,1,15.00,'pending'),(147,220,6,2,2.00,'pending'),(148,221,19,1,2.02,'pending'),(149,221,30,1,7.00,'pending'),(150,221,2,1,17.00,'pending'),(151,222,30,3,7.00,'completed'),(152,223,31,1,6.49,'pending'),(153,224,1,1,12.10,'pending'),(154,225,1,1,12.10,'pending'),(155,225,19,1,2.02,'pending'),(156,225,5,3,3.50,'pending'),(157,226,4,2,7.49,'pending'),(158,227,19,1,2.02,'pending'),(159,227,31,1,6.49,'pending'),(160,245,34,1,7.89,'completed'),(161,245,36,1,30.00,'completed'),(162,246,1,1,12.00,'pending'),(163,247,5,1,3.50,'pending'),(164,248,5,1,3.50,'completed'),(165,249,5,1,3.50,'pending'),(166,250,5,1,3.50,'pending'),(167,251,19,1,2.02,'cancelled'),(168,252,34,1,7.89,'cancelled'),(169,253,31,1,6.49,'pending'),(170,253,33,1,3.95,'pending'),(171,254,3,1,7.49,'cancelled'),(172,254,5,1,3.50,'cancelled'),(173,254,6,1,2.00,'cancelled'),(174,254,33,1,3.95,'cancelled'),(175,259,3,1,7.49,'pending'),(176,262,3,1,7.49,'pending'),(177,263,2,1,14.99,'pending'),(178,263,29,1,4.99,'pending'),(179,264,36,1,30.00,'pending'),(180,265,29,1,4.99,'pending'),(181,265,32,1,5.50,'pending'),(182,265,36,1,30.00,'pending');
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `check_pending_orders_insert` AFTER INSERT ON `order_item` FOR EACH ROW BEGIN
    DECLARE pending_count INT;
    SELECT COUNT(DISTINCT OrderID) INTO pending_count
    FROM order_item
    WHERE Status = 'pending';
    UPDATE busy_status
    SET 
        is_busy = (pending_count > 20),
        pending_order_count = pending_count
    WHERE id = 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `subtract_ingredients_after_order` AFTER INSERT ON `order_item` FOR EACH ROW BEGIN
    -- Subtract ingredients based on menu item recipe
    -- For non-substitutable ingredients (IsRemovable=0 AND IsRequired=1): subtract QuantityRequired
    -- For substitutable ingredients: only subtract the default ingredient (IsDefault=1) per category
    UPDATE Ingredient AS i
    JOIN Used_For AS uf ON i.IngredientID = uf.IngredientID
    SET i.QuantityInStock = i.QuantityInStock - (uf.QuantityRequired * NEW.Quantity)
    WHERE uf.MenuItemID = NEW.MenuItemID
      AND (
          -- Non-substitutable required ingredients (always subtract)
          (uf.IsRequired = TRUE)
          OR
          -- Substitutable ingredients (only subtract the default for each category)
          (uf.IsDefault = TRUE AND uf.CustomizableCategory IS NOT NULL)
      );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `check_pending_orders_update` AFTER UPDATE ON `order_item` FOR EACH ROW BEGIN
    DECLARE pending_count INT;
    SELECT COUNT(DISTINCT OrderID) INTO pending_count
    FROM order_item
    WHERE Status = 'pending';
    UPDATE busy_status
    SET 
        is_busy = (pending_count > 20),
        pending_order_count = pending_count
    WHERE id = 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `check_pending_orders_delete` AFTER DELETE ON `order_item` FOR EACH ROW BEGIN
    DECLARE pending_count INT;
    SELECT COUNT(DISTINCT OrderID) INTO pending_count
    FROM order_item
    WHERE Status = 'pending';
    UPDATE busy_status
    SET 
        is_busy = (pending_count > 20),
        pending_order_count = pending_count
    WHERE id = 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `orderitemcustomization`
--

DROP TABLE IF EXISTS `orderitemcustomization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitemcustomization` (
  `OrderItemCustomizationID` int NOT NULL AUTO_INCREMENT,
  `OrderItemID` int NOT NULL,
  `IngredientID` int NOT NULL,
  `ChangeType` enum('added','removed','substituted') NOT NULL,
  `QuantityDelta` int NOT NULL DEFAULT '1',
  `PriceDelta` decimal(10,2) DEFAULT '0.00',
  `Note` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrderItemCustomizationID`),
  KEY `OrderItemID` (`OrderItemID`),
  KEY `IngredientID` (`IngredientID`),
  CONSTRAINT `orderitemcustomization_ibfk_1` FOREIGN KEY (`OrderItemID`) REFERENCES `order_item` (`OrderItemID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderitemcustomization_ibfk_2` FOREIGN KEY (`IngredientID`) REFERENCES `ingredient` (`IngredientID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitemcustomization`
--

LOCK TABLES `orderitemcustomization` WRITE;
/*!40000 ALTER TABLE `orderitemcustomization` DISABLE KEYS */;
INSERT INTO `orderitemcustomization` VALUES (5,27,7,'removed',-3,0.00,NULL,'2025-10-26 21:14:30'),(6,27,11,'removed',-1,0.00,NULL,'2025-10-26 21:14:30'),(7,28,1,'removed',-1,0.00,NULL,'2025-10-26 21:14:30'),(8,28,15,'substituted',1,0.00,NULL,'2025-10-26 21:14:30'),(9,30,7,'removed',-3,0.00,NULL,'2025-10-26 23:43:03'),(10,30,11,'removed',-1,0.00,NULL,'2025-10-26 23:43:03'),(11,36,1,'removed',-1,0.00,NULL,'2025-10-28 06:12:16'),(12,36,15,'substituted',1,0.00,NULL,'2025-10-28 06:12:16'),(13,43,7,'removed',-3,0.00,NULL,'2025-11-10 05:25:29'),(14,44,6,'removed',-1,0.00,NULL,'2025-11-10 05:31:46'),(15,50,1,'removed',-1,0.00,NULL,'2025-11-10 07:36:34'),(16,50,15,'substituted',1,0.00,NULL,'2025-11-10 07:36:34'),(17,52,7,'removed',-3,0.00,NULL,'2025-11-10 22:54:04'),(18,60,13,'removed',-1,0.00,NULL,'2025-11-11 05:26:17'),(19,62,21,'added',3,0.00,NULL,'2025-11-11 20:13:22'),(20,69,1,'removed',-1,0.00,NULL,'2025-11-12 03:11:27'),(21,69,15,'added',3,0.00,NULL,'2025-11-12 03:11:27'),(22,70,1,'removed',-1,0.00,NULL,'2025-11-12 03:12:24'),(23,70,15,'added',2,0.00,NULL,'2025-11-12 03:12:24'),(24,72,1,'added',2,0.00,NULL,'2025-11-12 07:14:51'),(25,73,12,'added',2,0.00,NULL,'2025-11-12 07:14:51'),(26,74,15,'removed',-1,0.00,NULL,'2025-11-12 07:35:42'),(27,74,1,'added',1,0.00,NULL,'2025-11-12 07:35:42'),(28,81,7,'added',1,0.00,NULL,'2025-11-12 17:42:09'),(29,85,7,'added',1,0.00,NULL,'2025-11-12 17:57:36'),(30,88,7,'added',1,0.00,NULL,'2025-11-12 18:07:50'),(31,89,7,'added',1,0.00,NULL,'2025-11-12 18:22:20'),(32,91,7,'added',1,0.00,NULL,'2025-11-12 22:15:39'),(33,101,7,'added',1,0.00,NULL,'2025-11-12 23:57:55'),(34,106,13,'added',1,0.00,NULL,'2025-11-23 03:27:10'),(35,107,21,'added',1,0.00,NULL,'2025-11-23 06:27:08'),(36,109,21,'added',1,0.00,NULL,'2025-11-23 06:29:22'),(37,110,7,'added',2,0.00,NULL,'2025-11-23 19:57:00'),(38,111,7,'added',2,0.00,NULL,'2025-11-23 19:59:08'),(39,112,7,'added',2,0.00,NULL,'2025-11-23 20:00:01'),(40,113,7,'added',2,0.00,NULL,'2025-11-23 20:10:00'),(41,114,7,'added',2,0.00,NULL,'2025-11-23 20:14:17'),(42,115,11,'added',3,0.00,NULL,'2025-11-23 20:40:08'),(43,115,7,'added',2,0.00,NULL,'2025-11-23 20:40:08'),(44,139,11,'added',2,0.00,NULL,'2025-11-23 23:02:48'),(45,140,11,'removed',-1,0.00,NULL,'2025-11-23 23:02:48'),(46,140,12,'added',3,0.00,NULL,'2025-11-23 23:02:49'),(47,140,9,'added',2,0.00,NULL,'2025-11-23 23:02:49'),(48,141,12,'removed',-1,0.00,NULL,'2025-11-23 23:02:49'),(49,143,1,'added',2,0.00,NULL,'2025-11-23 23:04:58'),(50,143,3,'added',2,0.00,NULL,'2025-11-23 23:04:58'),(51,143,5,'added',1,0.00,NULL,'2025-11-23 23:04:58'),(52,143,4,'added',1,0.00,NULL,'2025-11-23 23:04:58'),(53,144,12,'added',1,0.00,NULL,'2025-11-23 23:15:18'),(54,144,13,'added',1,0.00,NULL,'2025-11-23 23:15:18'),(55,144,14,'added',1,0.00,NULL,'2025-11-23 23:15:18'),(56,150,1,'added',1,0.00,NULL,'2025-11-23 23:16:17'),(57,156,12,'added',1,0.00,NULL,'2025-11-23 23:23:45'),(58,156,13,'added',1,0.00,NULL,'2025-11-23 23:23:45'),(59,156,14,'added',1,0.00,NULL,'2025-11-23 23:23:45'),(60,157,11,'removed',-1,0.00,NULL,'2025-11-23 23:24:13'),(61,157,12,'substituted',1,0.00,NULL,'2025-11-23 23:24:13'),(62,157,9,'added',2,0.00,NULL,'2025-11-23 23:24:13'),(63,157,8,'added',2,0.00,NULL,'2025-11-23 23:24:13'),(64,162,1,'added',1,0.00,NULL,'2025-11-24 01:51:25'),(65,166,12,'added',1,0.00,NULL,'2025-11-24 02:00:14'),(66,168,3,'added',1,0.00,NULL,'2025-11-24 02:15:45'),(67,175,7,'added',2,0.00,NULL,'2025-11-24 04:53:23'),(68,176,7,'added',2,0.00,NULL,'2025-11-24 04:54:25');
/*!40000 ALTER TABLE `orderitemcustomization` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`pos3380`@`%`*/ /*!50003 TRIGGER `apply_customization_inventory` AFTER INSERT ON `orderitemcustomization` FOR EACH ROW BEGIN
    DECLARE item_quantity INT;
    
    -- Get the quantity of the order item
    SELECT Quantity INTO item_quantity
    FROM Order_Item
    WHERE OrderItemID = NEW.OrderItemID;
    
    -- Apply the inventory change based on customization
    -- QuantityDelta represents the per-item change:
    --   Positive: adding extra ingredients (e.g., +1 for extra cheese)
    --   Negative: removing ingredients (e.g., -1 for removing beef when substituting)
    -- 
    -- The actual inventory change is: QuantityDelta * OrderItem.Quantity
    -- 
    -- Examples:
    --   - Customer orders 2 burgers with extra cheese (+1): subtract 1 * 2 = 2 extra cheese
    --   - Customer substitutes beef with vegan patty: 
    --       * Remove beef: QuantityDelta = -1, subtract -1 * 2 = add back 2 beef
    --       * Add vegan patty: QuantityDelta = +1, subtract 1 * 2 = 2 vegan patties
    
    UPDATE Ingredient
    SET QuantityInStock = QuantityInStock - (NEW.QuantityDelta * item_quantity)
    WHERE IngredientID = NEW.IngredientID;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `StaffID` int NOT NULL AUTO_INCREMENT,
  `Role` enum('admin','manager','employee') DEFAULT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `PhoneNumber` varchar(10) DEFAULT NULL,
  `Fname` varchar(20) DEFAULT NULL,
  `Lname` varchar(20) DEFAULT NULL,
  `PayRate` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`StaffID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'admin','admin@houstonpos.com','hash_admin_001','7135550001','John','Smith',35.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(2,'manager','maria.lopez@houstonpos.com','hash_mgr_002','7135550002','Maria','Lopez',25.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(3,'manager','ethan.patel@houstonpos.com','hash_mgr_003','7135550003','Ethan','Patel',26.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(4,'employee','linda.cho@houstonpos.com','hash_emp_004','7135550004','Linda','Cho',13.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(5,'employee','tom.nguyen@houstonpos.com','hash_emp_005','7135550005','Tom','Nguyen',15.90,'2025-10-26 03:25:30','2025-11-12 05:29:54',1),(6,'employee','aisha.khan@houstonpos.com','hash_emp_006','7135550006','Aisha','Khan',14.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(7,'employee','carlos.mendez@houstonpos.com','hash_emp_007','7135550007','Carlos','Mendez',13.75,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(8,'employee','olivia.james@houstonpos.com','hash_emp_008','7135550008','Olivia','James',13.25,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(9,'manager','james.martin@houstonpos.com','866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5','8325551001','James','Martin',28.50,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(10,'employee','linda.garcia@houstonpos.com','fd78010168cfd30e55001a0af84fa7b69261a9fa7c06629682760778839964b8','8325551002','Linda','Garcia',18.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(11,'employee','robert.kim@houstonpos.com','d5564f8f2d51b4e72484b2a4f2a698d0ad396ec16a49f4d7f015bbfa55e79791','8325551003','Robert','Kim',20.00,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(12,'employee','sophia.chan@houstonpos.com','95cff32110f03063ba4c7a5e267b30a9e9705d2bb5b83dae2a41c09acf50750c','8325551004','Sophia','Chan',19.50,'2025-10-26 03:25:30','2025-10-26 03:25:30',1),(13,'employee','nathan.owens@houstonpos.com','cc8c368fde9cc291c8ea587790342f929d70fa06f612cd51b6141ea5bca46bdb','8325551005','Nathan','Owens',17.74,'2025-10-26 03:25:30','2025-11-11 05:06:47',1),(16,'manager','admin@email.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','1234567889','admin','admin2',12.00,'2025-11-12 08:07:58','2025-11-24 03:11:14',1),(18,'manager','amiri@houstonpos.com','866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5','8325551004','amiri','slak',28.50,'2025-11-24 00:16:02','2025-11-24 00:16:02',1);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timecard`
--

DROP TABLE IF EXISTS `timecard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timecard` (
  `TimecardID` int NOT NULL AUTO_INCREMENT,
  `StaffID` int DEFAULT NULL,
  `LocationName` varchar(30) DEFAULT NULL,
  `ClockInTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ClockOutTime` timestamp NULL DEFAULT NULL,
  `TotalHours` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`TimecardID`),
  KEY `StaffID` (`StaffID`),
  KEY `LocationName` (`LocationName`),
  CONSTRAINT `timecard_ibfk_1` FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`) ON DELETE RESTRICT,
  CONSTRAINT `timecard_ibfk_2` FOREIGN KEY (`LocationName`) REFERENCES `location` (`Name`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timecard`
--

LOCK TABLES `timecard` WRITE;
/*!40000 ALTER TABLE `timecard` DISABLE KEYS */;
INSERT INTO `timecard` VALUES (4,1,'University of Houston','2025-11-09 08:00:00','2025-11-09 17:00:00',9.00),(5,2,'Galveston','2025-11-09 09:00:00','2025-11-09 17:00:00',8.00),(6,3,'University of Houston','2025-11-09 10:00:00','2025-11-09 18:00:00',8.00),(7,2,'Downtown','2025-11-10 08:00:00','2025-11-10 17:00:00',9.00),(8,3,'Galveston','2025-11-10 09:00:00','2025-11-10 17:00:00',8.00),(9,4,'Heights','2025-11-10 10:00:00','2025-11-10 18:30:00',8.50),(10,5,'University of Houston','2025-11-10 08:30:00','2025-11-10 17:30:00',9.00),(11,6,'Downtown','2025-11-10 11:00:00','2025-11-10 19:00:00',8.00),(12,7,'Galveston','2025-11-10 07:30:00','2025-11-10 15:30:00',8.00),(13,8,'Heights','2025-11-10 12:00:00','2025-11-10 20:00:00',8.00),(14,9,'University of Houston','2025-11-10 09:00:00','2025-11-10 18:00:00',9.00),(15,10,'Downtown','2025-11-11 08:00:00','2025-11-11 16:00:00',8.00),(16,11,'Galveston','2025-11-11 09:00:00','2025-11-11 18:00:00',9.00),(17,12,'Heights','2025-11-11 10:00:00','2025-11-11 18:00:00',8.00),(18,13,'University of Houston','2025-11-11 08:30:00','2025-11-11 17:00:00',8.50),(19,2,'Downtown','2025-11-11 12:00:00','2025-11-11 20:00:00',8.00),(20,3,'Galveston','2025-11-11 07:00:00','2025-11-11 15:00:00',8.00),(21,4,'Heights','2025-11-11 13:00:00','2025-11-11 21:00:00',8.00),(22,5,'University of Houston','2025-11-11 09:30:00','2025-11-11 18:30:00',9.00),(23,6,'Downtown','2025-11-12 08:00:00','2025-11-12 17:00:00',9.00),(24,7,'Galveston','2025-11-12 09:00:00','2025-11-12 17:00:00',8.00),(25,8,'Heights','2025-11-12 10:00:00','2025-11-12 19:00:00',9.00),(26,9,'University of Houston','2025-11-12 11:00:00','2025-11-12 19:00:00',8.00),(27,10,'Downtown','2025-11-12 07:30:00','2025-11-12 16:00:00',8.50),(28,11,'Galveston','2025-11-12 12:00:00','2025-11-12 20:00:00',8.00),(29,12,'Heights','2025-11-12 08:30:00','2025-11-12 17:30:00',9.00),(30,13,'University of Houston','2025-11-12 10:00:00','2025-11-12 18:00:00',8.00),(31,16,'University of Houston','2025-11-12 08:28:31','2025-11-12 08:33:34',3.00),(32,16,'University of Houston','2025-11-12 08:38:13','2025-11-12 17:24:44',2.77),(33,10,'University of Houston','2025-11-12 23:22:55','2025-11-12 23:23:05',0.00),(35,1,'University of Houston','2025-11-13 08:00:00','2025-11-13 17:00:00',9.00),(36,2,'Galveston','2025-11-13 09:00:00','2025-11-13 17:00:00',8.00),(37,3,'Downtown','2025-11-13 10:00:00','2025-11-13 18:00:00',8.00),(38,4,'Heights','2025-11-13 08:30:00','2025-11-13 17:00:00',8.50),(39,5,'University of Houston','2025-11-13 09:00:00','2025-11-13 18:00:00',9.00),(40,6,'Downtown','2025-11-13 11:00:00','2025-11-13 19:00:00',8.00),(41,7,'Galveston','2025-11-13 07:30:00','2025-11-13 15:30:00',8.00),(42,8,'Heights','2025-11-13 12:00:00','2025-11-13 20:00:00',8.00),(43,9,'University of Houston','2025-11-13 09:00:00','2025-11-13 18:00:00',9.00),(44,10,'Downtown','2025-11-13 08:00:00','2025-11-13 16:30:00',8.50),(45,11,'Galveston','2025-11-14 09:00:00','2025-11-14 18:00:00',9.00),(46,12,'Heights','2025-11-14 10:00:00','2025-11-14 18:00:00',8.00),(47,13,'University of Houston','2025-11-14 08:30:00','2025-11-14 17:30:00',9.00),(48,16,'University of Houston','2025-11-14 08:20:00','2025-11-14 12:20:00',4.00),(49,16,'University of Houston','2025-11-14 13:00:00','2025-11-14 17:30:00',4.50),(50,11,'University of Houston','2025-11-23 22:39:14','2025-11-23 22:43:39',0.07),(51,9,'University of Houston','2025-11-23 22:52:59','2025-11-23 23:03:21',0.17),(55,9,'Heights','2025-11-24 02:43:25','2025-11-24 02:43:37',0.00),(56,11,'Heights','2025-11-24 03:00:32','2025-11-24 03:16:35',0.27),(57,16,'Heights','2025-11-24 03:02:50','2025-11-24 03:02:58',0.00),(58,16,'Heights','2025-11-24 03:05:36','2025-11-24 03:06:42',0.00),(59,16,'Heights','2025-11-24 03:07:23','2025-11-24 03:07:35',0.00),(60,16,'Heights','2025-11-24 03:08:23','2025-11-24 03:08:29',0.00),(61,16,'Heights','2025-11-24 03:09:04','2025-11-24 03:09:14',0.00),(62,16,'Heights','2025-11-24 03:09:47','2025-11-24 03:10:32',0.01),(64,2,'Galveston','2025-02-10 08:00:00','2025-02-10 16:30:00',8.50),(65,3,'Heights','2025-02-10 09:00:00','2025-02-10 17:00:00',8.00);
/*!40000 ALTER TABLE `timecard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck`
--

DROP TABLE IF EXISTS `truck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck` (
  `FoodTruckName` varchar(30) NOT NULL,
  `ContactEmail` varchar(255) DEFAULT NULL,
  `PhoneNumber` varchar(10) DEFAULT NULL,
  `ManagerID` int DEFAULT NULL,
  `BackgroundURL` varchar(255) DEFAULT NULL,
  `ManagerStartDate` timestamp NULL DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Status` tinyint(1) DEFAULT '0',
  `Tagline` text,
  PRIMARY KEY (`FoodTruckName`),
  KEY `ManagerID` (`ManagerID`),
  CONSTRAINT `truck_ibfk_1` FOREIGN KEY (`ManagerID`) REFERENCES `staff` (`StaffID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck`
--

LOCK TABLES `truck` WRITE;
/*!40000 ALTER TABLE `truck` DISABLE KEYS */;
INSERT INTO `truck` VALUES ('Amazing Foodtruck','GreatFood@houstonpos.com','7135559011',2,'https://www.eatingwell.com/thmb/m5xUzIOmhWSoXZnY-oZcO9SdArQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/article_291139_the-top-10-healthiest-foods-for-kids_-02-4b745e57928c4786a61b47d8ba920058.jpg','2025-01-01 08:00:00','2025-10-26 03:25:30','2025-11-24 02:30:36',1,'A Houston-based food truck serving bold flavors inspired by the city’s diverse food scene. Fresh ingredients, big taste, and friendly Texas hospitality.');
/*!40000 ALTER TABLE `truck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `used_for`
--

DROP TABLE IF EXISTS `used_for`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `used_for` (
  `UsedForID` int NOT NULL AUTO_INCREMENT,
  `MenuItemID` int DEFAULT NULL,
  `IngredientID` int DEFAULT NULL,
  `CustomizableCategory` varchar(30) DEFAULT NULL,
  `QuantityRequired` int DEFAULT '1',
  `MaximumQuantity` int DEFAULT '10',
  `IsDefault` tinyint(1) DEFAULT '0',
  `PriceAdjustment` decimal(10,2) DEFAULT '0.00',
  `IsRequired` tinyint(1) DEFAULT '0',
  `CanSubstitute` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`UsedForID`),
  UNIQUE KEY `MenuItemID` (`MenuItemID`,`IngredientID`),
  KEY `IngredientID` (`IngredientID`),
  CONSTRAINT `used_for_ibfk_1` FOREIGN KEY (`MenuItemID`) REFERENCES `menu_item` (`MenuItemID`) ON DELETE RESTRICT,
  CONSTRAINT `used_for_ibfk_2` FOREIGN KEY (`IngredientID`) REFERENCES `ingredient` (`IngredientID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `used_for`
--

LOCK TABLES `used_for` WRITE;
/*!40000 ALTER TABLE `used_for` DISABLE KEYS */;
INSERT INTO `used_for` VALUES (13,5,13,NULL,1,10,0,0.00,0,0),(14,5,14,NULL,1,10,0,0.00,0,0),(15,5,12,NULL,1,10,0,0.00,0,0),(16,6,10,NULL,1,10,0,0.00,0,0),(17,6,11,NULL,1,10,0,0.00,0,0),(18,6,12,NULL,1,10,0,0.00,0,0),(76,3,6,NULL,1,1,0,0.00,1,0),(77,3,7,NULL,1,3,0,1.00,1,0),(78,3,11,NULL,1,4,0,0.00,0,0),(94,20,21,NULL,1,10,0,0.00,0,0),(95,1,1,NULL,1,10,0,0.00,1,1),(96,1,15,NULL,1,10,0,3.00,1,1),(97,1,8,'Addon',1,10,1,0.00,0,0),(98,19,24,NULL,1,1,0,0.00,1,0),(110,32,14,NULL,4,10,1,0.00,0,0),(111,32,25,'Toppings',2,10,1,0.00,0,0),(112,32,8,'Toppings',2,10,1,0.00,0,0),(126,2,2,NULL,1,1,1,0.00,1,0),(127,2,3,NULL,1,3,1,0.00,1,0),(128,2,4,'Optional Toppings',1,2,1,0.00,0,0),(129,2,5,'Optional Toppings',1,2,1,0.00,0,0),(130,2,1,'Patty',1,3,1,2.00,1,1),(131,2,16,'Patty',1,3,0,3.00,1,1),(136,31,6,NULL,2,2,1,0.00,1,0),(137,35,7,NULL,1,10,1,0.00,1,0),(138,35,6,'Fillings',1,2,1,1.00,0,0),(139,35,4,'Fillings',1,2,1,0.00,0,0),(140,35,5,'Fillings',1,2,1,0.00,0,0),(141,34,26,NULL,1,1,1,0.00,1,0),(142,34,3,'Cheese',1,2,1,0.50,0,0),(143,34,13,'Cheese',1,2,1,0.50,0,0),(144,4,9,NULL,3,10,0,0.00,1,0),(145,4,8,NULL,1,10,0,0.00,0,0),(146,4,12,'Topping',1,10,0,0.50,1,1),(148,36,27,NULL,1,1,1,0.00,1,0),(149,33,26,NULL,1,1,1,0.00,1,0);
/*!40000 ALTER TABLE `used_for` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utility_payment`
--

DROP TABLE IF EXISTS `utility_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utility_payment` (
  `PaymentID` int NOT NULL AUTO_INCREMENT,
  `LocationName` varchar(30) DEFAULT NULL,
  `PaymentDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Amount` decimal(10,2) NOT NULL,
  `UtilityType` enum('electricity','water','gas','internet','phone','other') DEFAULT NULL,
  `TotalAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `PaymentCode` varchar(64) DEFAULT NULL,
  `Type` enum('water','electricity','gas','other') DEFAULT 'other',
  PRIMARY KEY (`PaymentID`),
  UNIQUE KEY `PaymentCode` (`PaymentCode`),
  KEY `LocationName` (`LocationName`),
  CONSTRAINT `utility_payment_ibfk_1` FOREIGN KEY (`LocationName`) REFERENCES `location` (`Name`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utility_payment`
--

LOCK TABLES `utility_payment` WRITE;
/*!40000 ALTER TABLE `utility_payment` DISABLE KEYS */;
INSERT INTO `utility_payment` VALUES (30,'Heights','2025-11-08 00:00:00',120.00,'electricity',120.00,'2025-11-09 19:11:44','1001','other'),(31,'Downtown','2025-11-08 00:00:00',135.00,'water',135.00,'2025-11-09 19:11:44','1002','other'),(33,'Galveston','2025-11-08 00:00:00',110.00,'phone',110.00,'2025-11-09 19:11:44','1004','other'),(46,'Heights','2025-12-11 00:00:00',100.00,'internet',0.00,'2025-11-12 23:23:11',NULL,'other'),(47,'Heights','2025-11-23 00:00:00',25.00,'gas',0.00,'2025-11-24 02:23:46',NULL,'other'),(48,'Sugar Land','2025-11-09 00:00:00',32.00,'internet',0.00,'2025-11-24 02:25:15',NULL,'other'),(49,'University of Houston','2025-11-02 00:00:00',55.00,'water',0.00,'2025-11-24 02:25:49',NULL,'other');
/*!40000 ALTER TABLE `utility_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'pos'
--

--
-- Dumping routines for database 'pos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24  0:00:26
