//描画コンテキストの取得

let animId;

const charCodes = ["KE", "RA", "TO", "JA", "SH", "RE", "JU", "TH", "HE", "MA"];
const charFolders = [
    "kenshiro",
    "raoh",
    "toki",
    "jagi",
    "shin",
    "rei",
    "juda",
    "thouther",
    "heart",
    "mamiya",
];
const boostTable = [
    0, 28.799999237060547, 25.920000076293945, 23.328001022338867, 20.995201110839844,
    18.895681381225586, 17.006113052368164, 15.305501937866211, 13.774951934814453,
    12.397457122802734, 11.157711982727051, 10.041940689086914, 9.0377464294433594,
    8.13397216796875, 7.3205747604370117, 6.5885171890258789, 5.9296655654907227,
    5.3366990089416504, 4.8030290603637695, 4.3227262496948242, 3.890453577041626,
    3.5014083385467529, 3.1512675285339355, 2.8361408710479736, 2.5525269508361816,
    2.2972743511199951, 2.067547082901001, 1.8607923984527588, 1.674713134765625,
    1.5072418451309204, 1.3565176725387573, 1.2208659648895264, 1.0987794399261475,
    0.9889014959335327, 0.8900113701820374, 0.8010102510452271, 0.7209092378616333,
    0.64881831407547, 0.5839365124702454, 0.5255428552627564, 0.4729885756969452,
    0.4256897270679474, 0.3831207454204559, 0.3448086678981781, 0.3103277981281281,
    0.279295027256012, 0.2513655424118042, 0.2262289822101593, 0.2036060839891434,
];
const rawBoostTable = [
    0, 28.8, 27.72, 26.748, 25.8732, 25.0859, 24.3773, 23.7395, 23.1656, 22.649, 22.1841, 21.7657,
    21.3891, 21.0502, 20.7452, 20.4707, 20.2236, 20.0012, 19.8011, 19.621, 19.4589, 19.313, 19.1817,
    19.0635, 18.9572, 18.8615, 18.7753, 18.6978, 18.628, 18.5652, 18.5087, 18.4578, 18.412, 18.3708,
    18.3337, 18.3004, 18.2703, 18.2433, 18.2189, 18.197, 18.1773, 18.1596, 18.1436, 18.1293,
    18.1163, 18.1047, 18.0942, 18.0847,
];
const charNames = [
    "ケンシロウ",
    "ラオウ",
    "トキ",
    "ジャギ",
    "シン",
    "レイ",
    "ユダ",
    "サウザー",
    "ハート",
    "マミヤ",
];
const stateNames = {
    stand: "立ち",
    walk_0: "前歩き",
    walk_1: "前歩き",
    "2g_0": "しゃがみガード",
    "2g_1": "しゃがみガード",
    crouch: "しゃがみ",
    "5g_0": "立ちガード",
    "5g_1": "立ちガード",
    bj: "バックジャンプ",
    bj_fall: "バックジャンプ",
    bj_g_0: "バックジャンプガード",
    bj_g_1: "バックジャンプガード",
    vj: "垂直ジャンプ",
    vj_fall: "垂直ジャンプ",
    vj_g_0: "垂直ジャンプガード",
    vj_g_1: "垂直ジャンプガード",
    fj: "前ジャンプ",
    fj_fall: "前ジャンプ",
    fj_g_0: "前ジャンプガード",
    fj_g_1: "前ジャンプガード",
    "5a": "遠A",
    "5b": "遠B",
    "5c": "遠C",
    "5c_1": "遠C",
    "5d": "遠D",
    "2a": "2A",
    "2b": "2B",
    "2c": "2C",
    "2c_1": "2C",
    "2d": "2D",
    "2d_1": "2D",
    "6a": "6A",
    "6b": "6B",
    "6d": "6D",
    ab: "ヘヴィー",
    ac: "グレ",
    bd: "掴み投げ",
    cd_0: "バニ",
    cd_1: "バニ",
    cd_2: "溜めバニ",
    cd_3: "溜めバニ",
    cd_4: "溜めバニ",
    proboke: "挑発",
};

