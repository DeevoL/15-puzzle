document.addEventListener('DOMContentLoaded', setup);

let grid = document.getElementsByTagName('tbody')[0]
let rows = grid.getElementsByTagName('tr')
const counter = document.getElementById('counter')

function setup() {

    randomize()

    document.getElementById('randomize').addEventListener('click', randomize)
    let solve_btn = document.getElementById('solve')
    solve_btn.addEventListener('click', function () {
        temp_grid = [[], [], [], []]
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                temp_grid[i].push(rows[i].children[j].innerHTML)
            }
        }
        playSol(temp_grid, solve)
    })


    for (var x = 0; x < rows.length; x++) {
        for (var y = 0; y < rows.length; y++) {
            rows[x].children[y].addEventListener('click', function () {
                fullCheck(this.cellIndex, Number(this.id))
            })
        }
    }
}

function randomize() {
    var tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, ""]
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    if (countInversions(tiles) % 2 != 0) {
        if (tiles[0] != "" && tiles[1] != "") {
            [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
        }
        else {
            [tiles[14], tiles[15]] = [tiles[15], tiles[14]];
        }
    }

    let tile = grid.getElementsByTagName('td')
    for (var i = 0; i < tile.length; i++) {
        tile[i].innerHTML = tiles[i]
        if (tiles[i] == "") {
            tile[i].classList.add("blank")
        }
        else {
            tile[i].classList.remove("blank")
        }
    }
    counter.textContent = 0
}

// count 'inversions' to determine if randomized board is solvable.
function countInversions(arr) {
    var inversions = 0
    for (let i = 0; i <= 15; i++) {
        if (arr[i] == "") {
            inversions = inversions + Math.floor((15 - i) / 4)
        }
        for (let j = i; j <= 15; j++) {
            if (arr[i] > arr[j] && arr[i] != "" && arr[j] != "") {
                inversions = inversions + 1
            }
        }
    }
    return inversions;
}

// checks if puzzle/board is in solved state
function solved() {
    let tile = grid.getElementsByTagName('td')
    for (var i = 0; i < tile.length - 1; i++) {
        if (Number(tile[i].innerHTML) - 1 != i) {
            return
        }
    }
    setTimeout(function () {
        alert("You won!")
    }, 10)
    return true
}

// Check tiles adjacent to tile at (x,y) and swaps with blank tile if possible
function adjCheck(x, y) {
    if (y < 3 && rows[y + 1].children[x].innerHTML == "") {
        swap(x, y, x, y + 1)
    }
    else if (y > 0 && rows[y - 1].children[x].innerHTML == "") {
        swap(x, y, x, y - 1)
    }
    else if (x < 3 && rows[y].children[x + 1].innerHTML == "") {
        swap(x, y, x + 1, y)
    }
    else if (x > 0 && rows[y].children[x - 1].innerHTML == "") {
        swap(x, y, x - 1, y)
    }
    else {
        return false
    }
}

// Allows sliding of multiple tiles at once.
function fullCheck(x, y) {
    for (var y2 = 0; y2 < 4; y2++) {

        if (rows[y2].children[x].innerHTML == "") {
            if (y2 < y) {
                for (var i = y2; i < y; i++) {
                    swap(x, i + 1, x, i)
                }
            }
            else if (y2 > y) {
                for (var i = y2; i > y; i--) {
                    swap(x, i - 1, x, i)
                }
            }
        }
    }
    for (var x2 = 0; x2 < 4; x2++) {
        if (rows[y].children[x2].innerHTML == "") {
            if (x2 < x) {
                for (var i = x2; i < x; i++) {
                    swap(i + 1, y, i, y)
                }
            }
            else if (x2 > x) {
                for (var i = x2; i > x; i--) {
                    swap(i - 1, y, i, y)
                }
            }
        }
    }
}

function swap(x, y, x2, y2) {
    // Takes four parameters.
    // x and y are x,y coordinates of tile adjacent to blank tile.
    // x2 and y2 are coordinates of the blank tile

    rows[y2].children[x2].innerHTML = rows[y].children[x].innerHTML
    rows[y].children[x].innerHTML = ""
    rows[y].children[x].classList.add('blank')
    rows[y2].children[x2].classList.remove('blank')
    incCounter()
    return solved()
}

