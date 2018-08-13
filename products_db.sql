SELECT * FROM bamazon_db.products;

use bamazon_db;

select avg(price) from products;
select avg(stock_quantity) from products where item_id >= 4 and item_id < 6;

UPDATE products SET stock_quantity = 40 WHERE item_id = 2;