// 共通化: p1=players[0], p2=players[1]
const players = [
    {
        char: 0,
        x: 480,
        y: 984,
        facing: 1,
        stateNo: "stand",
        time: 0,
        timeNo: 0,
        elemNo: 0,
        elemTime: 0,
        velocity: { x: 0, y: 0 },
        push: { stand: {}, crouch: {}, air: {}, current: {} },
        baseMove: {},
        movement: [],
        elem: [],
        image: [],
        level: [],
        offset: { x: [], y: [] },
        hitbox: [],
        res: null,
        boostNo: -1,
        boostX: 0,
        boostY: 0,
        dataJson: "",
        img: [],
        offsetGlobal: { x: 0, y: 0 },
    },
    {
        char: 0,
        x: 800,
        y: 984,
        facing: -1,
        stateNo: "stand",
        time: 0,
        timeNo: 0,
        elemNo: 0,
        elemTime: 0,
        velocity: { x: 0, y: 0 },
        push: { stand: {}, crouch: {}, air: {}, current: {} },
        baseMove: {},
        movement: [],
        elem: [],
        image: [],
        level: [],
        offset: { x: [], y: [] },
        hitbox: [],
        res: null,
        boostNo: -1,
        boostX: 0,
        boostY: 0,
        dataJson: "",
        img: [],
        offsetGlobal: { x: 0, y: 0 },
    },
];
var stageImg;
var boostImgs = [];
var imgCount = 0;
var collision = false;
var stageoffset = [];
stageoffset["x"] = -320;
stageoffset["y"] = -544;
var context;
var canvas;
var time = -1;
var isNext = false;
var isPaused = true;
window.onload = async function () {
    canvas = document.getElementById("checker");
    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 640 * dpr;
    canvas.height = 480 * dpr;
    canvas.style.width = "640px";
    canvas.style.height = "480px";

    if (canvas.getContext) {
        context = canvas.getContext("2d");
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        stageImg = new Image();
        setloadfunc(stageImg);
    }
    loadImageBoost();
    await getDataFromJson(0);
    await getDataFromJson(1);
    await loadImage();
    adjustMoveLists();
    reset();
};