// Calculates Manhattan distance of tile at position x,y in graph/board g
function manhattan_dist(x, y, g) {
    var tile_val = g[y][x]
    if (tile_val == "") {
        return 0
    }

    var correct_x = (tile_val - 1) % 4
    var correct_y = Math.floor((tile_val - 1) / 4)

    var ret = Math.abs(correct_y - y) + Math.abs(correct_x - x)
    return ret
}

// takes a 2d array representation of the board and determines the change in manhattan distance of the possible moves
// it then returns all this information without actually changing the state of the board
function sim(sim_grid, f) {
    var move = 0
    var ret = {}

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (sim_grid[i][j] == "") {
                var x = j
                var y = i
            }
        }
    }
    if (y > 0) {
        var val_to_swap = sim_grid[y - 1][x]
        var correct_y = Math.floor((val_to_swap - 1) / 4)
        sim_grid[y][x] = sim_grid[y - 1][x]
        sim_grid[y - 1][x] = ""
        if (Math.abs(y - 1 - correct_y) > Math.abs(y - correct_y)) {
            move = -f
        }
        else {
            move = f
        }
        ret[sim_grid] = [move, "u"]
        sim_grid[y - 1][x] = sim_grid[y][x]
        sim_grid[y][x] = ""
    }
    if (y < 3) {
        var val_to_swap = sim_grid[y + 1][x]
        var correct_y = Math.floor((val_to_swap - 1) / 4)
        sim_grid[y][x] = sim_grid[y + 1][x]
        sim_grid[y + 1][x] = ""
        if (Math.abs(y + 1 - correct_y) > Math.abs(y - correct_y)) {
            move = -f
        }
        else {
            move = f
        }
        ret[sim_grid] = [move, "d"]
        sim_grid[y + 1][x] = sim_grid[y][x]
        sim_grid[y][x] = ""
    }
    if (x > 0) {
        var val_to_swap = sim_grid[y][x - 1]
        var correct_x = (val_to_swap - 1) % 4
        sim_grid[y][x] = sim_grid[y][x - 1]
        sim_grid[y][x - 1] = ""
        if (Math.abs(x - 1 - correct_x) > Math.abs(x - correct_x)) {
            move = -f
        }
        else {
            move = f
        }
        ret[sim_grid] = [move, "l"]
        sim_grid[y][x - 1] = sim_grid[y][x]
        sim_grid[y][x] = ""
    }
    if (x < 3) {
        var val_to_swap = sim_grid[y][x + 1]
        var correct_x = (val_to_swap - 1) % 4
        sim_grid[y][x] = sim_grid[y][x + 1]
        sim_grid[y][x + 1] = ""
        if (Math.abs(x + 1 - correct_x) > Math.abs(x - correct_x)) {
            move = -f
        }
        else {
            move = f
        }
        ret[sim_grid] = [move, "r"]
        sim_grid[y][x + 1] = sim_grid[y][x]
        sim_grid[y][x] = ""
    }
    return [ret, sim_grid]

}

// Finds a solution for the current state of the puzzle
function solve(perm) {
    m = {}
    paths = {}
    visited = {}
    paths[perm] = []
    g_vals = {}
    initial_run = true
    initial_m = 0

    // calculate total manhattan distance for starting position
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            initial_m = initial_m + 2 * (manhattan_dist(j, i, perm))
        }
    }
    m[perm] = initial_m
    queue = new Heapify(capacity = 1500000)
    queue.push(perm, m[perm])

    while (true) {
        if (initial_run) {
            res = sim(queue.pop(), 2)
            visited[res[1]] = true
            initial_run = false
            g_vals[res[1]] = 0
        }
        else {
            res = sim(convertTo2d(queue.pop().split(",")), 2)
        }
        for (var permutation in res[0]) {
            g_vals[permutation] = g_vals[res[1]] + 1
            m[permutation] = m[res[1]] + res[0][permutation][0] + 1
            paths[permutation] = [...paths[res[1]]]
            paths[permutation].push(res[0][permutation][1])
            if (m[res[1]] + res[0][permutation][0] - g_vals[res[1]] == 0) {
                console.log(Object.keys(visited).length)
                return paths[permutation]
            }
            if (!visited[permutation]) {
                visited[permutation] = true
                queue.push(permutation, m[permutation])
            }
        }
        delete m[res[1]]
        delete g_vals[res[1]]
        delete paths[res[1]]
    }

    return false
}

