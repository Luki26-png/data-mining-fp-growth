class FPNode {
    constructor(item, count = 0, parent = null) {
        this.item = item;
        this.count = count;
        this.parent = parent;
        this.children = new Map();
        this.nodeLink = null;
    }

    incrementCount(count = 1) {
        this.count += count;
    }
}

class FPTree {
    constructor(minSupport = 2) {
        this.root = new FPNode(null, 0);
        this.headerTable = new Map();
        this.minSupport = minSupport;
    }

    createHeaderTable(supportData) {
        this.headerTable.clear();
        for (const item of supportData) {
            const [itemName] = Object.keys(item);
            this.headerTable.set(itemName, {
                support: item[itemName],
                nodeLink: null
            });
        }
    }

    insert(transaction, count = 1) {
        let currentNode = this.root;

        for (const item of transaction) {
            if (!currentNode.children.has(item)) {
                const newNode = new FPNode(item, 0, currentNode);
                currentNode.children.set(item, newNode);

                if (this.headerTable.has(item)) {
                    const header = this.headerTable.get(item);
                    if (header.nodeLink === null) {
                        header.nodeLink = newNode;
                    } else {
                        let current = header.nodeLink;
                        while (current.nodeLink !== null) {
                            current = current.nodeLink;
                        }
                        current.nodeLink = newNode;
                    }
                }
            }
            currentNode = currentNode.children.get(item);
            currentNode.incrementCount(count);
        }
    }

    buildTree(dataSet, supportData) {
        this.createHeaderTable(supportData);
        for (const transaction of dataSet) {
            this.insert(transaction.nama_barang);
        }
    }

    // Get path from node to root
    getPathFromNode(node) {
        const path = [];
        let current = node;
        while (current.parent !== null) {
            path.unshift({
                item: current.item,
                count: current.count
            });
            current = current.parent;
        }
        return path;
    }

    // Find conditional pattern base for an item
    findConditionalPatternBase(item) {
        const patterns = [];
        let node = this.headerTable.get(item)?.nodeLink;

        while (node) {
            const path = this.getPathFromNode(node.parent);
            if (path.length > 0) {
                patterns.push({
                    path: path,
                    count: node.count
                });
            }
            node = node.nodeLink;
        }

        return patterns;
    }

    // Find frequent patterns starting from an item
    findFrequentPatterns(item, minSupport = this.minSupport) {
        const patterns = new Map();
        const conditionalBase = this.findConditionalPatternBase(item);
        
        // Count items in conditional pattern base
        const itemCounts = new Map();
        for (const {path, count} of conditionalBase) {
            for (const {item} of path) {
                itemCounts.set(item, (itemCounts.get(item) || 0) + count);
            }
        }

        // Filter items by minimum support
        const frequentItems = Array.from(itemCounts.entries())
            .filter(([_, count]) => count >= minSupport)
            .map(([item, _]) => item);

        // Generate patterns with the frequent items
        if (frequentItems.length > 0) {
            // Add single item pattern
            patterns.set([item], this.headerTable.get(item).support);

            // Generate combinations with frequent items
            for (const freqItem of frequentItems) {
                const pattern = [freqItem, item];
                const support = itemCounts.get(freqItem);
                patterns.set(pattern, support);
            }
        }

        return patterns;
    }

    // Mine all frequent patterns
    minePatterns(minSupport = this.minSupport) {
        const allPatterns = new Map();
        
        // Process items in header table
        for (const [item, data] of this.headerTable) {
            if (data.support >= minSupport) {
                const patterns = this.findFrequentPatterns(item, minSupport);
                patterns.forEach((support, pattern) => {
                    allPatterns.set(pattern/*.join(',')*/, support);
                });
            }
        }

        return allPatterns;
    }

    printHeaderTable() {
        console.log("\nHeader Table:");
        console.log("Item | Support | Node Links");
        console.log("-".repeat(40));
        
        for (const [item, data] of this.headerTable) {
            let nodeLinks = [];
            let currentNode = data.nodeLink;
            while (currentNode) {
                nodeLinks.push(currentNode.count);
                currentNode = currentNode.nodeLink;
            }
            console.log(`${item.padEnd(15)} | ${data.support.toString().padEnd(7)} | ${nodeLinks.join(" -> ")}`);
        }
    }

    // Print the tree (for debugging)
    printTree(node = this.root, level = 0) {
        const indent = "  ".repeat(level);
        console.log(`${indent}${node.item || 'Root'} (${node.count})`);
        
        for (const [item, childNode] of node.children) {
            this.printTree(childNode, level + 1);
        }
    }
}

module.exports = FPTree;