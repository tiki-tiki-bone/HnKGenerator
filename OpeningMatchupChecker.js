//描画コンテキストの取得

let animId;

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

const heartGrabTable = [
    3.6, 4.4, 5.2, 6, 3.6, 4.4, 5.2, 6, 6.8, 7.6, 8.4, 9.2, 10, 10.8, 11.6, 12.4, 13.2, 14, 14.8,
    15.6, 16.4, 17.2, 18, 18.8, 16.072, 13.179, 10.8068, 8.8616, 7.2665, 5.9585, 4.886, 4.0065,
    3.2853, 2.694, 2.209, 1.8114, 1.4854, 1.218, 0.9987, 0.819, 0.6715, 0.5507, 0.4515, 0.3702,
    0.3036, 0.249, 0.2041, 0.1674, 0.1373, 0.1125, 0.0923, 0.0757, 0.062, 0.0508, 0.0417, 0.0342,
    0.028, 0.023, 0.0189, 0.0154, 0.0126, 0.0104, 0.0085, 0.007, 0.0057, 0.0047, 0.0038,
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
    to_bj: "バックジャンプ移行",
    to_bj_g: "バックジャンプ移行",
    bj: "バックジャンプ",
    bj_fall: "バックジャンプ",
    bj_g_0: "バックジャンプガード",
    bj_g_1: "バックジャンプガード",
    to_vj: "垂直ジャンプ移行",
    to_vj_g: "垂直ジャンプ移行",
    vj: "垂直ジャンプ",
    vj_fall: "垂直ジャンプ",
    vj_g_0: "垂直ジャンプガード",
    vj_g_1: "垂直ジャンプガード",
    to_fj: "前ジャンプ移行",
    to_fj_g: "前ジャンプ移行",
    fj: "前ジャンプ",
    fj_fall: "前ジャンプ",
    fj_g_0: "前ジャンプガード",
    fj_g_1: "前ジャンプガード",
    land: "着地",
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
    "6b_1": "6B",
    "6b_2": "6B",
    "6c": "6C",
    "6d": "6D",
    ab: "ヘヴィー",
    ac: "グレ",
    bd: "掴み投げ",
    bd_1: "掴み投げ",
    bd_2: "掴み投げ",
    bd_3: "掴み投げ",
    cd_0: "バニ",
    cd_1: "バニ",
    cd_2: "溜めバニ",
    cd_3: "溜めバニ",
    cd_4: "溜めバニ",
    e: "ブースト",
    provoke: "挑発",
};

function drawCharStateTextLines() {
    const font =
        "18px system-ui, -apple-system, 'Meiryo', 'Hiragino Kaku Gothic ProN', 'Segoe UI', Arial, sans-serif";
    const baseX = [10, 630];
    const baseY = [30, 30];
    const align = ["left", "right"];
    for (let pIdx = 0; pIdx < 2; pIdx++) {
        context.font = font;
        context.textAlign = align[pIdx];
        context.lineWidth = 2;
        textlines[pIdx].forEach((text, i) => {
            let y = baseY[pIdx] + i * 30;
            context.strokeText(text, baseX[pIdx], y);
            context.fillText(text, baseX[pIdx], y);
        });
        textlines[pIdx].length = 0;
    }
}

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
        img: [],
        offsetGlobal: { x: 0, y: 0 },
        heartGrabNo: -1,
        heartGrabV: 0,
        armorLow: false, // 下段アーマー
        armorHigh: false, // 中上段アーマー
        selectedStateNo: "stand",
        whiffedStateNo: null, // 空振り技記録
        startFrame: 0,
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
        img: [],
        offsetGlobal: { x: 0, y: 0 },
        heartGrabNo: -1,
        heartGrabV: 0,
        armorLow: false, // 下段アーマー
        armorHigh: false, // 中上段アーマー
        selectedStateNo: "stand",
        whiffedStateNo: null, // 空振り技記録
        startFrame: 0,
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
var pauseFrames = 0;
var isRunning = false;
var prevTimeStamp = -1;
let textlines = [[], []];

window.onload = async function () {
    canvas = document.getElementById("checker");
    // 高DPI対応
    const dpr = window.devicePixelRatio;
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
    await reset();
};