function simpleSolve(perm) {
    m = {}
    paths = {}
    visited = []
    to_visit = {}
    queue = [[perm, 0]]
    paths[perm] = []
    initial_run = true
    while (queue.length) {
        if (initial_run) {
            res = sim(queue.shift()[0])
            initial_run = false
        }
        else {
            res = sim(convertTo2d(queue.shift()[0].split(",")))
        }
        for (var permutation in res[0]) {
            m[permutation] = res[0][permutation][0]
            paths[permutation] = [...paths[res[1]]]
            paths[permutation].push(res[0][permutation][1])
            if (res[0][permutation][0] == 0) {
                return paths[permutation]
            }
            if (visited.indexOf(permutation) == -1) {
                visited.push(permutation)
                queue.push([permutation, m[permutation]])
            }
        }
        queue.sort(function (a, b) {
            return a[1] - b[1]
        })
    }

    return false
}

function convertTo2d(arr) {
    ret_arr = [[], [], [], []]
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            ret_arr[i].push(arr.shift())
        }
    }
    return ret_arr
}


// generate solution using algorithm passed to func parameter
// 'plays' out solution with 150ms pause between each move
async function playSol(g, func) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (g[i][j] == "") {
                x = j
                y = i
            }
        }
    }
    const async_sol = async () => {
        const res = await func(g)

        return res
    };
    (async () => {
        var sol = await async_sol()
        console.log(sol)
        for (var step in sol) {

            if (sol[step] == "u") {
                swap(x, y - 1, x, y)
                y = y - 1
            }
            if (sol[step] == "d") {
                swap(x, y + 1, x, y)
                y = y + 1
            }
            if (sol[step] == "l") {
                swap(x - 1, y, x, y)
                x = x - 1
            }
            if (sol[step] == "r") {
                swap(x + 1, y, x, y)
                x = x + 1
            }
            await pause(150)

        }
    })()
}

function incCounter() {
    counter.textContent = String(Number(counter.textContent) + 1)
}


async function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




// THE CLASS BELOW IS TAKEN FROM https://github.com/luciopaiva/heapify and modified very slightly
// I COULD NOT FIGURE OUT HOW TO PROPERLY IMPORT IT AS A MODULE SO I HAVE INCLUDED IT DIRECTLY IN MY CODE HERE
// AGAIN, THI IS NOT MY CODE AND I'M NOT TAKING CREDIT FOR IT. I AM UNSURE HOW TO PROPERLY CITE, SO AGAIN,
// THE CODE IS FROM THIS PUBLICLY AVAILABLE LIBRARY https://github.com/luciopaiva/heapify
const ROOT_INDEX = 1;

// This class serves as the priority queue that I use in my algorithm.
class Heapify {

    constructor(capacity = 50000, keys = [], priorities = [],
        KeysBackingArrayType = Array,
        PrioritiesBackingArrayType = Uint32Array) {

        this._capacity = capacity;
        this._keys = new KeysBackingArrayType(capacity + ROOT_INDEX);
        this._priorities = new PrioritiesBackingArrayType(capacity + ROOT_INDEX);
        // to keep track of whether the first element is a deleted one
        this._hasPoppedElement = false;

        if (keys.length !== priorities.length) {
            throw new Error("Number of keys does not match number of priorities provided.");
        }
        if (capacity < keys.length) {
            throw new Error("Capacity less than number of provided keys.");
        }
        // copy data from user
        for (let i = 0; i < keys.length; i++) {
            this._keys[i + ROOT_INDEX] = keys[i];
            this._priorities[i + ROOT_INDEX] = priorities[i];
        }
        this.length = keys.length;
        for (let i = keys.length >>> 1; i >= ROOT_INDEX; i--) {
            this.bubbleDown(i);
        }
    }

