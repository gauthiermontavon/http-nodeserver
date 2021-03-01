const loki = require('lokijs');


exports.initDb = function(){
  const databaseInit = () => {
    let itemsCollection = db.getCollection('items');
    if(itemsCollection ===null){
      itemsCollection = db.addCollection('items')
;    }
  }
  const db = new loki('loki.json',{
    autoload:true,
    autoloadCallback:databaseInit,
    autosave:true,
    autosdaveInterval:4000
  });

}