// キャラ・技・アーマー・空振り等の出力行を配列に追加する関数
function addCharStateTextLine({
    pIdx,
    stateNo = null,
    whiffedStateNo = null,
    boostNo = null,
    startFrame = 0,
    extraText = null,
}) {
    let stateText;
    // 空振り系はwhiffedStateNo優先
    if (whiffedStateNo !== undefined && whiffedStateNo !== null) {
        stateText = stateNames[whiffedStateNo];
    } else if (stateNo !== undefined && stateNo !== null) {
        stateText = stateNames[stateNo];
    } else {
        stateText = "";
    }
    // ブースト判定
    if (
        boostNo >= 0 &&
        !(
            stateText == "stand" ||
            stateText == "walk_0" ||
            stateText == "walk_1" ||
            stateText == "crouch" ||
            stateText.includes("2g") ||
            stateText.includes("5g") ||
            stateText == "e" ||
            stateText.includes("j") ||
            players[pIdx].char == 8 ||
            stateText == "6c" ||
            stateText == ""
        )
    ) {
        stateText = "ブー" + stateText;
    }
    if (startFrame > 0) {
        stateText = startFrame + "F遅らせ" + stateText;
    }

    if (
        players[pIdx].stateNo.includes("g") &&
        whiffedStateNo !== undefined &&
        whiffedStateNo !== null &&
        !(players[pIdx].stateNo.includes("g_0") & (players[pIdx].timeNo == 0))
    ) {
        stateText += players[pIdx].stateNo == "land" ? "空振り" : "" + "後ガード";
    }

    // 1P/2Pごとにシンプルな配列でpush
    const lines = [];
    lines.push(charNames[players[pIdx].char]);
    lines.push(stateText);
    if (extraText) {
        if (Array.isArray(extraText)) {
            extraText.forEach((t) => lines.push(t));
        } else {
            lines.push(extraText);
        }
    }
    lines.push("デバッグ用 " + (players[pIdx].timeNo + 1) + "F目");
    lines.push("デバッグ用 " + players[pIdx].stateNo);
    lines.push("デバッグ用 " + players[pIdx].x);
    lines.push("デバッグ用 " + players[pIdx].y);
    textlines[pIdx] = textlines[pIdx].concat(lines);
}

function drawImages() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(stageImg, stageoffset["x"], stageoffset["y"]);

    // 共通化: 2キャラ分ループ
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
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

        if (
            (!(p.char == 8 && p.stateNo.includes("bd")) && p.timeNo == 0) ||
            (p.char == 0 && p.stateNo == "6b" && p.timeNo == 38)
        ) {
            p.armorHigh = false;
            p.armorLow = false;
            p.armorBlockedAttackIds = [];
        }

        // アーマー付与時にarmorBlockedAttackIdsをリセット
        if (p.char == 0 && p.stateNo == "6b" && p.timeNo == 0) {
            p.armorHigh = true;
            p.armorBlockedAttackIds = [];
        } else if (p.char == 8 && (p.stateNo == "bd" || p.stateNo == "2d") && p.timeNo == 0) {
            p.armorHigh = true;
            p.armorLow = true;
            p.armorBlockedAttackIds = [];
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
        //context.fillRect(x1, y1, x2 - x1, y2 - y1);
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
        context.font =
            "bold 8px system-ui, -apple-system, 'Meiryo', 'Hiragino Kaku Gothic ProN', 'Segoe UI', Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.fillText(idx === 0 ? "P1" : "P2", cx, cy);
    }
}