async function loop(timestamp) {
    time += 1;
    setUpPos();
    baseMoveVelSet();
    await posAddVel();
    cameraMove();
    console.log(players[0].x, players[0].y);
    console.log(players[0].stateNo);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(stageImg, stageoffset["x"], stageoffset["y"]);

    // 共通化: 2キャラ分ループ
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        // 通常画像
        // if (p.facing === 1) {
        //     context.drawImage(
        //         p.img[p.image[p.elemNo]],
        //         p.x + stageoffset["x"] + parseInt(p.offset.x[p.elemNo]),
        //         p.y + stageoffset["y"] + parseInt(p.offset.y[p.elemNo]),
        //     );
        // } else {
        //     context.save();
        //     context.transform(-1, 0, 0, 1, p.img[p.image[p.elemNo]].width, 0);
        //     context.drawImage(
        //         p.img[p.image[p.elemNo]],
        //         -(p.x + stageoffset["x"] - parseInt(p.offset.x[p.elemNo])) +
        //             p.img[p.image[p.elemNo]].width,
        //         p.y + stageoffset["y"] + parseInt(p.offset.y[p.elemNo]),
        //     );
        //     context.restore();
        // }
        // ブースト画像
        if (p.boostNo >= 0 && p.boostNo <= 31) {
            if (p.facing === 1) {
                context.drawImage(
                    boostImgs[p.boostNo],
                    p.boostX + stageoffset["x"] - 450 * p.facing,
                    p.boostY + stageoffset["y"] - 400,
                );
            } else {
                context.save();
                context.transform(-1, 0, 0, 1, boostImgs[p.boostNo].width, 0);
                context.drawImage(
                    boostImgs[p.boostNo],
                    -(p.boostX + stageoffset["x"]) - 210 * p.facing,
                    p.boostY + stageoffset["y"] - 400,
                );
                context.restore();
            }
        } else if (p.stateNo == "e" && p.timeNo <= 31) {
            if (p.facing === 1) {
                context.drawImage(
                    boostImgs[p.timeNo],
                    p.x + stageoffset["x"] - 450 * p.facing,
                    p.y + stageoffset["y"] - 400,
                );
            } else {
                context.save();
                context.transform(-1, 0, 0, 1, boostImgs[p.timeNo].width, 0);
                context.drawImage(
                    boostImgs[p.timeNo],
                    -(p.x + stageoffset["x"]) - 210 * p.facing,
                    p.boostY + stageoffset["y"] - 400,
                );
                context.restore();
            }
        }
    }

    // ヒットボックス描画
    context.beginPath();
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        for (let i = 0; i < (p.hitbox[p.elemNo] ? p.hitbox[p.elemNo].length : 0); i++) {
            const box = p.hitbox[p.elemNo][i];
            if (box[4] == "1") {
                context.fillStyle = "rgba(" + [0, 0, 255, 0.4] + ")";
            } else if (box[4] == "0") {
                context.fillStyle = "rgba(" + [255, 0, 0, 0.4] + ")";
            } else if (box[4] == "G") {
                context.fillStyle = "rgba(" + [0, 255, 0, 0.4] + ")";
            }
            // 向きで描画位置調整
            if (p.facing === 1) {
                context.fillRect(
                    p.x + stageoffset["x"] + parseInt(box[0]),
                    p.y + stageoffset["y"] + parseInt(box[1]),
                    parseInt(box[2]),
                    parseInt(box[3]),
                );
            } else {
                context.fillRect(
                    p.x + stageoffset["x"] - parseInt(box[0]),
                    p.y + stageoffset["y"] + parseInt(box[1]),
                    -parseInt(box[2]),
                    parseInt(box[3]),
                );
            }
        }
    }

    // 存在判定枠
    context.fillStyle = "rgba(" + [0, 255, 0, 0.4] + ")";
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        let x1 = p.x + stageoffset["x"] + p.push["current"]["x1"] * p.facing;
        let x2 = p.x + stageoffset["x"] + p.push["current"]["x2"] * p.facing;
        let y1 = p.y + stageoffset["y"] + p.push["current"]["y1"];
        let y2 = p.y + stageoffset["y"] + p.push["current"]["y2"];
        // 左上基準・幅正方向で描画
        if (x1 > x2) [x1, x2] = [x2, x1];
        if (y1 > y2) [y1, y2] = [y2, y1];
        context.fillRect(x1, y1, x2 - x1, y2 - y1);
    }

    if (collisionCheck() != "") {
        collision = true;
    }

    // キャラ座標に赤丸＋P1/P2ラベルを一番上に描画
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        const cx = p.x + stageoffset["x"];
        const cy = p.y + stageoffset["y"];
        context.beginPath();
        context.arc(cx, cy, 6, 0, 2 * Math.PI);
        context.fillStyle = "red";
        context.fill();
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.stroke();
        // ラベル描画
        context.font = "bold 8px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.fillText(idx === 0 ? "P1" : "P2", cx, cy);
    }

    // 共通化: アニメ進行・状態遷移
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        p.timeNo++;
        p.elemTime++;
        if (p.elemTime >= p.elem[p.elemNo] && p.elem[p.elemNo] != -1) {
            p.elemNo++;
            p.elemTime = 0;
        }
        if (p.elemNo >= p.elem.length) {
            p.elemNo = 0;
            // 状態遷移
            if (
                typeof p.stateNo === "string" &&
                p.stateNo.includes("to_") &&
                p.stateNo.includes("_g")
            ) {
                p.stateNo = p.stateNo.replace("to_", "");
                p.stateNo = p.stateNo.replace("_g", "_g_0");
                getDataFromJson(idx);
            } else if (typeof p.stateNo === "string" && p.stateNo.includes("to_")) {
                p.stateNo = p.stateNo.replace("to_", "");
                getDataFromJson(idx);
            } else if (p.stateNo == "vj") {
                p.stateNo = "vj_fall";
                getDataFromJson(idx);
            } else if (p.stateNo == "bj") {
                p.stateNo = "bj_fall";
                getDataFromJson(idx);
            } else if (p.stateNo == "fj") {
                p.stateNo = "fj_fall";
                getDataFromJson(idx);
            } else if (p.stateNo == "cd_0") {
                p.stateNo = "cd_1";
                getDataFromJson(idx);
            } else if (p.stateNo == "cd_2") {
                p.stateNo = "cd_3";
                getDataFromJson(idx);
            } else if (p.stateNo == "cd_3") {
                p.stateNo = "cd_4";
                getDataFromJson(idx);
            } else if (p.stateNo == "walk_0") {
                p.stateNo = "walk_1";
                getDataFromJson(idx);
            } else if (p.stateNo.includes("g_0")) {
                p.stateNo = p.stateNo.replace("_0", "_1");
                getDataFromJson(idx);
            } else if (p.char == 3 && p.stateNo == "6b") {
                p.stateNo = "6b_1";
                getDataFromJson(idx);
            } else if (p.char == 3 && p.stateNo == "6b_1") {
                p.stateNo = "6b_2";
                getDataFromJson(idx);
            } else if (
                p.char == 1 &&
                (p.stateNo == "5c" || p.stateNo == "5d" || p.stateNo == "2c" || p.stateNo == "2d")
            ) {
                p.stateNo = p.stateNo + "_1";
                getDataFromJson(idx);
            } else if (
                p.stateNo != "2a" &&
                p.stateNo != "2b" &&
                !p.stateNo.includes("2c") &&
                !p.stateNo.includes("2d") &&
                p.time != -1
            ) {
                p.stateNo = "5g_0";
                jQuery(idx === 0 ? "#1P_M" : "#2P_M").val("5g_0");
                getDataFromJson(idx);
                p._motionEnded = true;
            } else if (p.time != -1) {
                p.stateNo = "2g_0";
                jQuery(idx === 0 ? "#1P_M" : "#2P_M").val("2g_0");
                getDataFromJson(idx);
                p._motionEnded = true;
            }
        }
    }

    // 両方のキャラのモーションが終わったらstop()
    if (players[0]._motionEnded && players[1]._motionEnded) {
        stop();
        // フラグリセット
        players[0]._motionEnded = false;
        players[1]._motionEnded = false;
    }
    if (collision) {
        await init();
        stop();
        time = 0;
    }

    if (time >= 200) {
        stop();
        reset();
    }

    if (isNext == true) {
        isNext = false;
        stop();
    }
    if (isPaused != true) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
    }
}

