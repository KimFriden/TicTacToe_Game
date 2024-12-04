//#region
import * as readlinePromises from "node:readline/promises";
import dictionary from "./dictionary.mjs";
const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
});
//#endregion

import ANSI from "./ANSI.mjs";

const språk = "norsk"; // Endre til "engelsk" for å skfite språk |
const tekst = dictionary[språk];

let brett = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
];


//#region Logikken for spillet tre på rad. ---------

const spiller1 = 1;
const spiller2 = -1;

let resultatAvSpill = ""
let spiller = spiller1;
let isGameOver = false;
let spillerNavn1 = "";
let spillerNavn2 = "";

console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
spillerNavn1 = await rl.question(tekst.SPILLER1_NAVN);
spillerNavn2 = await rl.question(tekst.SPILLER2_NAVN);

while (isGameOver == false) {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    visBrett(brett);
    console.log(tekst.DIN_TUR.replace("{spiller}", spillerNavn()));

    let rad = -1;
    let kolone = -1;

    do {
        let pos = await rl.question(tekst.HVOR_SETTE_MERKE);
        if (pos.toLowerCase() === "r") {
            resetSpill();
            continue;
        } else if (pos.toLowerCase() === "q") {
            avsluttSpill();
        }

        const deler = pos.split(",");
        if (deler.length !== 2 || isNaN(deler[0]) || isNaN(deler[1])) {
            console.log(tekst.UGYLDIG_INPUT);
            continue;
        }

        rad = parseInt(deler[0]) - 1;
        kolone = parseInt(deler[1]) - 1;

        if (rad < 0 || rad >= 3 || kolone < 0 || kolone >= 3 || brett[rad][kolone] != 0) {
            console.log(tekst.UGYLDIG_VALG);
            rad = -1;
            kolone = -1;
        }

    } while (rad == -1 || kolone == -1);

    brett[rad][kolone] = spiller;

    let vinner= harNoenVunnet(brett);
    if (vinner != 0) {
        isGameOver = true;
        resultatAvSpill = tekst.VINNER.replace("{spiller}", spillerNavn(vinner));
    } else if (erSpilletUavgjort(brett)) {
        resultatAvSpill = tekst.UAVGJORT;
        isGameOver = true;
    }

    byttAktivSpiller();
}

console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
visBrett(brett);
console.log(resultatAvSpill);
console.log(tekst.GAME_OVER);
process.exit();

//#endregion---------------------------------------------------------------------------------------

function visBrett(brett) {
    console.log(tekst.KOLONNER);
    console.log(tekst.OVERSKRIFT_START);

    for (let i = 0; i < brett.length; i++) {
        const rad = brett[i];
        let visningAvRad = `${i + 1} │`;

        for (let j = 0; j < rad.length; j++) {
            let verdi = rad[j];
            if (verdi == 0) {
                visningAvRad += "   │";
            } else if (verdi == spiller1) {
                visningAvRad += ` ${ANSI.COLOR.GREEN}X${ANSI.COLOR_RESET} │`;
            } else if (verdi == spiller2) {
                visningAvRad += ` ${ANSI.COLOR.RED}O${ANSI.COLOR_RESET} │`;
            }
        }

        console.log(visningAvRad);

        if (i < brett.length - 1) {
            console.log(tekst.OVERSKRIFT_MIDT);
        } else {
            console.log(tekst.OVERSKRIFT_SLUTT);
        }
    }
}



function harNoenVunnet(brett) {
    for (let rad = 0; rad < brett.length; rad++) {
        let sum = 0;
        for (let kolone = 0; kolone < brett.length; kolone++) {
            sum += brett[rad][kolone];
        }
        if (Math.abs(sum) == 3) {
            return sum / 3;
        }
    }

    for (let kolone = 0; kolone < brett.length; kolone++) {
        let sum = 0;
        for (let rad = 0; rad < brett.length; rad++) {
            sum += brett[rad][kolone];
        }
        if (Math.abs(sum) == 3) {
            return sum / 3;
        }
    }

    let sumDiagonal1 = 0;
    for (let i = 0; i < brett.length; i++) {
        sumDiagonal1 += brett[i][i];
    }
    if (Math.abs(sumDiagonal1) == 3) {
        return sumDiagonal1 / 3;
    }

    let sumDiagonal2 = 0;
    for (let i = 0; i < brett.length; i++) {
        sumDiagonal2 += brett[i][brett.length - 1 - i];
    }
    if (Math.abs(sumDiagonal2) == 3) {
        return sumDiagonal2 / 3;
    }

    return 0;
}

function erSpilletUavgjort(brett) {
    for (let rad = 0; rad < brett.length; rad++) {
        for (let kolone = 0; kolone < brett[rad].length; kolone++) {
            if (brett[rad][kolone] == 0) {
                return false;
            }
        }
    }
    return true;
}

function spillerNavn(sp= spiller) {
    if (sp == spiller1) {
        return spillerNavn1;
    } else {
        return spillerNavn2;
    }
}

function byttAktivSpiller() {
    spiller = (spiller === spiller1) ? spiller2 : spiller1; 
}

function resetSpill() {
    brett = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];
    spiller = spiller1;
    isGameOver = false;
    console.log(tekst.SPILL_TILBAKESTILT);
}

function avsluttSpill() {
    console.log(tekst.SPILL_AVSLUTTES);
    process.exit();
}