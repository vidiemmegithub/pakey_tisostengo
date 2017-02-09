<img src="https://d2qs5oopgh5n28.cloudfront.net/wp-content/uploads/2015/06/vidiemme_logo_blueGreen1-150x49.png" />


# TiSOStengo 

## - Indice

* <h4>[Introduzione](#introduction)</h4>
* <h4>[Configurazione](#configuration)</h4>
* <h4>[Primo avvio](#firststart)</h4>
* <h4>[Struttura progetto](#structure)</h4>
* <h4>[Social](#social)</h4>
* <h4>[Pagamenti](#payments)</h4>
* <h4>[Deploy](#heroku)</h4>
* <h4>[@TODO](#todo)</h4>

<a name="introduction"></a>
## - Introduzione
#### Cos'è TiSOStengo?
L’idea di base è costruire un social network capace di toccare tutti gli aspetti relazionali dell’healthcare. Esso mira ad abbattere le distanze e le barriere di comunicazione in un mondo tanto complesso come quello della salute.

Tante realtà in campo e così poca organizzazione comportano uno spreco di risorse pubbliche e private e limitano la possibilità di scelta nel momento del bisogno a quanto di più facilmente reperibile tramite canali locali non verificabili.

Il servizio avrà 2 anime: la parte informativa e la parte relazionale.

Gli utenti utilizzeranno la prima per ricercare o mantenersi aggiornati su tematiche legate al mondo della salute. Sfrutteranno la seconda per entrare in contatto diretto tra loro.

#### Progetto
TiSOStengo è un portale web che permetterà a diverse categorie di utenti, guest inclusi, di informarsi su tematiche del mondo della salute e di interagire con altri utenti del portale con delle dinamiche da social network.

Il portale offrirà gratuitamente la maggior parte dei suoi servizi, e alcune funzionalità premium ad utenti paganti

Il progetto è stato sviluppato con le seguenti tecnologie:

* __NodeJS__ per la parte server
* __AngularJS__ per la parte client
* __MongoDB__ come database

___
<a name="configuration"></a>
## - Configurazione
Il progetto è versionato sul repository aziendale [https://git.vidiemme.it/](https://git.vidiemme.it/).

Per configurare il progetto è necessario installare in ordine i seguenti tools:

* NVM
* NodeJS _v4.2.2_
* NPM
* Grunt
* Bower
* MongoDB

#### Node Version Manager
__NVM__ permette di installare, gestire ed usare facilmente diverse versioni di NodeJS, per installarlo basterà eseguire:

````
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
````
Per qualsiasi problema potete fare riferimento alla [guida ufficiale](https://github.com/creationix/nvm).

#### NodeJS
__NodeJS__ è un runtime Javascript costruito sul motore Javascript V8 di Chrome, per installarlo ed usarlo basterà eseguire: 

````
$ nvm install 4.2.2
````
__La versione 4.2.2 automaticamente installerà la versione 3.9.0 di npm che contiente un bug che non vi permetterà di avviare il progetto in seguito. Per risolvere questo bug basterà fare l'upgrade manuale della versione di npm eseguendo:__

````
$ cd ~/.nvm/versions/node/v4.2.2/lib
$ npm install npm
````

#### Grunt
__Grunt__ è un javascript task runner che permette di automatizzare alcune operazioni durante le fasi di sviluppo e di deploy, per installarlo basterà eseguire:

````
$ sudo npm install -g grunt-cli
````
Per qualsiasi problema potete fare riferimento alla [guida ufficiale](http://gruntjs.com/getting-started).

#### Bower
__Bower__ è un gestore di pacchetti per il web, tiene traccia di librerie, frameworks, assets e utilities, per installarlo basterà eseguire:

````
$ sudo npm install -g bower
````
Per qualsiasi problema potete fare riferimento alla [guida ufficiale](https://bower.io/#install-bower).

#### MongoDB
__MongoDB__ è un DBMS non relazionale orientato ai documenti.

Scarica l'ultima versione, estrai e copia i files nel percorso desiderato eseguendo:

````
$ curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.4.1.tgz
$ tar -zxvf mongodb-osx-x86_64-3.4.1.tgz
$ mkdir -p mongodb
$ cp -R -n mongodb-osx-x86_64-3.4.1/ mongodb

````
A questo punto è necessario settare nel bash file la seguente stringa:

````
export PATH=<mongodb-install-directory>/bin:$PATH

````

Per qualsiasi problema potete fare riferimento alla [guida ufficiale](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/).

Per comodità consiglio di utilizzare un MongoDB manager come [Robomongo](https://robomongo.org/download), ma se siete amanti della _cli_ nessun problema. :-)
___
<a name="firststart"></a>
## - Primo avvio
Innanzitutto è necessario scaricare il progetto dal seguente repository [git@git.vidiemme.it:Pakey/tisostengo.git](git@git.vidiemme.it:Pakey/tisostengo.git), posizionarsi nella root del progetto e lanciare i seguenti comandi:

````
$ nvm use 4.2.2
$ npm install
$ bower install
````
Lanciare '$ npm list' per fare un check che tutte le dipendenze siano installate correttamente.

Per configurare il database in locale è necessario creare la cartella:

````
$ mkdir -p server/db
````
In seguito avviare mongo eseguendo il seguente grunt task:

````
$ grunt shell:start_db
````
Successivamente è necessario creare un database e caricare i dati, per farlo si può fare un import di un dump già esistente oppure lanciare il seeder con un grunt task.

##### 1) Grunt
Aprire il file _server/config/environment/index.js_ e modificare la chiave __seedDB__ a __true__, eseguire poi:

````
$ grunt shell:seed
````
__N.B. E' importante poi rimettere il valore a _false_ per evitare che ad ogni avvio/compilazione del progetto venga rilanciato il seeder, infatti questo grunt task fa parte anche di altri flussi di comandi__.

__@todo Attualmente il seeder non contiene l'elenco delle specializzazioni, è necessario importarle (vedi sotto) dal database di produzione.__


##### 2) Import

Accedere alla shell di mongo e creare il database:

````
$ mongo
$ use tisostengo-local
````
Eseguire le import:

````
$ mongoimport -d tisostengo-local -c users --jsonArray < users.json
$ mongoimport -d tisostengo-local -c specializations --jsonArray < specializations.json
$ mongoimport -d tisostengo-local -c questions --jsonArray < questions.json
$ mongoimport -d tisostengo-local -c pictures --jsonArray < pictures.json
$ mongoimport -d tisostengo-local -c messages --jsonArray < messages.json
$ mongoimport -d tisostengo-local -c coupons --jsonArray < coupons.json
$ mongoimport -d tisostengo-local -c carepaths --jsonArray < carepaths.json
$ mongoimport -d tisostengo-local -c articles --jsonArray < articles.json
$ mongoimport -d tisostengo-local -c advertisements --jsonArray < advertisements.json
````
### A questo punto è possible lanciare il grunt task che serve per avviare il progetto in locale:

````
$ grunt serve
````

___
<a name="structure"></a>
## - Struttura progetto
Il progetto è suddiviso in _server_ e _client_, nella root sono presenti i file di configurazione per i tools installati:

* __package.json__: package manager di npm
* __bower.json__: package manager per bower configurato con il file _.bowerrc_
* __protractor.conf.js__: file di configurazione per gli unit test di _AngularJS_
* __Procfile__: _worker_ entry per _Heroku_
* __karma.conf.js__: file di configurazione per gli unit test sui browser connessi
* __Gruntfile.js__: file contentente tutti i task di grunt
* __yo-rc.js__: scaffolding del progetto
* __.editorconfig__: file di configurazione per la formattazione dei file nell'IDE utilizzato

### Server
In questa cartella è contentuto tutto il progetto server:

* __api__: contiene l'implementazione delle api, organizzate in cartelle contenenti il router file (index.js), il modello mongoose (componente.model.js), il controller con tutte le operazioni associate (componente.controller.js), gli unit test (componente.spec.js)
* __auth__: contiente l'implementazione dell'autenticazione alla piattaforma 
* __components/middleware__: contiente l'implementazione del middleware che elabora i dati ricevuti dal client in una fase preliminare
* __config__: contiene i file di configurazione per gli ambienti ed il seeder
* __templates__: contiente i templates delle email automatiche
* __workers__: si occupano di controllare gli utenti ed inviare reminder/comunicazioni in base alla loro tipologia
* __app.js__: è il file di entry per l'avvio del server
* __.jshintrc__: è il file di configurazione di _JSHint_
* __worker.js__: è il file che gestisce gli _workers_
* __routes.js__: è il file di route base per tutte le api

### Client
In questa cartella è contentuto tutto il progetto client che viene minifizzato in fase di compilazione:

* __components__: contiene i componenti implementati sotto forma di direttive _AngularJS_
* __assets__: contiene tutti gli assets della piattaforma
* __app__: contiene l'implementazione di tutte le sezioni, organizzate in cartelle contenenti il modulo (sezione.js), il template (sezione.html), lo stile (sezione.css), il controller con tutte le operazioni associate (sezione.controller.js), gli unit test (sezione.controller.spec.js)
* __app/apiClient__: contiene il modulo con le chiamate al server
* __app/sharedData__: contiente una serie di dati statici
* __app/app.js__: è l'entry point del client (dopo l'index.html)

___
<a name="social"></a>
## - Social
La piattaforma mette a disposizione la registrazione, la login e la condivisione tramite facebook.

La configurazione delle sdk è gestita nelle variabili d'ambiente su Heroku e nel file di _env_ del progetto (_server/config/environment/index.js_) per la parte server.

````
facebook: {
    clientID: process.env.FACEBOOK_ID || '',
    clientSecret: process.env.FACEBOOK_SECRET || '',
    callbackURL: (process.env.DOMAIN || 'http://localhost:9000') + '/auth/facebook/callback'
}
````

Per la parte client invece la configurazione delle sdk è gestita nel file _client/app/app.js_. __Attualmente in fase di deploy è necessario cambiare manualmente l'_appId_ che trovate qui sotto per far si che corrisponda all'applicazione lato facebook dell'ambiente desiderato.__

````
.config(function configureFacebook(ezfbProvider) {
    ezfbProvider.setInitParams({
      appId: '1525062534454714',
      version: 'v2.5'
    });
    ezfbProvider.setLocale('it_IT');
  })
````

___
<a name="payments"></a>
## - Pagamenti
La piattaforma mette a disposizione degli utenti dei servizi premium in abbonamento. Per la gestione dei pagamenti ci si appoggia a [Braintree](https://developers.braintreepayments.com/start/hello-server/node) che fornisce delle sdk che permettono di effettuare pagamenti ricorrenti tramite carte di credito/debito e paypal.

La configurazione delle sdk è gestita nelle variabili d'ambiente su Heroku e nel file di _env_ del progetto (_server/config/environment/index.js_).

````
braintree: {
    discountTemplate: process.env.BRAINTREE_DISCOUNT_TEMPLATE_ID || '',
    environment: braintree.Environment[process.env.BRAINTREE_ENV || 'Sandbox'],
    merchantId: process.env.BRAINTREE_MERCHANT_ID || '',
    publicKey: process.env.BRAINTREE_MERCHANT_PUBLIC_KEY || '',
    privateKey: process.env.BRAINTREE_MERCHANT_PRIVATE_KEY || ''
}
````
___
<a name="heroku"></a>
## - Deploy
Il codice viene caricato su __Heroku__, un platform as a service sul cloud che supporta diversi linguaggi di programmazione. Utilizziamo 2 ambienti tra quelli esistenti, [__tisostengo-vdmdev__](https://dashboard.heroku.com/apps/tisostengo-vdmdev) per la fase di sviluppo e [__tisostengo-test__](https://dashboard.heroku.com/apps/tisostengo-test) per i test del cliente. L'ambiente di produzione è direttamente collegato a quello di test, infatti è semplicemente la sua [_promozione_](https://dashboard.heroku.com/pipelines/183c37bf-fa06-43ba-a9ad-1713254765da) ed avviene direttamente dal pannello di __heroku__.

Gli ambienti di __Heroku__ sono dei repository git, per fare il deploy è necessario installare la sua _cli_; esiste poi una sezione _Settings/Config Variables_ che tiene traccia delle variabili d'ambiente e corrisponde al file di _env_ del progetto (_server/config/environment/index.js_).

#### Istruzioni per il deploy:

Scarica ed installa [Heroku-cli](https://devcenter.heroku.com/articles/heroku-command-line), in seguito fai la login e clona il repository dei due ambienti come segue:

````
$ heroku login
$ heroku git:clone -a tisostengo-vdmdev
$ heroku git:clone -a tisostengo-test
````
Per generare una nuova versione del codice è necessario posizionarsi nella root del progetto ed eseguire il grunt task di build:

````
$ cd <path>/tisostengo
$ grunt build
````
Il codice viene compilato e generato nella cartella __dist__ e deve contenere:

* public
* server
* npm-shrinkwrap.json
* package.json
* Profile

Sostituire il contenuto della cartella __dist__ dentro il clone dei due ambienti. In seguito eseguire:

````
$ cd <path>/tisostengo-<env>
$ git add .
$ git commit -m "Deploy of <id_commit>"
$ git push heroku master
````
___
<a name="todo"></a>
# @TODO

* <h5> Rivedere e riordinare la struttura del progetto </h5>
* <h5> Aggiornamento e pulizia librerie, attualmente sono fissate ad una versione </h5>
* <h5> Riscrittura dei task di grunt </h5>
* <h5> Ripulire gli ambienti da Heroku </h5>
* <h5> Gestire tramite API l'appId di facebook </h5>
* <h5> Riconfigurare ed implementare gli unit test mancanti </h5>
* <h5> Implementare il seeder delle specializzazioni </h5>

