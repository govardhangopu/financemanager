CREATE DATABASE IF NOT EXISTS financemanager;
USE financemanager;

CREATE TABLE IF NOT EXISTS `financemanager`.`users` (
  `userid` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `username` VARCHAR(45) NOT NULL UNIQUE,
  `password` VARCHAR(45) NOT NULL UNIQUE,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`userid`));

CREATE TABLE IF NOT EXISTS `financemanager`.`categories` (
  `categoryid` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  `parent_categoryid` INT DEFAULT NULL,
  `userid` INT DEFAULT NULL,
  `is_partial` TINYINT NOT NULL DEFAULT '0',
  PRIMARY KEY (`categoryid`),
  UNIQUE KEY `categoryid_UNIQUE` (`categoryid`),
  KEY `parent_categoryid_fk_idx` (`parent_categoryid`),
  CONSTRAINT `parent_categoryid_fk` FOREIGN KEY (`parent_categoryid`) REFERENCES `categories` (`categoryid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `categories_chk_1` CHECK ((`type` in (_utf8mb4'income',_utf8mb4'expense')))
);

CREATE TABLE IF NOT EXISTS `financemanager`.`transactions` (
  `transactionid` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `categoryid` INT NULL,
  `is_partial` TINYINT NOT NULL DEFAULT 0,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`transactionid`),
  UNIQUE INDEX `transactionid_UNIQUE` (`transactionid` ASC) VISIBLE,
  CONSTRAINT `categoryid_fk`
    FOREIGN KEY (`categoryid`)
    REFERENCES `financemanager`.`categories` (`categoryid`)
    ON DELETE SET NULL
    ON UPDATE SET NULL,
  CONSTRAINT `userid_fk`
    FOREIGN KEY (`userid`)
    REFERENCES `financemanager`.`users` (`userid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE  IF NOT EXISTS `financemanager`.`budgets` (
  `budgetid` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `target_amount` DECIMAL(10,2) NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `budget_type` VARCHAR(100) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  PRIMARY KEY (`budgetid`),
  UNIQUE INDEX `budgetid_UNIQUE` (`budgetid` ASC) VISIBLE,
  CONSTRAINT `userid_fk2`
    FOREIGN KEY (`userid`)
    REFERENCES `financemanager`.`users` (`userid`)
    ON DELETE CASCADE
    ON UPDATE  CASCADE);

CREATE TABLE IF NOT EXISTS `financemanager`.`budget_categories` (
  `budgetid` INT NOT NULL,
  `categoryid` INT NOT NULL,
  PRIMARY KEY (`categoryid`, `budgetid`),
  INDEX `bud_cat_fk1_idx` (`budgetid` ASC) VISIBLE,
  CONSTRAINT `bud_cat_fk1`
    FOREIGN KEY (`budgetid`)
    REFERENCES `financemanager`.`budgets` (`budgetid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `bud_cat_fk2`
    FOREIGN KEY (`categoryid`)
    REFERENCES `financemanager`.`categories` (`categoryid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE IF NOT EXISTS `financemanager`.`budget_transactions` (
  `budgetid` INT NOT NULL,
  `transactionid` INT NOT NULL,
  PRIMARY KEY (`transactionid`, `budgetid`),
  INDEX `bud_transac_fk1_idx` (`budgetid` ASC) VISIBLE,
  CONSTRAINT `bud_transac_fk1`
    FOREIGN KEY (`budgetid`)
    REFERENCES `financemanager`.`budgets` (`budgetid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `bud_transac_fk2`
    FOREIGN KEY (`transactionid`)
    REFERENCES `financemanager`.`transactions` (`transactionid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);