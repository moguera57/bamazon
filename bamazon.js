var env = require("dotenv").config()
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: process.env.DB_PASS,
  database: process.env.DB
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

function start() {
  inquirer
    .prompt({
      name: "choice",
      type: "list",
      message: "Would you like to [POST] an auction or [BID] on an auction?",
      choices: ["Buy", "EXIT"]
    })
    .then(function(answer) {
      if(answer.choice === "Buy") {
        buyItem();
      } else{
        connection.end();
      }
    });
}

//Whoops this was for part 2
// function addItem() {
//   inquirer
//     .prompt([
//       {
//         name: "item",
//         type: "input",
//         message: "What is the item you would like to submit?"
//       },
//       {
//         name: "category",
//         type: "input",
//         message: "What category would you like to place your auction in?"
//       },
//       {
//         name: "price",
//         type: "input",
//         message: "What would you like the price to be?",
//         validate: function(value) {
//           if (isNaN(value) === false) {
//             return true;
//           }
//           return false;
//         }
//       },
//       {
//           name: "stock",
//           type: "input",
//           message: "What would you like the stock quantity to be?",
//           validate: function(value) {
//             if (isNaN(value) === false) {
//               return true;
//             }
//             return false;
//           }
//       }
//     ])
//     .then(function(answer) {
//       connection.query(
//         "INSERT INTO products SET ?",
//         {
//           item_name: answer.item,
//           category: answer.category,
//           price: answer.price,
//           stock_quantity: answer.stock
//         },
//         function(err) {
//           if (err) throw err;
//           console.log("Your auction was created successfully!");
//           start();
//         }
//       );
//     });
// }

function buyItem() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].item_name);
            }
            return choiceArray;
          },
          message: "What auction would you like to place a bid in?"
        },
        {
          name: "quantity",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        let prodID = `id=${chosenItem.id}`
        if(chosenItem.stock_quantity>answer.quantity){
          let newStock = chosenItem.stock_quantity-answer.quantity
          connection.query(
            "UPDATE products SET ? WHERE "+prodID,
            {
              stock_quantity: newStock,
            },
            function(err) {
              if (err) throw err;
            }
          );
          console.log(`You bought ${answer.quantity} ${chosenItem.item_name} for $${chosenItem.price*answer.quantity}. There are ${newStock} left!`)
        }
        else
          console.log("Sorry, none left!")
        start();
      });
  });
}