async function loop(timestamp) {
    if (prevTimeStamp >= 0 && timestamp - prevTimeStamp < Math.floor((1 / 60.0) * 1000)) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
        return;
    }
    prevTimeStamp = timestamp;
    isRunning = true;
    for (let idx = 0; idx < 2; idx++) {
        const stateNo = players[idx].stateNo;
        if (
            stateNo === "stand" ||
            stateNo === "walk_0" ||
            stateNo === "walk_1" ||
            stateNo === "2g_0" ||
            stateNo === "2g_1" ||
            stateNo === "5g_0" ||
            stateNo === "5g_1" ||
            stateNo === "e" ||
            stateNo.includes("j") ||
            stateNo === "crouch"
        ) {
            players[idx]._motionEnded = true;
            idx === 0
                ? jQuery("#1P_M").attr("disabled", false)
                : jQuery("#2P_M").attr("disabled", false);
        } else {
            idx === 0
                ? jQuery("#1P_M").attr("disabled", true)
                : jQuery("#2P_M").attr("disabled", true);
        }
    }
    if (pauseFrames > 0) {
        pauseFrames--;
        if (isPaused != true) {
            animId = window.requestAnimationFrame((ts) => loop(ts));
        }
        return;
    }
    time += 1;
    await setUpPos();
    baseMoveVelSet();
    await posAddVel();
    cameraMove();
    drawImages();

    if (collisionCheck() != "") {
        collision = true;
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
        if (
            p.char == 8 &&
            p.stateNo.includes("bd") &&
            p.stateNo != "bd_3" &&
            Math.abs(players[0].x - players[1].x) <= 160
        ) {
            p.stateNo = "bd_3";
            await getDataFromJson(idx);
        }
        if (p.elemNo >= p.elem.length) {
            p.elemNo = 0;
            // 状態遷移
            if (p.stateNo.includes("to_") && p.stateNo.includes("_g")) {
                p.stateNo = p.stateNo.replace("to_", "");
                p.stateNo = p.stateNo.replace("_g", "_g_0");
                await getDataFromJson(idx);
            } else if (p.stateNo.includes("to_")) {
                p.stateNo = p.stateNo.replace("to_", "");
                await getDataFromJson(idx);
            } else if (p.stateNo == "vj") {
                p.stateNo = "vj_fall";
                await getDataFromJson(idx);
            } else if (p.stateNo == "bj") {
                p.stateNo = "bj_fall";
                await getDataFromJson(idx);
            } else if (p.stateNo == "fj") {
                p.stateNo = "fj_fall";
                await getDataFromJson(idx);
            } else if (p.stateNo == "cd_0") {
                p.stateNo = "cd_1";
                await getDataFromJson(idx);
            } else if (p.stateNo == "cd_2") {
                p.stateNo = "cd_3";
                await getDataFromJson(idx);
            } else if (p.stateNo == "cd_3") {
                p.stateNo = "cd_4";
                await getDataFromJson(idx);
            } else if (p.stateNo == "walk_0") {
                p.stateNo = "walk_1";
                await getDataFromJson(idx);
            } else if (p.stateNo.includes("g_0")) {
                p.stateNo = p.stateNo.replace("_0", "_1");
                await getDataFromJson(idx);
            } else if (p.char == 3 && p.stateNo == "6b") {
                p.stateNo = "6b_1";
                await getDataFromJson(idx);
            } else if (p.char == 3 && p.stateNo == "6b_1") {
                p.stateNo = "6b_2";
                await getDataFromJson(idx);
            } else if (
                p.char == 1 &&
                (p.stateNo == "5c" || p.stateNo == "2c" || p.stateNo == "2d")
            ) {
                p.stateNo = p.stateNo + "_1";
                await getDataFromJson(idx);
            } else if (p.char == 8 && (p.stateNo == "5c" || p.stateNo == "2c")) {
                p.stateNo = p.stateNo + "_1";
                await getDataFromJson(idx);
            } else if (p.char == 8 && p.stateNo == "bd") {
                p.stateNo = "bd_1";
                await getDataFromJson(idx);
            } else if (p.char == 8 && p.stateNo.includes("bd") && !p.stateNo.includes("_3")) {
                p.stateNo = p.stateNo.replace(/_(\d+)$/, function (_, n) {
                    return "_" + (parseInt(n, 10) + 1);
                });
                await getDataFromJson(idx);
            } else if (
                p.stateNo != "2a" &&
                p.stateNo != "2b" &&
                !p.stateNo.includes("2c") &&
                !p.stateNo.includes("2d") &&
                p.time != -1
            ) {
                p.whiffedStateNo = p.stateNo;
                p.stateNo = "5g_0";
                jQuery(idx === 0 ? "#1P_M" : "#2P_M").val("5g_0");
                await getDataFromJson(idx);
                p._motionEnded = true;
                if (textlines[idx].length >= 3) {
                    textlines[idx][2] = "ガード";
                }
            } else if (p.time != -1) {
                p.whiffedStateNo = p.stateNo;
                p.stateNo = "2g_0";
                jQuery(idx === 0 ? "#1P_M" : "#2P_M").val("2g_0");
                await getDataFromJson(idx);
                p._motionEnded = true;
                if (textlines[idx].length >= 3) {
                    textlines[idx][2] = "ガード";
                }
            }
        }
    }

    // 両方のキャラのモーションが終わったら
    if (players[0]._motionEnded && players[1]._motionEnded) {
        // どちらも空振り判定か？
        function isWhiffState(stateNo) {
            if (stateNo == null) return false;
            // 立ち、しゃがみ、各種ガード、ジャンプ、挑発は除外
            return !(
                stateNo == "stand" ||
                stateNo == "crouch" ||
                stateNo.includes("walk_") ||
                stateNo.includes("bj") ||
                stateNo.includes("vj") ||
                stateNo.includes("fj") ||
                stateNo.includes("2g") ||
                stateNo.includes("5g") ||
                stateNo == "e" ||
                stateNo == "land" ||
                stateNo == "provoke"
            );
        }
        if (isWhiffState(players[0].whiffedStateNo) || isWhiffState(players[1].whiffedStateNo)) {
            for (let idx = 0; idx < 2; idx++) {
                if (
                    players[idx].whiffedStateNo == null &&
                    isWhiffState(players[idx].whiffedStateNo)
                ) {
                    players[idx].whiffedStateNo = players[idx].stateNo;
                }
                addCharStateTextLine({
                    context,
                    pIdx: idx,
                    stateNo: players[idx].stateNo,
                    whiffedStateNo: players[idx].whiffedStateNo,
                    boostNo: players[idx].boostNo,
                    startFrame: players[idx].startFrame,
                    extraText: isWhiffState(players[idx].whiffedStateNo) ? "空振り" : null,
                });
            }

            players[0].stateNo = players[0].selectedStateNo;
            players[1].stateNo = players[1].selectedStateNo;
            jQuery("#1P_M").val(players[0].selectedStateNo);
            jQuery("#2P_M").val(players[1].selectedStateNo);
            await init({ keepStateNo: true, keepBoostCheckbox: true });
            stop();
        }
    }
    if (collision) {
        players[0].stateNo = players[0].selectedStateNo;
        players[1].stateNo = players[1].selectedStateNo;
        jQuery("#1P_M").val(players[0].selectedStateNo);
        jQuery("#2P_M").val(players[1].selectedStateNo);
        await init({ keepStateNo: true, keepBoostCheckbox: true });
        stop();
    }
    if (time >= 200) {
        await init({ keepStateNo: true, keepBoostCheckbox: true });
        stop();
    }

    if (isNext == true) {
        isNext = false;
        stop();
    }

    drawCharStateTextLines();

    if (isPaused != true) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
    }
    isRunning = false;
}

