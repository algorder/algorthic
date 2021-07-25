### Algorthic node.js application

- Users that have 10.000 ALGOR tokens (Algorthics) may run this application for checking and sending orders.
- Please read all the warnings very carefully.


# Algorthic

Installation
-------------
1) To use this application node.js should be installed on your computer. You could install it from
https://nodejs.org/en/download/

If you already have installed node.js skip to step 2.

2) Download or clone this repository into your computer.

3)run "npm install" shell script on the path you downloaded from our repository. This will install the needed dependencies for our node.js module.

Configuration & Usage
-------------
1) You need to enter the private key of a wallet that contains 10.000 ALGOR tokens into config.json file (algorthicPrivateKey field).

2) run "node index.js" shell script. The application will start checking orders in all algorder accounts, and sends the orders if conditions are met.

3)Your wallet should contain 10.000 ALGOR tokens and 0.1AVAX at the beginning. Because to be able to send orders, a gas fee should be paid. If there is no AVAX in your wallet at the beginning, then the application will not be able to pay the gas fee to send orders.


Warnings
-------------
1) Don't share the private key with anyone. Algorder team will never ask for your private key.

2) Since config.json file will contain the private key, make sure that the computer or server that you are running the application is secured. If anyone gets access to config.json file, they will be able to get your private key and steal your funds.

3) We strongly suggest you create a separate wallet to use with this application. Only send 10.000 Algor tokens and 0.1 AVAX into it (for the first order's gas fee). So even if someone gets your private key, they won't be able to steal all of your holdings.  

Monitoring
-------------
Monitoring api data is refreshing every 1 hour. 

1) Main statistics (total pending orders, total orders created, total orders executed)
http://d1rgadtesv2tf8.cloudfront.net/stats-api/main.json

2)Executed Orders (tx, address of algortic that sent the order, timestamp of execution)
http://d1rgadtesv2tf8.cloudfront.net/stats-api/orderSent.json