function setloadfunc(obj) {
    obj.onload = function () {
        imgCount++;
        // 2キャラ分+ブースト+ステージ
        let total = players[0].img.length + players[1].img.length + boostImgs.length + 1;
        if (imgCount == total) next();
    };
}

function loadImage() {
    // 各キャラのimg配列を初期化
    for (let idx = 0; idx < 2; idx++) {
        players[idx].img = [];
        for (let i = 0; i < players[idx].elem.length; i++) {
            players[idx].img.push(new Image());
        }
        for (let i = 0; i < players[idx].elem.length; i++) {
            players[idx].img[i].src =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ZkAAAAASUVORK5CYII=";
            // 本来は画像パスをここで組み立てる
            setloadfunc(players[idx].img[i]);
        }
    }
    return new Promise((resolve, reject) => {
        stageImg.onload = () => resolve(stageImg);
        stageImg.onerror = reject;
        stageImg.src = "./images/tokistage.jpg";
    });
}

function loadImageBoost() {
    for (var i = 0; i < 32; i++) {
        boostImgs[i] = new Image();
        boostImgs[i].src = "./images/boost/boost_" + i + ".png";
        setloadfunc(boostImgs[i]);
    }
}

function stop() {
    window.cancelAnimationFrame(animId);
    isPaused = true;
}

function start() {
    if (isPaused == true) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
        isPaused = false;
    }
}

function next() {
    if (isPaused == true) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
    }
    isNext = true;
}

function setUpPos() {
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        if (p.boostNo >= 0) {
            p.velocity.x = boostTable[p.boostNo];
            p.boostNo++;
            if (p.boostNo >= boostTable.length) p.boostNo = -1;
            jQuery(idx === 0 ? "#p1boost" : "#p2boost").prop("checked", false);
        }
        if (p.stateNo == "e") {
            p.velocity.x = rawBoostTable[p.timeNo];
        }
        for (let i = 0; i < (p.movement ? p.movement.length : 0); i++) {
            if (p.movement[i]["time"] == p.timeNo) {
                move(idx, parseFloat(p.movement[i]["x"]), parseFloat(p.movement[i]["y"]));
            }
        }
    }
}

