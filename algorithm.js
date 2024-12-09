const fs = require('fs');
const { parse } = require('csv-parse/sync');
const {getUniqueItems, countItemFrequencies,
        sortByFrequencyDesc, filterByMinValue, 
        filterArrayByAllowedItems, sortInnerArraysBySupport} = require('./array-manipulation');
const FPTree = require('./fp-tree');

// Synchronous reading using fs.readFileSync
function readCSVSync(filePath) {
    try {
        // Read file content synchronously
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse CSV synchronously
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        return records;
    } catch (error) {
        throw new Error(`Error reading CSV file: ${error.message}`);
    }
}

function aggregateDataSet(inputArray) {
    // Use reduce to group items by id_transaksi
    const result = inputArray.reduce((acc, current) => {
        // Check if we already have an entry for this id_transaksi
        const existingEntry = acc.find(item => item.id_transaksi === current.id_transaksi);
        
        if (existingEntry) {
            // If entry exists, push the nama_barang to its array
            existingEntry.nama_barang.push(current.nama_barang);
        } else {
            // If no entry exists, create a new one with nama_barang in an array
            acc.push({
                id_transaksi: current.id_transaksi,
                nama_barang: [current.nama_barang]
            });
        }
        
        return acc;
    }, []);
    
    return result;
}

function getDataSet(filePath) {
    try {
        const syncData = readCSVSync(filePath);
        const dataSet = aggregateDataSet(syncData);
        return dataSet;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function mineData(minimumSupport, fileName){
    //set the minimum support    
    const minSupport = minimumSupport;

    //get the dataset
    let dataSet = getDataSet('./upload/' + fileName);

    //get the list of uniques items in dataset
    const dataSetUniqueItems = getUniqueItems(dataSet);

    //get the frequency of each item, return [{nama_barang : frequency}]
    const itemFrequency = countItemFrequencies(dataSet, dataSetUniqueItems);

    //sort the items descendingly based on its frequency
    const sortedItemFrequency = sortByFrequencyDesc(itemFrequency);

    //filter the unique element that meet minimum support
    const filteredItem = filterByMinValue(sortedItemFrequency, minSupport);

    //remove the item in dataset that do not meet the minimum support
    dataSet = filterArrayByAllowedItems(dataSet, filteredItem);

    //sorting the items of each transaction descendingly based on its support
    dataSet = sortInnerArraysBySupport(dataSet, filteredItem);

    //variable to store the result
    const result = new Map();
    //membuat pohon fp
    const fpTree = new FPTree();
    fpTree.buildTree(dataSet, filteredItem);
    /*fpTree.printTree();*/
    fpTree.printHeaderTable();
    // Find conditional pattern base for 'anting'
    /*console.log("\nConditional Pattern Base for 'anting':");
    const antingPatterns = fpTree.findConditionalPatternBase('anting');
    antingPatterns.forEach(element => {
        element.path.forEach(items =>{console.log(items.item)});
        console.log(`count : ${element.count}\n`);
    });*/

    // Mine all frequent patterns and put it into result variable
    const patterns = fpTree.minePatterns();
    patterns.forEach((support, pattern) => {
        if (pattern.length >= 2) {
            console.log(pattern , support);
            let confidence1 = (support/ fpTree.headerTable.get(pattern[0]).support) * 100;
            let confidence2 = (support/ fpTree.headerTable.get(pattern[1]).support) * 100;
            if (confidence1 > confidence2) {
                result.set(pattern, confidence1.toFixed(2));
            }else{
                let newPattern = [pattern[1], pattern[0]];
                result.set(newPattern, confidence2.toFixed(2));
            }
        }
    });

    const arrayResult = []; 
    result.forEach((confidence, pattern)=>{
        arrayResult.push({'pattern': pattern, 'confidence': confidence});
        //console.log(`Pattern: [${pattern}], Confidence: ${confidence}`);
    });

    fs.unlink('./upload/' + fileName, function(err) {
        if (err) {
           return console.error(err);
        }
     });
    return arrayResult;
}

module.exports = {mineData};