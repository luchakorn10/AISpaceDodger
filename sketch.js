// --- 🔗 ใส่ Link Model ของคุณตรงนี้ ---
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/cPYXzacdHw/';

let video;
let flipVideo;
let label = "Center";
let classifier;

// ตัวแปรเกม
let playerX;
let playerSize = 50;
let enemies = [];
let score = 0;
let isGameOver = false;
let gameSpeed = 5;

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
    createCanvas(640, 480);

    // ตั้งค่ากล้อง
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    flipVideo = ml5.flipImage(video);

    classifyVideo();

    playerX = width / 2;
}

function classifyVideo() {
    flipVideo = ml5.flipImage(video);
    classifier.classify(flipVideo, gotResult);
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    label = results[0].label;
    classifyVideo();
}

function draw() {
    background(0); // อวกาศสีดำ

    // วาดวิดีโอเป็นพื้นหลัง (ทำให้จางลงหน่อย)
    tint(255, 100);
    image(flipVideo, 0, 0);
    noTint();

    if (!isGameOver) {
        playGame();
    } else {
        drawGameOver();
    }

    // โชว์คะแนน
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("Score: " + score, 10, 10);
}

function playGame() {
    // 1. การควบคุมยาน
    if (label === "Left") {
        playerX -= 8;
    } else if (label === "Right") {
        playerX += 8;
    }

    // ล็อกไม่ให้ยานออกนอกจอ
    playerX = constrain(playerX, 30, width - 30);

    // --- 🚀 ส่วนที่ 1: วาดตัวยานให้สวยงาม ---
    push(); // เริ่มตั้งค่าการวาดเฉพาะส่วนยาน
    translate(playerX, height - 60); // ย้ายจุดปากกาไปที่ตำแหน่งยาน

    // 1.1 วาดไฟท้ายยาน (ส้มๆ แดงๆ กระพริบได้)
    noStroke();
    fill(255, random(100, 200), 0); // สุ่มสีส้มเหลือง
    // วาดวงรีที่ยืดหดได้นิดหน่อยให้เหมือนไฟพุ่ง
    ellipse(0, 35, random(10, 20), random(20, 40));

    // 1.2 วาดปีกยาน (สีแดงเข้ม)
    fill(180, 0, 0);
    triangle(-35, 25, 35, 25, 0, -10);

    // 1.3 วาดตัวยานหลัก (สีขาว/เทา)
    fill(220);
    stroke(100);
    strokeWeight(2);
    // ใช้ triangle(x1, y1, x2, y2, x3, y3)
    triangle(-20, 25, 20, 25, 0, -45);

    // 1.4 วาดกระจกห้องนักบิน (สีฟ้า)
    fill(0, 200, 255);
    noStroke();
    ellipse(0, -15, 14, 25);
    pop(); // จบการตั้งค่าส่วนยาน
    // ------------------------------------

    // 3. สร้างอุกกาบาต
    if (frameCount % 40 == 0) {
        enemies.push(new Enemy());
    }

    // 4. จัดการอุกกาบาต
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        enemies[i].show();

        // เช็คชน! (เช็คระยะห่าง)
        if (enemies[i].hits(playerX, height - 60)) {
            isGameOver = true;
        }

        if (enemies[i].offscreen()) {
            enemies.splice(i, 1);
            score++;

            // ยิ่งคะแนนเยอะ เกมยิ่งเร็วขึ้น
            if (score % 5 == 0) {
                gameSpeed += 0.2;
            }
        }
    }
}

function drawGameOver() {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(50);
    text("GAME OVER", width / 2, height / 2);

    fill(255);
    textSize(30);
    text("Final Score: " + score, width / 2, height / 2 + 50);
    text("Press [SPACE] to Restart", width / 2, height / 2 + 100);
}

// --- Class อุกกาบาต ---
class Enemy {
    constructor() {
        this.x = random(20, width - 20);
        this.y = -50;
        this.r = random(40, 70); // ขนาดใหญ่ขึ้นหน่อย
        this.speed = random(3, 6) + (score * 0.1);
        // เพิ่มการหมุน (เก็บมุมเริ่มต้น)
        this.angle = random(TWO_PI);
        this.spinSpeed = random(-0.1, 0.1); // ความเร็วการหมุน
    }

    update() {
        this.y += this.speed;
        this.angle += this.spinSpeed; // หมุนไปเรื่อยๆ
    }

    show() {
        // --- ☄️ ส่วนที่ 2: วาดอุกกาบาตให้ดูมีมิติ ---
        push();
        translate(this.x, this.y); // ย้ายไปที่ตำแหน่งหิน
        rotate(this.angle); // หมุนหิน

        // 2.1 ตัวหิน (สีเทาเข้ม)
        fill(100);
        stroke(200);
        strokeWeight(1);
        ellipse(0, 0, this.r, this.r);

        // 2.2 หลุมบนหิน (วงกลมเล็กๆ สีเทาเข้มกว่า)
        noStroke();
        fill(70);
        // วาดหลุมกระจายๆ กัน
        ellipse(this.r * 0.2, this.r * 0.2, this.r * 0.3);
        ellipse(-this.r * 0.3, -this.r * 0.1, this.r * 0.25);
        ellipse(this.r * 0.1, -this.r * 0.3, this.r * 0.15);

        pop();
        // ----------------------------------------
    }

    hits(px, py) {
        let d = dist(px, py, this.x, this.y);
        return d < (this.r / 2) + 25; // เช็คการชน (ปรับระยะให้พอดีกับขนาดยานใหม่)
    }

    offscreen() {
        return this.y > height + 50;
    }
}

function keyPressed() {
    if (key === ' ' && isGameOver) {
        score = 0;
        enemies = [];
        isGameOver = false;
        playerX = width / 2;
        gameSpeed = 5;
    }
}