function baseMoveVelSet() {
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        if (p.timeNo == 0) {
            if (p.stateNo == "vj" || p.stateNo == "vj_g_0") {
                p.velocity.y = p.baseMove["vertical_jump_y"];
            } else if (p.stateNo == "bj" || p.stateNo == "bj_g_0") {
                p.velocity.y = p.baseMove["back_jump_y"];
            } else if (p.stateNo == "fj" || p.stateNo == "fj_g_0") {
                p.velocity.y = p.baseMove["forward_jump_y"];
            }
            if (p.char == 2 && p.stateNo == "walk_1") {
                p.velocity.x = p.baseMove["forward_walk"];
            }
        }
        if (p.timeNo == 1) {
            if (p.stateNo == "bj" || p.stateNo == "bj_g_0") {
                p.velocity.x = p.baseMove["back_jump_x"];
            } else if (p.stateNo == "fj" || p.stateNo == "fj_g_0") {
                p.velocity.x = p.baseMove["forward_jump_x"];
            }
        }
        if (p.timeNo == 3) {
            if (p.stateNo == "walk_0") {
                p.velocity.x = p.baseMove["forward_walk"];
            }
        }
    }
}

async function posAddVel() {
    // 振り向き判定を行うstateNoリスト
    const autoFacingStates = ["stand", "land", "walk_0", "walk_1"];

    // 重力加算
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        if (p.y < 984 || p.velocity.y < 0) {
            if (!(p.char == 3 && p.stateNo.includes("6b"))) {
                p.velocity.y += 1.1;
            }
        }
    }

    // 共通化: 振り向き判定を行うstateNoのみ自動で向きを判定
    for (let idx = 0; idx < 2; idx++) {
        const otherIdx = 1 - idx;
        const p = players[idx];
        const prevFacing = p.facing;
        if (autoFacingStates.includes(p.stateNo)) {
            if (p.x === players[otherIdx].x) {
                // 同座標なら何もしない
            } else if (p.x < players[otherIdx].x) {
                p.facing = 1;
            } else {
                p.facing = -1;
            }
        }
        // 前歩き中に振り向いたら立ちガードに切り替え
        if ((p.stateNo === "walk_0" || p.stateNo === "walk_1") && prevFacing !== p.facing) {
            p.stateNo = "5g_0";
            await getDataFromJson(idx);
        }
    }

    // 2キャラの次フレーム座標・push枠計算
    const px = [
        players[0].x + players[0].velocity.x * players[0].facing,
        players[1].x + players[1].velocity.x * players[1].facing,
    ];
    const py = [players[0].y + players[0].velocity.y, players[1].y + players[1].velocity.y];
    let box = [[], []];
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        if (py[idx] < 984) {
            p.push.current = p.push.air;
        } else if (
            py[idx] >= 984 &&
            p.stateNo != "1" &&
            p.stateNo != "2" &&
            p.stateNo != "2a" &&
            p.stateNo != "2b" &&
            p.stateNo != "2c" &&
            p.stateNo != "2d"
        ) {
            p.push.current = p.push.stand;
        } else {
            p.push.current = p.push.crouch;
        }
        box[idx] = {
            x1: px[idx] + p.push.current.x1 * p.facing,
            y1: py[idx] + p.push.current.y1,
            x2: px[idx] + p.push.current.x2 * p.facing,
            y2: py[idx] + p.push.current.y2,
        };
        if (box[idx].x1 > box[idx].x2) {
            let temp = box[idx].x1;
            box[idx].x1 = box[idx].x2;
            box[idx].x2 = temp;
        }
    }

    // 衝突判定
    if (
        box[0].x1 <= box[1].x2 &&
        box[1].x1 <= box[0].x2 &&
        box[0].y1 <= box[1].y2 &&
        box[1].y1 <= box[0].y2
    ) {
        // 片方空中
        if (
            (players[0].push.current == players[0].push.air &&
                players[1].push.current != players[1].push.air) ||
            (players[0].push.current != players[0].push.air &&
                players[1].push.current == players[1].push.air)
        ) {
            move(0, 0, players[0].velocity.y);
            move(1, 0, players[1].velocity.y);
            let dx =
                players[0].x +
                players[0].push.current.x2 * players[0].facing -
                players[1].x -
                players[1].push.current.x2 * players[1].facing;
            if (players[0].push.current == players[0].push.air) {
                move(0, -dx, 0);
            } else {
                move(1, -dx, 0);
            }
        } else {
            move(0, (players[0].velocity.x - players[1].velocity.x) / 2, players[0].velocity.y);
            move(1, (players[1].velocity.x - players[0].velocity.x) / 2, players[1].velocity.y);
            let dx =
                (players[0].x +
                    players[0].push.current.x2 * players[0].facing -
                    players[1].x -
                    players[1].push.current.x2 * players[1].facing) /
                2;
            move(0, -dx, 0);
            move(1, -dx, 0);
        }
    } else {
        move(0, players[0].velocity.x, players[0].velocity.y);
        move(1, players[1].velocity.x, players[1].velocity.y);
    }
}