    get capacity() {
        return this._capacity;
    }

    clear() {
        this.length = 0;
        this._hasPoppedElement = false;
    }

    /**
     * Bubble an item up until its heap property is satisfied.
     *
     * @param {Number} index
     * @private
     */
    bubbleUp(index) {
        const key = this._keys[index];
        const priority = this._priorities[index];

        while (index > ROOT_INDEX) {
            // get its parent item
            const parentIndex = index >>> 1;
            if (this._priorities[parentIndex] <= priority) {
                break;  // if parent priority is smaller, heap property is satisfied
            }
            // bubble parent down so the item can go up
            this._keys[index] = this._keys[parentIndex];
            this._priorities[index] = this._priorities[parentIndex];

            // repeat for the next level
            index = parentIndex;
        }

        // we finally found the place where the initial item should be; write it there
        this._keys[index] = key;
        this._priorities[index] = priority;
    }

    /**
     * Bubble an item down until its heap property is satisfied.
     *
     * @param {Number} index
     * @private
     */
    bubbleDown(index) {
        const key = this._keys[index];
        const priority = this._priorities[index];

        const halfLength = ROOT_INDEX + (this.length >>> 1);  // no need to check the last level
        const lastIndex = this.length + ROOT_INDEX;
        while (index < halfLength) {
            const left = index << 1;

            // pick the left child
            let childPriority = this._priorities[left];
            let childKey = this._keys[left];
            let childIndex = left;

            // if there's a right child, choose the child with the smallest priority
            const right = left + 1;
            if (right < lastIndex) {
                const rightPriority = this._priorities[right];
                if (rightPriority < childPriority) {
                    childPriority = rightPriority;
                    childKey = this._keys[right];
                    childIndex = right;
                }
            }

            if (childPriority >= priority) {
                break;  // if children have higher priority, heap property is satisfied
            }

            // bubble the child up to where the parent is
            this._keys[index] = childKey;
            this._priorities[index] = childPriority;

            // repeat for the next level
            index = childIndex;
        }

        // we finally found the place where the initial item should be; write it there
        this._keys[index] = key;
        this._priorities[index] = priority;
    }

    /**
     * @param {*} key the identifier of the object to be pushed into the heap
     * @param {Number} priority 32-bit value corresponding to the priority of this key
     */
    push(key, priority) {
        if (this.length === this._capacity) {
            throw new Error("Heap has reached capacity, can't push new items");
        }

        if (this._hasPoppedElement) {
            // replace root element (which was deleted from the last pop)
            this._keys[ROOT_INDEX] = key;
            this._priorities[ROOT_INDEX] = priority;

            this.bubbleDown(ROOT_INDEX);
            this._hasPoppedElement = false;
        } else {
            const pos = this.length + ROOT_INDEX;
            this._keys[pos] = key;
            this._priorities[pos] = priority;
            this.bubbleUp(pos);
        }

        this.length++;
    }

    pop() {
        if (this.length === 0) {
            return undefined;
        }
        this.removePoppedElement();

        this.length--;
        this._hasPoppedElement = true;

        return this._keys[ROOT_INDEX];
    }

    peekPriority() {
        this.removePoppedElement();
        return this._priorities[ROOT_INDEX];
    }

    peek() {
        this.removePoppedElement();
        return this._keys[ROOT_INDEX];
    }

    removePoppedElement() {
        if (this._hasPoppedElement) {
            // since root element was already deleted from pop, replace with last and bubble down
            this._keys[ROOT_INDEX] = this._keys[this.length + ROOT_INDEX];
            this._priorities[ROOT_INDEX] = this._priorities[this.length + ROOT_INDEX];

            this.bubbleDown(ROOT_INDEX);
            this._hasPoppedElement = false;
        }
    }

    get size() {
        return this.length;
    }

    dumpRawPriorities() {
        this.removePoppedElement();

        const result = Array(this.length - ROOT_INDEX);
        for (let i = 0; i < this.length; i++) {
            result[i] = this._priorities[i + ROOT_INDEX];
        }
        return `[${result.join(" ")}]`;
    }
}