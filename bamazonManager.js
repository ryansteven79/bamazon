var inquirer = require('inquirer');
var mysql = require('mysql');
var colors = require('colors');
const cTable = require('console.table');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "TheMarty831",
    database: "bamazon_db"
})

connection.connect(function (err) {
    displayItems();
})

function displayItems() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.table(results);
        doSomething();
    })
}

function doSomething() {
    inquirer.prompt([{
        name: "action",
        type: "list",
        message: "Please select an action:",
        choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add Product"]
    }]).then(function (input) {
        var selectedAction = input.action;

        switch (selectedAction) {
            case "View Products":
                displayTable();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                updateInventory();
                break;
            case "Add Product":
                createNewProduct();
                break;
            default:
                break;
        }
    })
};

function viewLowInventory() {
    var lowInventoryQuery = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(lowInventoryQuery, function (err, data) {
        if (err) throw err;

        console.log("Low Inventory Items (below 5): ".error);

        console.table(data);
        console.log('................................\n'.error);
        connection.end();
    })
}

function updateInventory() {
    inquirer.prompt([{
        type: "input",
        name: "item_id",
        message: "Select the ID for the stock_quantity update.",
        validate: validateInput,
        filter: Number
    }, {
        type: "input",
        name: "stock_quantity",
        message: "How many would you like to add?",
        validate: validateInput,
        filter: Number
    }]).then(function (input) {
        var itemID = input.item_id;
        var stockQuantity = input.stock_quantity;
        var queryStr = 'SELECT * FROM products WHERE ?';
        connection.query(queryStr, {
            item_id: itemID
        }, function (err, data) {
            if (err) throw err;
            if (data.length == 0) {
                console.log("Please select a valid product.")
                updateInventory();
            } else {
                var productData = data[0];
                var updatedQueryStr = "UPDATE products SET stock_quantity = " + (productData.stock_quantity + stockQuantity) + " WHERE item_id = " + itemID;
                console.log(updatedQueryStr);
                connection.query(updatedQueryStr, function (err, data) {
                    if (err) throw err;
                    console.log("Updating Inventory...".info);
                    displayTable();
                    // connection.end();
                })
            }
        })
    })
}

function createNewProduct() {
    inquirer.prompt([{
        name: "product_name",
        type: "input",
        message: "What is the name of the product?",
        choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add Product"]
    }, {
        name: "department_name",
        type: "input",
        message: "What department does this product belong to?"
    }, {
        name: "price",
        type: "input",
        message: "What is the price for this item?"
    }, {
        name: "stock_quantity",
        type: "input",
        message: "Please set the quantity of this item."
    }]).then(function (input) {

        var queryStr = 'INSERT INTO products SET ?';

        connection.query(queryStr, input, function (error, results) {
            if (error) throw error;

            displayTable();

            console.log('New product has been added to the inventory under Item ID ' + results.insertId + '.');
            console.log('................................\n'.error);
        })
    })
}

function validateInput(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a whole non-zero number.';
    }
}

function displayTable() {
    connection.query("SELECT * FROM products", function (err, results) {
        console.table(results);
        connection.end();
    })
}