function setChar(idx, charId) {
    players[idx].char = charId;
    adjustMoveLists();
    getDataFromJson(idx);
}

function adjustMoveLists() {
    adjustMoveList("1P_M", players[0].char);
    adjustMoveList("2P_M", players[1].char);
}

function adjustMoveList(pulldownId, charId) {
    jQuery(`#${pulldownId} option`).show();
    if (charId != 2) {
        jQuery(`#${pulldownId} option[value='6d']`).hide();
    }
    if (charId >= 5 && charId != 7) {
        jQuery(`#${pulldownId} option[value='6b']`).hide();
    }
    if (charId == 2) {
        jQuery(`#${pulldownId} option[value='bd']`).hide();
    }
}

function SetBoostCheckboxEnabled(idx) {
    let stateNo = players[idx].stateNo;
    if (
        stateNo == "stand" ||
        stateNo == "walk_0" ||
        stateNo == "walk_1" ||
        stateNo == "crouch" ||
        stateNo.includes("2g") ||
        stateNo.includes("5g") ||
        stateNo == "e" ||
        stateNo.includes("j")
    ) {
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").attr("disabled", true);
    } else {
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").attr("disabled", false);
    }
}

function setState(idx, stateNo) {
    stop();
    players[idx].stateNo = stateNo;
    SetBoostCheckboxEnabled(idx);
    getDataFromJson(idx);
    if ((players[idx].boostNo = -1)) {
        players[idx].velocity.x = 0;
    }
}
("use strict");

// 共通化: p1=0, p2=1
async function getDataFromJson(idx) {
    const p = players[idx];
    p.offsetGlobal.x = 0;
    p.offsetGlobal.y = 0;
    return fetch(`./data/${charFolders[p.char]}.json`)
        .then(function (res) {
            return res.json();
        })
        .then(function (res) {
            let stateno = p.stateNo;
            // 共通化: _g_0/_g_1→ag_0/ag_1, to_*_g→to_*
            if (/^(bj|fj|vj)_g_0$/.test(stateno)) {
                stateno = "ag_0";
            } else if (/^(bj|fj|vj)_g_1$/.test(stateno)) {
                stateno = "ag_1";
            } else if (/^to_(bj|fj|vj)_g$/.test(stateno)) {
                stateno = stateno.replace(/_g$/, "");
            }
            p.res = res[stateno];
            p.timeNo = 0;
            p.elemNo = 0;
            p.elemTime = 0;
            p.time = p.res["time"];
            const n = p.res["elems"].length;
            p.elem = Array(n);
            p.image = Array(n);
            p.offset.x = Array(n);
            p.offset.y = Array(n);
            p.level = Array(n);
            p.hitbox = Array(n);
            p.res["elems"].forEach((e) => {
                const no = e.elemno;
                p.elem[no] = e.time;
                p.image[no] = e.imageno;
                p.level[no] = e.level;
                p.offset.x[no] = e.image_x + p.offsetGlobal.x;
                p.offset.y[no] = e.image_y + p.offsetGlobal.y;
                p.hitbox[no] = e.boxes.map((b) => [b.x, b.y, b.w, b.h, b.attr]);
            });

            ["stand", "crouch", "air"].forEach((type) => {
                ["x1", "y1", "x2", "y2"].forEach((key, i) => {
                    const map = { x1: "lx", y1: "uy", x2: "rx", y2: "dy" };
                    p.push[type][key] = res["playerpush"][type][map[key]];
                });
            });

            p.baseMove = res["base_movement"];
            p.movement = p.res["movement"];
        });
}

// 共通化: 移動関数
function move(idx, x, y) {
    const p = players[idx];
    x = parseFloat(x);
    y = parseFloat(y);
    p.x += x * p.facing;
    p.y += y;
    if (p.x < 0) p.x = 0;
    if (p.x > 1280) p.x = 1280;
    if (p.y < -64) p.y = -64;
    if (p.y > 984) {
        p.y = 984;
        if (!(p.char == 3 && p.stateNo.includes("6b"))) {
            p.stateNo = "land";
            getDataFromJson(idx);
            p.velocity.x = 0;
            p.velocity.y = 0;
        }
    }
}

