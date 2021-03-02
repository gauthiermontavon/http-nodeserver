const fs = require('fs');
const path = require('path');

exports.getJsonDataFromFileToImport = function(filename){

  let rootpath = path.dirname(require.main.filename || process.mainModule.filename);
  console.log('rootPath:'+rootpath);
  const jsonData = fs.readFileSync(rootpath+'/_toimport/'+filename);
  return JSON.parse(jsonData);

}