function setloadfunc(obj) {
    obj.onload = function () {
        imgCount++;
        // 2キャラ分+ブースト+ステージ
        let total = players[0].img.length + players[1].img.length + boostImgs.length + 1;
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
    isPaused = true;
}

function start() {
    if (isPaused == true && !isRunning) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
        isPaused = false;
    }
}

function next() {
    if (isPaused == true && !isRunning) {
        animId = window.requestAnimationFrame((ts) => loop(ts));
    }
    isNext = true;
}

async function setUpPos() {
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        // boost移動
        if (p.boostNo >= 0) {
            p.velocity.x = boostTable[p.boostNo];
            p.boostNo++;
            if (p.boostNo >= boostTable.length) {
                p.velocity.x = 0;
                p.boostNo = -1;
            }
            jQuery(idx === 0 ? "#p1boost" : "#p2boost").prop("checked", false);
        }
        // ブースト行動
        if (p.stateNo == "e") {
            p.velocity.x = rawBoostTable[p.timeNo];
        }

        // ハート様掴み投げ進行管理
        if (p.char == 8) {
            // 掴み投げ開始: bd_1かつtimeNo==2で開始
            if ((p.stateNo == "bd_1" || p.stateNo == "bd_2") && p.timeNo == 1) {
                p.heartGrabNo = 0;
                p.heartGrabV = 3.6;
            }
            // 掴み投げ以外のステートになったらリセット
            if (!p.stateNo.startsWith("bd_") || (p.stateNo == "bd_2" && p.timeNo == 0)) {
                p.heartGrabNo = -1;
                p.heartGrabV = 0;
            }

            // heartGrabNo進行中
            if (p.heartGrabNo >= 0) {
                await move(idx, p.heartGrabV, 0);
                if (!(p.stateNo == "bd_3" && p.timeNo > 0)) {
                    p.heartGrabV += 0.8;
                }
                if (p.stateNo == "bd_3") {
                    p.heartGrabV *= 0.82;
                }
                p.heartGrabNo++;
            }
        }

        // 通常行動
        for (let i = 0; i < (p.movement ? p.movement.length : 0); i++) {
            if (p.movement[i]["time"] == p.timeNo) {
                await move(idx, parseFloat(p.movement[i]["x"]), parseFloat(p.movement[i]["y"]));
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
        }
        if (p.timeNo == 1) {
            if (p.stateNo == "bj" || p.stateNo == "bj_g_0") {
                p.velocity.x = p.baseMove["back_jump_x"];
            } else if (p.stateNo == "fj" || p.stateNo == "fj_g_0") {
                p.velocity.x = p.baseMove["forward_jump_x"];
            } else if ((p.char == 2 || p.char == 7 || p.char == 9) && p.stateNo == "walk_1") {
                p.velocity.x = p.baseMove["forward_walk"];
            }
        }
        if (p.timeNo == 2) {
            if (p.stateNo == "walk_0") {
                p.velocity.x = p.baseMove["forward_walk"];
            }
        }
    }
}

