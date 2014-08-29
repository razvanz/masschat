# MassChat

### Description:

MassChat is a web based chat system.

### Features:

  * **User management** - *register, login, logout*
  * **Contact list** - *users can have a list of contacts*
  * **User groups** - *users can create groups*
  * **Groups management** - *the group's creator can manage users within the group*
  * **Private chat** - *a user can send a personal message to one of his contacts*
  * **Group chat** - *users within a group can exchange messages*
  * **Real time messaging** - *messages are transmitted in real time*
  * **Offline messaging** - *messages are stored in the database until the user logges in to see them*



### Technologies Used:

  * [MongoDB](http://mongodb.org/)
  * [Express.js](http://expressjs.com/)
  * [Angular.js](http://angularjs.org/)
  * [Node.js](http://nodejs.org/)
  * [Twitter Bootstrap](http://angular-ui.github.io/bootstrap/)
  * [Socket.io](http://socket.io/)


### Prerequisites:

#### NodeJS
Get it here: http://nodejs.org/dist/v0.10.30/node-v0.10.30.pkg

Or install it through homebrew:
``` bash
brew install node
```

Take owenership of node directories:
``` bash
sudo chown -R `whoami` ~/.npm /usr/local/lib/node_modules
```

#### bower
``` bash
npm install -g bower
```

#### gulp
``` bash
npm install -g gulp
```

#### Make git fetch packages with https:// instead of git:// to avoid random errors
``` bash
git config --global url."https://".insteadOf git://
```


### Development:

Open a terminal/cmd and navigate to the target directory.

Clone the project and change directory:
``` bash
git clone https://<username>@bitbucket.org/largesystemteam/masschat.git
cd masschat/
```


Change branch to development:
``` bash
git fetch && git checkout development
```
Get node and bower packages:
``` bash
npm install && bower install
```
Branch out from development and begin to work on a feature:
``` bash
git checkout -b feat/myfeature development
```
Incorporate a finished feature:
``` bash
git checkout development
git branch -d myfeature
git push origin development
```


### Workflow

``` bash
gulp build
gulp watch
```