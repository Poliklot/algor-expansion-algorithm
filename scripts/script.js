// Инициализация молальных окон
const myModal = new HystModal({
    linkAttributeName: 'data-hystmodal',
});

let $currentArea,
    currentMatrix,
    from,
    to;

const drawCard = (matrix) => {
    const $area = document.createElement('div');
    $area.className = 'area';

    (currentMatrix = matrix).forEach((row, i) => {
        const $row = document.createElement('div');
        $row.className = 'area__row';

        row.forEach((cell, j) => {
            const $cell = document.createElement('div');
            $cell.className = 'area__cell';
            $cell.id = `field-${i}-${j}`;
            $cell.addEventListener('click', () => {
                if (cell == 0) {
                    $cell.classList.add('area__cell--active');
                    if (step == 0) {
                        from = {x: j, y: i};
                        changeClueText('2. Выбирите точку, до которой будеи искать')
                        step++;
                    } else if (step == 1) {
                        to = {x: j, y: i};
                        step = 0;
                        changeClueText('3. Смотрите на демонстрацию решения')
                        expansionAlgorithm(from, to, matrix);
                    }
                }
            })

            if (cell == -2) {
                $cell.classList.add('area__cell--empty')
            } else if (cell == -1) {
                $cell.classList.add('area__cell--end')
            } else if (cell == 0) {
                $cell.setAttribute('tabindex', '0');
                $cell.innerHTML = '<img src="./img/block--default.png" alt="Игровой блок с травой" title="Игровой блок с травой" aria-hidden="true">';
            } else if (cell == -3) {
                $cell.classList.add('area__cell--let')
                $cell.innerHTML = `<img src="./img/block--let-${getRandomInt(1,4)}.png" alt="Игровой блок с травой и препятствием" title="Игровой блок с травой и препятствием" aria-hidden="true">`;
            }
            $row.insertAdjacentElement('beforeend', $cell);
        })  

        $area.insertAdjacentElement('beforeend', $row);
    })
    $currentArea?.remove();
    document.querySelector('.graph-container').insertAdjacentElement('beforeend', ($currentArea = $area));
}

const generateRandomCard = (width, height) => {
    const matrix = [];
    for(let i = 0; i < width; i++) {
        matrix.push([]);
        for(let j = 0; j < height; j++) {
            let random;
            if ((i == 0) || ((i == width - 1)) || (j == 0) || (j == height - 1)) matrix[i][j] = -1;
            else {
                if ((i == 1) || ((i == width - 2)) || (j == 1) || (j == height - 2)) matrix[i][j] = ((random = getRandomInt(0,2)) == 1) ? ((getRandomInt(0,3) == 0) ? -1 : 0) : 0;
                else matrix[i][j] = ((random = getRandomInt(0,2)) == 1) ? ((getRandomInt(0,4) == 0) ? -3 : 0) : 0
            };
        }
    }
    return matrix;
}

drawCard(generateRandomCard(11,16)) 

document.querySelector('#buttonCreateRandomCard').addEventListener('click', () => {
    drawCard(generateRandomCard(11,16))  
})

const clearCard = () => {
    changeClueText('1. Выбирите точку, от которой и будем искать')
    $currentArea.querySelectorAll('.area__cell').forEach($cell => {
        const $count = $cell.querySelector('.area__cell-count');
        if ($count) $count.remove();
        $cell.classList.remove('area__cell-way', 'area__cell--active');
    })
}

const setCounterToCell = ($cell, count) => {
    const $count = document.createElement('span');
    $count.className = 'area__cell-count';
    $count.textContent = count;
    $cell.insertAdjacentElement('beforeend', $count);
}

const expansionAlgorithm = (from, to, matrix) => {
    let finded = false;
    let counter = 1;
    const newMatrix = JSON.parse(JSON.stringify(matrix));

    const checkAroundField = (fieldPosition) => {
        const nextFieldsPostions = [];
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (!((i == 0) && (j == 0))) {
                    const thisCounter = counter;
                    if ((newMatrix[fieldPosition.y + i][fieldPosition.x + j] == 0) && (((fieldPosition.x + j) != from.x) || ((fieldPosition.y + i) != from.y))) {
                        if (((fieldPosition.x + j) != to.x) || ((fieldPosition.y + i) != to.y)) {
                            nextFieldsPostions.push({x: fieldPosition.x + j, y: fieldPosition.y + i});
                            newMatrix[fieldPosition.y + i][fieldPosition.x + j] = counter;
                            arrayToQueue.push(() => {setCounterToCell(document.querySelector(`#field-${fieldPosition.y + i}-${fieldPosition.x + j}`), thisCounter);});
                            // setCounterToCell(document.querySelector(`#field-${fieldPosition.y + i}-${fieldPosition.x + j}`), counter);
                        } else {
                            finded = true;
                        }
                    }
                }
            }   
        }
        return nextFieldsPostions;
    }

    arrayToQueue = [];
    let nextFieldsPostions = checkAroundField(from),
        tempNextFieldsPostions = [];
    addToQueue(arrayToQueue);
    
    setCounterToCell(document.querySelector(`#field-${from.y}-${from.x}`), 0);
    
    while (!finded) {
        counter++;
        arrayToQueue = [];
        nextFieldsPostions.forEach(field => checkAroundField(field).forEach(item => tempNextFieldsPostions.push(item)));
        addToQueue(arrayToQueue);
        nextFieldsPostions = tempNextFieldsPostions;
        tempNextFieldsPostions = [];
        if (counter > 20) finded = true;
    }

    let currentValue = counter;
    let currentPosition = to;


    const findOptimalField = (fieldPosition) => {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (!((i == 0) && (j == 0))) {
                    if (newMatrix[fieldPosition.y + i][fieldPosition.x + j] == (currentValue - 1)) {
                        arrayToQueue.push(() => {document.querySelector(`#field-${fieldPosition.y + i}-${fieldPosition.x + j}`).classList.add('area__cell-way');});
                        return {x: fieldPosition.x + j, y: fieldPosition.y + i};
                    }
                }
            }   
        }
    }

    findOptimalField(currentPosition);
    while (currentValue > 0) {
        arrayToQueue = [];
        currentPosition = findOptimalField(currentPosition);
        addToQueue(arrayToQueue);
        currentValue--;
    }

    arrayToQueue = [];
    arrayToQueue.push(() => {setTimeout(() => {clearCard()}, 2000)});
    addToQueue(arrayToQueue);
}

let step = 0;

let queue = [];
let arrayToQueue = [];

const addToQueue = (fn) => {
    queue.push(fn);
}

const $clue = document.querySelector('.clue');

const changeClueText = (text) => {
    $clue.textContent = text;
}

setInterval(() => {
    if (queue.length > 0) {
        if (queue[0].length > 0) {
            queue[0].forEach(item => item());
            queue.shift();
        }
    }
}, 700)