async function posAddVel() {
    // 重力加算
    for (let idx = 0; idx < 2; idx++) {
        const p = players[idx];
        if (p.y < 984 || p.velocity.y < 0) {
            if (!(p.char == 3 && p.stateNo.includes("6b"))) {
                p.velocity.y += 1.1;
            }
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
            await move(0, 0, players[0].velocity.y);
            await move(1, 0, players[1].velocity.y);
            let dx =
                players[0].x +
                players[0].push.current.x2 * players[0].facing -
                players[1].x -
                players[1].push.current.x2 * players[1].facing;
            if (players[0].push.current == players[0].push.air) {
                await move(0, -dx, 0);
            } else {
                await move(1, -dx, 0);
            }
        } else {
            await move(
                0,
                (players[0].velocity.x - players[1].velocity.x) / 2,
                players[0].velocity.y,
            );
            await move(
                1,
                (players[1].velocity.x - players[0].velocity.x) / 2,
                players[1].velocity.y,
            );
            let dx =
                (players[0].x +
                    players[0].push.current.x2 * players[0].facing -
                    players[1].x -
                    players[1].push.current.x2 * players[1].facing) /
                2;
            await move(0, -dx, 0);
            await move(1, -dx, 0);
        }
    } else {
        await move(0, players[0].velocity.x, players[0].velocity.y);
        await move(1, players[1].velocity.x, players[1].velocity.y);
    }
}

async function setChar(idx, charId) {
    players[idx].char = charId;
    await init({ keepStateNo: true, keepBoostCheckbox: true });
    for (let i = 0; i < players[idx].img.length; i++) {
        await setState(idx, players[idx].stateNo);
    }
    //drawImages();
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
        stateNo.includes("j") ||
        players[idx].char == 8 ||
        stateNo == "6c"
    ) {
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").prop("checked", false);
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").attr("disabled", true);
        players[idx].boostNo = -1;
    } else {
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").attr("disabled", false);
    }
}

