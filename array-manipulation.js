//kumpulan fungsi untuk memanipulasi array of objects
function getUniqueItems(array) {
    // Use flatMap to get the unique item in each 'nama_barang'
    return [...new Set(array.flatMap(item => item.nama_barang))];
}

function countItemFrequencies(dataArray, searchItems) {//it will return [nama_barang : frequency]
    // Create a frequency map in a single pass
    const frequencyMap = dataArray.reduce((acc, item) => {
        item.nama_barang.forEach(barang => {
            if (searchItems.includes(barang)) {
                acc[barang] = (acc[barang] || 0) + 1;
            }
        });
        return acc;
    }, {});
    
    // Convert the frequency map to the desired array format
    return searchItems.map(item => ({ [item]: frequencyMap[item] || 0 }));
}

function sortByFrequencyDesc(frequencyArray) {
    return frequencyArray.sort((a, b) => {
        const valueA = Object.values(a)[0];
        const valueB = Object.values(b)[0];
        
        // Sort by value in descending order
        if (valueA !== valueB) {
            return valueB - valueA;
        }
        
        // If values are equal, sort by key alphabetically
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        return keyA.localeCompare(keyB);
    });
}

function filterByMinValue(array, minValue) {//remove array element if it less than minValue
    return array.filter(item => {
        const value = Object.values(item)[0];
        return value >= minValue;
    });
}

//function to remove inner array item in dataset that do not meet the minimum supports
function filterArrayByAllowedItems(dataArray, allowedItemsArray) {
    // Extract the allowed items (keys from the allowedItemsArray)
    const allowedItems = allowedItemsArray.map(obj => Object.keys(obj)[0]);
    
    // Filter and modify the array
    return dataArray
        .map(item => {
            // Filter nama_barang array to only include allowed items
            const filteredNamaBarang = item.nama_barang.filter(barang => 
                allowedItems.includes(barang)
            );
            
            // Return new object with filtered array
            return {
                id_transaksi: item.id_transaksi,
                nama_barang: filteredNamaBarang
            };
        })
        // Remove objects where nama_barang is empty after filtering
        .filter(item => item.nama_barang.length > 0);
}

//sort each items in transaction based on its support in descending order
function sortInnerArraysBySupport(dataArray, valueArray) {
    // Create a value lookup map
    const valueMap = new Map(
        valueArray.map(obj => {
            const [[key, value]] = Object.entries(obj);
            return [key, value];
        })
    );
    
    // Sort function that handles missing values and ties
    const compareItems = (a, b) => {
        const valueA = valueMap.get(a) ?? -Infinity;
        const valueB = valueMap.get(b) ?? -Infinity;
        
        // If values are different, sort by value
        if (valueA !== valueB) {
            return valueB - valueA;
        }
        
        // If values are the same, sort alphabetically
        return a.localeCompare(b);
    };
    
    // Process each object
    return dataArray.map(item => ({
        id_transaksi: item.id_transaksi,
        nama_barang: [...item.nama_barang].sort(compareItems)
    }));
}

module.exports = {getUniqueItems, countItemFrequencies,
                sortByFrequencyDesc, filterByMinValue,
                filterArrayByAllowedItems, sortInnerArraysBySupport};