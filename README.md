
# Cookingdb
Simple web application that stores and displays recipes in a cloudant DB
The project is intended to be deployed to any Cloud Foundry installation for example to Bluemix.
To keep the deploy footprint small a .cfignore file has been added, that excludes the node-modules directory if there is any, for example when the project is tested locally this modules directory will be created with the npm install command before you are able to run the app the first time locally.
To run the project locally:
Do a npm install before starting the first time to allow npm install the necessary modules as declared in package.json.
To test locally you need to set environment variables for the cloudant DB that you want to use locally:
Set cloudant_account for the cloudant account you want to use, example for linux export cloudant_account=yourname
Set cloudant_passwordfor the corresponding cloudant password, example for linux export cloudant_password=secretpasswd


