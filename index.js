const express = require('express');
const fs = require('fs');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./services/db');

const app = express();


app.use(cors());

/* Read - GET method */
app.get('/item/list', (req, res) => {
  console.log('GET list from');

  const queryParams = req.query;
  console.log('GET list from:'+JSON.stringify(queryParams));

  const global = queryParams.global_search_term || '',
        tagFilter = queryParams.tag_filter ||'',
        sortOrder = queryParams.sortOrder,
        pageNumber = parseInt(queryParams.pageNumber) || 0,
        pageSize = parseInt(queryParams.pageSize);


  let items = Object.values(getData().results);

  console.log('items:'+items);

  if (global) {
      items = items.filter(item => item.title.trim().toLowerCase().search(global.toLowerCase()) >= 0);
  }
  //    let intersection = items.filter(x => arrB.includes(x));
  if(tagFilter){
    items = items.filter(item =>
    item.tags.filter(x => tagFilter.includes(x)).length > 0);
  }

  if (sortOrder == "desc") {
        items = items.reverse();
  }

  const initialPos = pageNumber * pageSize;

  const itemsPage = items.slice(initialPos, initialPos + pageSize);


  res.status(200).json({meta:{totalCount:items.length},payload:itemsPage});
    //res.send(JSON.parse(jsonData))

  //res.send(items)
});

app.get('/testdb',(req,res) => {
  db.initDb();
}
);

app.get('/tags/used',(req,res) => {
  let items = Object.values(getData().results);
  var usedTags = new Array();

  items.forEach(item => item.tags.forEach(tag => {
        console.log('coucou tag'+tag.toLowerCase());
        if(usedTags.indexOf(tag.toLowerCase())<0){
          usedTags.push(tag.toLowerCase());
        }

      }

    )
  );
res.status(200).json({usedTags});
//res.status(200).json({meta:{totalCount:items.length},payload:itemsPage});
});
//-----------------------------
//------ NOT YET USED ---------
//-----------------------------
//TODO: virer - version essai
app.get('/list', (req, res) => {

	const jsonData = fs.readFileSync('./items.json');

   const queryParams = req.query;

    const itemId = queryParams.itemId,
          filter = queryParams.filter || '',
          sortOrder = queryParams.sortOrder,
          pageNumber = parseInt(queryParams.pageNumber) || 0,
          pageSize = parseInt(queryParams.pageSize);
    console.log('JSON:'+jsonData);
    //let items = Object.values(JSON.parse(jsonData));
    let items = Object.values(JSON.parse(jsonData)).filter(item => item.id == itemId).sort((l1, l2) => l1.id - l2.id);

    console.log('items:'+items);

    if (filter) {
       items = items.filter(item => item.title.trim().toLowerCase().search(filter.toLowerCase()) >= 0);
    }

    if (sortOrder == "desc") {
        items = items.reverse();
    }

    const initialPos = pageNumber * pageSize;

    const itemsPage = items.slice(initialPos, initialPos + pageSize);

    res.status(200).json({payload:itemsPage});
    //res.send(JSON.parse(jsonData))

});


/* Create - POST method */
app.post('/item/add', (req, res) => {
    //get the existing item
    const existItems = getData()

    //get the new user data from post request
    const itemData = req.body
    //check if the itemData fields are missing
    if (itemData.id == null || itemData.title == null || itemData.date == null || itemData.path == null) {
        return res.status(401).send({error: true, msg: 'Item data missing'})
    }

    //check if the username exist already
    const findExist = existItems.find( item => item.id === itemData.id )
    if (findExist) {
        return res.status(409).send({error: true, msg: 'item already exist'})
    }
    //append the user data
    existItems.push(itemData)
    //save the new user data
    saveData(existItems);
    res.send({success: true, msg: 'Item data added successfully'})
})

/* Update - Patch method */
app.patch('/item/update/:id', (req, res) => {
    //get the username from url
    const itemId = req.params.id
    //get the update data
    const itemData = req.body
    //get the existing user data
    const existItems = getData()
    //check if the username exist or not
    const findExist = existItems.find( item => item.id === itemId )
    if (!findExist) {
        return res.status(409).send({error: true, msg: 'item not exist'})
    }
    //filter the itemData
    const updateItem = existItems.filter( item => item.id !== itemId )
    //push the updated data
    updateItem.push(itemData)
    //finally save it
    saveData(updateItem)
    res.send({success: true, msg: 'Item data updated successfully'})
})
/* Delete - Delete method */
app.delete('/user/delete/:id', (req, res) => {
    const itemId = req.params.id
    //get the existing itemData
    const existItems = getData()
    //filter the itemData to remove it
    const filterItem = existItems.filter( item => item.id !== itemId )
    if ( existItems.length === filterItem.length ) {
        return res.status(409).send({error: true, msg: 'item does not exist'})
    }
    //save the filtered data
    saveData(filterItem)
    res.send({success: true, msg: 'item removed successfully'})

})



/* util functions */
//read the user data from json file
const saveData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./items.json', stringifyData)
}
//get the user data from json file
const getData = () => {
    const jsonData = fs.readFileSync('./items.json')
    return JSON.parse(jsonData)
}
/* util functions ends */


// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
  console.log('running a task every minute');
});

app.listen(3000, () => console.log('Gator app listening on port 3000!'));
