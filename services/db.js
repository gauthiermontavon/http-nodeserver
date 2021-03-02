const loki = require('lokijs');


exports.initDb = function(){
  const databaseInit = () => {
    itemsCollection = lokiDb.getCollection('items');
    if(itemsCollection ===null){
      itemsCollection = lokiDb.addCollection('items')
;    }
  }
   const lokiDb = new loki('loki.json',{
    autoload:true,
    autoloadCallback:databaseInit,
    autosave:true,
    autosdaveInterval:4000
  });

  return lokiDb;

};

//
//stackoverflow.com/questions/31760480