("use strict");
function setBoost(idx, ischecked) {
    const p = players[idx];
    if (ischecked) {
        p.boostNo = 0;
        p.boostX = p.x;
        p.boostY = p.y;
    } else {
        p.boostNo = -1;
    }
}

async function init() {
    const initVals = [
        { x: 480.0, pm: "#1P_M", pb: "#p1boost" },
        { x: 800.0, pm: "#2P_M", pb: "#p2boost" },
    ];
    for (let idx = 0; idx < 2; idx++) {
        players[idx].x = initVals[idx].x;
        players[idx].y = 984.0;
        players[idx].velocity.x = 0.0;
        players[idx].velocity.y = 0.0;
        players[idx].boostNo = -1;
        players[idx].stateNo = "stand";
        SetBoostCheckboxEnabled(idx);
        jQuery(initVals[idx].pm).val("stand");
        jQuery(initVals[idx].pb).prop("checked", false);
    }
    await getDataFromJson(0);
    await getDataFromJson(1);
    await loadImage();
    adjustMoveLists();
    time = -1;
    collision = false;
}

async function reset() {
    await init();
    next();
}

function collisionCheck() {
    let hit = [false, false];
    let clash = false;
    let hitboxR = [[], []];
    let hitboxB = [[], []];
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.font = "18px 'MS Pゴシック'";

    //データ分別
    for (let idx = 0; idx < 2; idx++) {
        let p = players[idx];
        let hbox = p.hitbox[p.elemNo] || [];
        for (let i = 0; i < hbox.length; i++) {
            let box = hbox[i];
            let obj = {
                x: parseInt(box[0]),
                y: parseInt(box[1]),
                w: parseInt(box[2]),
                h: parseInt(box[3]),
            };
            if (box[4] == "0") hitboxR[idx].push(obj);
            else if (box[4] == "1") hitboxB[idx].push(obj);
        }
    }

    //相殺判定
    for (let i = 0; i < hitboxR[0].length; i++) {
        let mx1 = players[0].x + hitboxR[0][i].x * players[0].facing;
        let my1 = players[0].y + hitboxR[0][i].y;
        let mx2 = mx1 + hitboxR[0][i].w * players[0].facing;
        let my2 = my1 + hitboxR[0][i].h;
        if (mx1 > mx2) [mx1, mx2] = [mx2, mx1];
        for (let j = 0; j < hitboxR[1].length; j++) {
            let ex1 = players[1].x + hitboxR[1][j].x * players[1].facing;
            let ey1 = players[1].y + hitboxR[1][j].y;
            let ex2 = ex1 + hitboxR[1][j].w * players[1].facing;
            let ey2 = ey1 + hitboxR[1][j].h;
            if (ex1 > ex2) [ex1, ex2] = [ex2, ex1];
            if (mx1 < ex2 && ex1 < mx2 && my1 < ey2 && ey1 < my2) {
                clash = true;
            }
        }
    }
    if (clash) {
        if (
            players[1].level[players[1].elemNo] - 3 >= players[0].level[players[0].elemNo] &&
            players[1].y >= 984
        ) {
            clash = false;
        }
        if (players[0].stateNo == "bd" || players[1].stateNo == "bd") {
            clash = false;
        }
    }
    if (!clash) {
        //P1ヒット判定
        for (let i = 0; i < hitboxR[0].length; i++) {
            let mx1 = players[0].x + hitboxR[0][i].x * players[0].facing;
            let my1 = players[0].y + hitboxR[0][i].y;
            let mx2 = mx1 + hitboxR[0][i].w * players[0].facing;
            let my2 = my1 + hitboxR[0][i].h;
            if (mx1 > mx2) [mx1, mx2] = [mx2, mx1];
            for (let j = 0; j < hitboxB[1].length; j++) {
                let ex1 = players[1].x + hitboxB[1][j].x * players[1].facing;
                let ey1 = players[1].y + hitboxB[1][j].y;
                let ex2 = ex1 + hitboxB[1][j].w * players[1].facing;
                let ey2 = ey1 + hitboxB[1][j].h;
                if (ex1 > ex2) [ex1, ex2] = [ex2, ex1];
                if (mx1 < ex2 && ex1 < mx2 && my1 < ey2 && ey1 < my2) {
                    hit[0] = true;
                }
            }
        }

        //P2ヒット判定
        for (let i = 0; i < hitboxR[1].length; i++) {
            let mx1 = players[1].x + hitboxR[1][i].x * players[1].facing;
            let my1 = players[1].y + hitboxR[1][i].y;
            let mx2 = mx1 + hitboxR[1][i].w * players[1].facing;
            let my2 = my1 + hitboxR[1][i].h;
            if (mx1 > mx2) [mx1, mx2] = [mx2, mx1];
            for (let j = 0; j < hitboxB[0].length; j++) {
                let ex1 = players[0].x + hitboxB[0][j].x * players[0].facing;
                let ey1 = players[0].y + hitboxB[0][j].y;
                let ex2 = ex1 + hitboxB[0][j].w * players[0].facing;
                let ey2 = ey1 + hitboxB[0][j].h;
                if (ex1 > ex2) [ex1, ex2] = [ex2, ex1];
                if (mx1 < ex2 && ex1 < mx2 && my1 < ey2 && ey1 < my2) {
                    hit[1] = true;
                }
            }
        }
    }
    context.textAlign = "right";
    context.strokeText(`${time}F目`, 630, 470);
    context.fillText(`${time}F目`, 630, 470);
    if (clash) {
        const aligns = ["left", "right"];
        const xs = [10, 630];
        for (let i = 0; i < 2; i++) {
            context.textAlign = aligns[i];
            context.strokeText("相殺", xs[i], 90);
            context.fillText("相殺", xs[i], 90);
        }
    }
    if (
        !clash &&
        hit[0] &&
        players[1].level[players[1].elemNo] - 3 >= players[0].level[players[0].elemNo]
    ) {
        hit[0] = false;
    }
    const marks = [
        hit[0] && !hit[1] ? "◯" : !hit[0] && hit[1] ? "×" : "",
        hit[1] && !hit[0] ? "◯" : hit[0] && !hit[1] ? "×" : "",
    ];
    const aligns = ["left", "right"];
    const xs = [10, 630];
    for (let i = 0; i < 2; i++) {
        if (marks[i]) {
            context.textAlign = aligns[i];
            context.strokeText(marks[i], xs[i], 90);
            context.fillText(marks[i], xs[i], 90);
        }
    }

    if (hit[0] && hit[1]) {
        context.textAlign = "left";
        context.strokeText("相打ち（勝敗ランダム）", 10, 90);
        context.fillText("相打ち（勝敗ランダム）", 10, 90);
        context.textAlign = "right";
        context.strokeText("相打ち（勝敗ランダム）", 630, 90);
        context.fillText("相打ち（勝敗ランダム）", 630, 90);
    }
    if (hit[0] || hit[1] || clash) {
        const aligns = ["left", "right"];
        const xs = [10, 630];
        for (let i = 0; i < 2; i++) {
            context.textAlign = aligns[i];
            context.strokeText(charNames[players[i].char], xs[i], 30);
            context.fillText(charNames[players[i].char], xs[i], 30);
            context.strokeText(stateNames[players[i].stateNo], xs[i], 60);
            context.fillText(stateNames[players[i].stateNo], xs[i], 60);
        }
    }

    if (hit[0] && hit[1]) return "trade";
    else if (hit[0]) return "p1";
    else if (hit[1]) return "p2";
    else if (clash) return "clash";
    else return "";
}

function cameraMove() {
    //X軸
    stageoffset["x"] = -320 - (players[0].x + players[1].x) / 2 + 640;
    if (stageoffset["x"] > 0) {
        stageoffset["x"] = 0;
    } else if (stageoffset["x"] < -640) {
        stageoffset["x"] = -640;
    }

    //Y軸
    if (players[0].y < 750 && players[1].y >= 750) {
        stageoffset["y"] = -544 + (750 - players[0].y);
        if (stageoffset["y"] > -300) stageoffset["y"] = -300;
    } else if (players[0].y >= 750 && players[1].y <= 750) {
        stageoffset["y"] = -544 + (750 - players[1].y);
        if (stageoffset["y"] > -300) stageoffset["y"] = -300;
    } else if (players[0].y < 750 && players[1].y < 750) {
        stageoffset["y"] = -544 - (players[0].y + players[1].y) / 2 - 984;
    } else {
        stageoffset["y"] = -544;
    }
}
