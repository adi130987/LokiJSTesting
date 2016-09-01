/**
 * Created by adrian on 8/31/16.
 */

// data rows container
var tBodyElement = null;

// persistence adapter
var idbAdapter = new LokiIndexedAdapter('dummyDataAdapter');
// loki DB init
var lokiDb = new loki('appLokiOverview', {
    verbose: true,
    autoload: true,
    autoloadCallback : lokidbAutoloadHandler,
    autosave: true,
    autosaveInterval: 10000,
    persistenceMethod: 'adapter',
    adapter: idbAdapter
});
// loki db autoload handler
function lokidbAutoloadHandler () {
    var dummyCollection = lokiDb.getCollection('dummyData');
    if (dummyCollection === null) {
        console.log('lokidbAutoloadHandler(): dummyData collection does not exist! ... created at DB load...')
        getData('/data/dummy-data.json', function (responseText) {
            var dummyData = JSON.parse(responseText);
            // insert an array of objects into lokidb collection
            dummyCollection = lokiDb.addCollection('dummyData', {
                unique: ['id'],
                indices: ['index', 'name', 'gender', 'company', 'email', 'phone', 'address', 'favoriteFruit']
            });
            dummyCollection.insert(dummyData);
            lokiDb.saveDatabase();
            console.log('lokidbAutoloadHandler(): JSON data received from ajax request to /data/dummy-data.json added to dummyData collection of DB...');
            // inset objects one by one
            // for (var i = 0; i < dummyData.length; i++) {
            //     dummyDataCollection.insert(dummyData[i]);
            // }

            // display data
            displayCollectionData(dummyCollection);
            getLokiDCatalogSummary();
        });
    } else {
        console.log('lokidbAutoloadHandler(): dummyData collection found in DB...');
        displayCollectionData(dummyCollection);
        getLokiDCatalogSummary();
    }
}


// create/add new collection example
// var dummyDataCollection = lokiDb.addCollection('dummyData', {
//     unique: ['id']
// });

// get data from url
function getData (file, callback) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open("GET", file, true);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status == "200") {
            callback(request.responseText);
        }
    }
    request.send(null);
}
// get only used properties of an object from dummy data used
function getOnlyRequiredFields(dataObj) {
    return [parseInt(dataObj.index) + 1, dataObj.name, dataObj.gender, dataObj.company, dataObj.email, dataObj.phone, dataObj.address, dataObj.tags.join(', '), dataObj.favoriteFruit];
}

// add row data to table
function addDataRow (data) {
    data = getOnlyRequiredFields(data);
    var colsHtml = ''
    if (!Array.isArray(data)) {
        console.log('addDataRow(data): Data param must be array!')
        return;
    }
    for (var i = 0; i < data.length; i++) {
        colsHtml += '<td>' + data[i] + '</td>'
    }
    var tableBody = document.getElementById('tableRows');
    tableBody.innerHTML += '<tr>' + colsHtml + '</tr>';
}

// remove all table rows
function clearTableData() {
    document.getElementById('tableRows').innerHTML = '';
}

function displayCollectionData(collection, isDataview) {
    var data = collection.data;
    if (isDataview) {
        data = collection.data();
    }
    for (var i = 0; i < data.length; i++) {
        addDataRow(data[i]);
    }
    console.log('displayCollectionData(): collection data displayed...')
}

function deleteDb () {
    idbAdapter.deleteDatabase('appLokiOverview');
    document.getElementById('tableRows').innerHTML = '';
    console.log('%cdeleteDb(): appLokiOverview DB deleted!', 'color: red');
}

function applySort () {
    var sortByColumns = [];
    var sortOrderElements = document.getElementsByName('sortOrder');
    var sortDesc = false;
    for (var i = 0; i < sortOrderElements.length; i++) {
        if (sortOrderElements[i].checked && sortOrderElements[i].value == 1) {
            sortDesc = true;
            break;
        }
    }
    if (document.getElementById('sortByIndex').checked === true) {
        sortByColumns.push(['index', sortDesc]);
    }
    if (document.getElementById('sortByName').checked === true) {
        sortByColumns.push(['name', sortDesc]);
    }
    if (document.getElementById('sortByGender').checked === true) {
        sortByColumns.push(['gender', sortDesc]);
    }
    if (document.getElementById('sortByCompany').checked === true) {
        sortByColumns.push(['company', sortDesc]);
    }
    if (document.getElementById('sortByEmail').checked === true) {
        sortByColumns.push(['email', sortDesc]);
    }
    if (document.getElementById('sortByPhone').checked === true) {
        sortByColumns.push(['phone', sortDesc]);
    }
    if (document.getElementById('sortByAddress').checked === true) {
        sortByColumns.push(['address', sortDesc]);
    }
    if (document.getElementById('sortByTags').checked === true) {
        sortByColumns.push(['tags', sortDesc]);
    }
    if (document.getElementById('sortByFavoriteFruit').checked === true) {
        sortByColumns.push(['favoriteFruit', false]);
    }
    if (sortByColumns.length === 0) {
        console.log('%capplySort(): please check at least one column...', 'color: green');
    } else {
        var dummyCollection = lokiDb.getCollection('dummyData');
        /**
         * Create a dynamic view for the current collection to use it for sorting by one or more columns
         * @type {DynamicView}
         */
        var sortingDynamicView = dummyCollection.getDynamicView('sortingView');
        if (sortingDynamicView === null) {
            // if the dymanic view dosen't exists then we create it
            sortingDynamicView = dummyCollection.addDynamicView('sortingView');
        }
        sortingDynamicView.applySortCriteria(sortByColumns);
        clearTableData();
        displayCollectionData(sortingDynamicView, true);
    }
}

// list existing databases from loki
// idbAdapter.getDatabaseList(function(result) {
//     console.log('listing loki databases using the idbAdapter...');
//     result.forEach(function(str) {
//         console.log(str);
//     });
// });
function getLokiDCatalogSummary() {
    idbAdapter.getCatalogSummary(function (entries) {
        var list = document.getElementById('lokiDbcatalog');
        console.log('%c-----------------------------------------', 'color: green');
        console.log('%cgetCatalogSummary(): list loki details...', 'color: green');
        entries.forEach(function (obj) {
            console.log("app (adapter name): " + obj.app);
            console.log("key (database name): " + obj.key);
            console.log("size : " + obj.size);
            list.innerHTML += '<li>app (adapter name): ' + obj.app + '</li>';
            list.innerHTML += '<li>key (database name): ' + obj.key + '</li>';
            list.innerHTML += '<li>size: ' + obj.size + '</li>';
        });
        console.log('%c-----------------------------------------', 'color: green');
    });
}








