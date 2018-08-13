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

var askQuestions = function () {
    inquirer.prompt([{
        type: "input",
        name: "selectID",
        message: "Select an item_ID of the product you'd like to purchase: ",
        validate: validateInput,
        filter: Number
    }, {
        type: "input",
        name: "QTY",
        message: "How many would you like to purchase?",
        validate: validateInput,
        filter: Number
    }]).then(function (input) {
        var chosenProduct = input.selectID;
        var chosenQTY = input.QTY;
        var queryStr = "SELECT * FROM products WHERE ?";

        connection.query(queryStr, {
            item_id: chosenProduct
        }, function (err, data) {
            if (err) throw err;
            if (data.length === 0) {
                console.log("ERROR: Invalid Item ID. Please select a valid item_ID.".bold.red);
                displayItems();
            } else {
                var productData = data[0];
                if (chosenQTY <= productData.stock_quantity) {
                    console.log("Congratulations, the product you selected is in stock. Placing order now.".verbose);
                    // Construct  the updating query string
                    var updatedQtyString = "UPDATE products SET stock_quantity = " + (productData.stock_quantity - chosenQTY) + " WHERE item_id = " + chosenProduct;

                    // Update the inventory
                    connection.query(updatedQtyString, function (err, data) {

                        console.log('Your oder has been placed! Your total is $' + productData.price * chosenQTY);
                        console.log('Thank you for shopping with us!');
                        console.log('................................\n'.error);

                        // End the database connection
                        connection.end();
                    })
                } else {
                    console.log('Insufficient quantity!');
                    console.log('Please modify your order.');
                    console.log('................................\n'.error);
                    displayItems();
                }
            }
        })
    });
}

function displayItems() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.table(results)
        askQuestions()
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