async function setState(idx, stateNo) {
    stop();
    players[idx].whiffedStateNo = null;
    // 技を出し始めたフレームを記憶
    players[idx].startFrame = time;
    players[idx].stateNo = stateNo;
    if (players[idx].boostNo >= 0) {
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").prop("checked", true);
        setBoost(idx, true);
    } else {
        players[idx].boostNo = -1; // ブースト解除
        jQuery(idx === 0 ? "#p1boost" : "#p2boost").prop("checked", false);
    }
    players[idx].selectedStateNo = stateNo;
    SetBoostCheckboxEnabled(idx);
    await getDataFromJson(idx);
    if (players[idx].boostNo == -1) {
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
async function move(idx, x, y) {
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
            await getDataFromJson(idx);
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

async function init(options = {}) {
    // options: { keepStateNo: true, keepBoostCheckbox: true }
    const initVals = [
        { x: 480.0, pm: "#1P_M", pb: "#p1boost" },
        { x: 800.0, pm: "#2P_M", pb: "#p2boost" },
    ];
    for (let idx = 0; idx < 2; idx++) {
        players[idx].x = initVals[idx].x;
        players[idx].y = 984.0;
        players[idx].velocity.x = 0.0;
        players[idx].velocity.y = 0.0;
        jQuery(initVals[idx].pm).attr("disabled", false);
        // stateNoは必ずプルダウンの値で初期化（途中stateNoを記憶しない）
        if (options.keepStateNo && players[idx].startFrame == 0) {
            await setState(idx, jQuery(initVals[idx].pm).val());
        } else {
            await setState(idx, "stand");
            jQuery(initVals[idx].pm).val("stand");
        }
        players[idx].startFrame = 0;
        players[idx]._motionEnded = false;
        SetBoostCheckboxEnabled(idx);
        if (options.keepBoostCheckbox && players[idx].boostNo >= 0) {
            jQuery(initVals[idx].pb).prop("checked", true);
            setBoost(idx, true);
        } else {
            players[idx].boostNo = -1;
        }
        // armorBlockedAttackIdsもリセット
        players[idx].armorBlockedAttackIds = [];
    }
    time = 0;
    await loadImage();
    cameraMove();
    collision = false;
}

async function reset() {
    await init();
    drawImages();
}

function collisionCheck() {
    let hit = [false, false];
    let clash = false;
    let hitboxR = [[], []];
    let hitboxB = [[], []];
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.font =
        "18px system-ui, -apple-system, 'Meiryo', 'Hiragino Kaku Gothic ProN', 'Segoe UI', Arial, sans-serif";

    // --- アーマーで防いだ攻撃ID記録用 ---
    // 各プレイヤーに armorBlockedAttackIds を初期化（攻撃側で管理するため防御側は不要）
    for (let idx = 0; idx < 2; idx++) {
        if (!players[idx].armorBlockedAttackIds) {
            players[idx].armorBlockedAttackIds = [];
        }
    }

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
    let is2POnly = false;
    if (clash) {
        if (
            players[1].level[players[1].elemNo] - 3 >= players[0].level[players[0].elemNo] &&
            players[1].y >= 984
        ) {
            clash = false;
            is2POnly = true;
        } else if (players[0].level[players[0].elemNo] - 3 >= players[1].level[players[1].elemNo]) {
            is2POnly = true;
        }
        if (
            players[0].stateNo == "bd" ||
            players[1].stateNo == "bd" ||
            players[0].stateNo == "6c" ||
            players[1].stateNo == "6c"
        ) {
            clash = false;
        }
    }
    function checkHit(attackerIdx, defenderIdx, hitboxR, hitboxB) {
        for (let i = 0; i < hitboxR[attackerIdx].length; i++) {
            let mx1 =
                players[attackerIdx].x + hitboxR[attackerIdx][i].x * players[attackerIdx].facing;
            let my1 = players[attackerIdx].y + hitboxR[attackerIdx][i].y;
            let mx2 = mx1 + hitboxR[attackerIdx][i].w * players[attackerIdx].facing;
            let my2 = my1 + hitboxR[attackerIdx][i].h;
            if (mx1 > mx2) [mx1, mx2] = [mx2, mx1];
            for (let j = 0; j < hitboxB[defenderIdx].length; j++) {
                let ex1 =
                    players[defenderIdx].x +
                    hitboxB[defenderIdx][j].x * players[defenderIdx].facing;
                let ey1 = players[defenderIdx].y + hitboxB[defenderIdx][j].y;
                let ex2 = ex1 + hitboxB[defenderIdx][j].w * players[defenderIdx].facing;
                let ey2 = ey1 + hitboxB[defenderIdx][j].h;
                if (ex1 > ex2) [ex1, ex2] = [ex2, ex1];
                if (mx1 < ex2 && ex1 < mx2 && my1 < ey2 && ey1 < my2) {
                    const isArmorBreak =
                        players[attackerIdx].stateNo.includes("bd") ||
                        players[attackerIdx].stateNo == "ab";
                    if (!(isArmorBreak && players[defenderIdx].y < 984)) {
                        // 攻撃属性判定: 下段かどうか
                        let isLow = false;
                        // 下段判定: 2a, 2b, 2c, 2d, 2c_1, 2d_1 など
                        const state = players[attackerIdx].stateNo;
                        if (
                            state == "2b" ||
                            (state == "2d" &&
                                players[attackerIdx].char != 2 &&
                                players[attackerIdx].char != 8) ||
                            (state == "5d" && players[attackerIdx].char == 4)
                        ) {
                            isLow = true;
                        }

                        // 攻撃ID生成: stateNo + elemNo で一意とする
                        const attackId =
                            players[attackerIdx].stateNo + ":" + players[attackerIdx].elemNo;

                        // 既にアーマーで防いだ攻撃IDなら無効（攻撃側で管理）
                        if (players[attackerIdx].armorBlockedAttackIds.includes(attackId)) {
                            continue;
                        }
                        let x = defenderIdx === 0 ? 10 : 630;
                        const aligns = ["left", "right"];

                        // アーマー判定: 下段はarmorLow、その他はarmorHigh
                        if (isLow && players[defenderIdx].armorLow && !isArmorBreak) {
                            players[defenderIdx].armorLow = false;
                            players[defenderIdx].armorHigh = false;
                            if (!isPaused) {
                                pauseFrames = 30;
                            }
                            // この攻撃IDを記録（攻撃側で管理）
                            players[attackerIdx].armorBlockedAttackIds.push(attackId);
                            addCharStateTextLine({
                                context,
                                pIdx: defenderIdx,
                                stateNo: players[defenderIdx].stateNo,
                                extraText: "下段アーマー",
                            });
                            continue; // このヒットは無効
                        } else if (!isLow && players[defenderIdx].armorHigh && !isArmorBreak) {
                            players[defenderIdx].armorHigh = false;
                            players[defenderIdx].armorLow = false;
                            // この攻撃IDを記録（攻撃側で管理）
                            if (!isPaused) {
                                pauseFrames = 30;
                            }
                            players[attackerIdx].armorBlockedAttackIds.push(attackId);
                            addCharStateTextLine({
                                context,
                                pIdx: defenderIdx,
                                stateNo: players[defenderIdx].stateNo,
                                extraText: "中上段アーマー",
                            });
                            continue; // このヒットは無効
                        }
                        hit[attackerIdx] = true;
                    }
                    if (
                        players[attackerIdx].stateNo == "bd" &&
                        players[defenderIdx].push.current != players[defenderIdx].push.stand
                    ) {
                        hit[attackerIdx] = false;
                    }
                }
            }
        }
    }
    checkHit(0, 1, hitboxR, hitboxB); // P1→P2
    checkHit(1, 0, hitboxR, hitboxB); // P2→P1

    if (
        (clash &&
            players[0].char == 9 &&
            (players[0].stateNo == "5d" ||
                players[0].stateNo == "2d" ||
                players[0].stateNo == "6a") &&
            hit[1] == true) ||
        (clash &&
            players[1].char == 9 &&
            (players[1].stateNo == "5d" ||
                players[1].stateNo == "2d" ||
                players[1].stateNo == "6a") &&
            hit[2] == true)
    ) {
        clash = false;
    }

    if (time >= 0) {
        context.textAlign = "right";
        context.strokeText(`${time}F目`, 630, 460);
        context.fillText(`${time}F目`, 630, 460);
    }

    if (
        !clash &&
        hit[0] &&
        players[1].level[players[1].elemNo] - 3 >= players[0].level[players[0].elemNo]
    ) {
        hit[0] = false;
    }

    let marks = ["", ""];

    if (clash) {
        for (let i = 0; i < 2; i++) {
            marks[i] = "相殺";
            if (is2POnly) {
                marks[i] += i == 0 ? "(2P時◯)" : "(1P時×)";
            }
        }
    } else {
        // ◯×の判定
        marks = [
            hit[0] && !hit[1] ? "◯" : !hit[0] && hit[1] ? "×" : "",
            hit[1] && !hit[0] ? "◯" : hit[0] && !hit[1] ? "×" : "",
        ];
        // ×のとき、食らった側のstateNoにgが含まれていたら「ガード」
        for (let i = 0; i < 2; i++) {
            if (
                marks[i] === "×" &&
                players[i].stateNo &&
                players[i].stateNo.includes("g") &&
                !players[i].stateNo.includes("to_")
            ) {
                marks[i] = "ガード";
            }
            if (is2POnly) {
                marks[i] += i == 0 ? "(2P時相殺)" : "(1P時相殺)";
            }
        }
        if (hit[0] && hit[1]) {
            marks[0] = "相打ち（勝敗ランダム）";
            marks[1] = "相打ち（勝敗ランダム）";
        }
    }

    if (hit[0] || hit[1] || clash) {
        for (let idx = 0; idx < 2; idx++) {
            addCharStateTextLine({
                context,
                pIdx: idx,
                stateNo: players[idx].stateNo,
                whiffedStateNo: players[idx].whiffedStateNo,
                boostNo: players[idx].boostNo,
                startFrame: players[idx].startFrame,
                extraText: marks[idx],
            });
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
