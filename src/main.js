// Set up Pixi.js type
let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

let app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x222222,
    antialias: true,
    transparent: false,
    resolution: 1,
});

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();
/**
 * Constants and Variables
 */
const centerPoint = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
};

const color1 = 0xDE3249;
const m1 = 15;
const l1 = 120;
let a1 = Math.PI / 2;
let a1_v = 0;
let a1_a = 0;

const color2 = 0x35CC5A;
const m2 = 15;
const l2 = 120;
let a2 = Math.PI / 2;
let a2_v = 0;
let a2_a = 0;

const trajectoryColor = 0x529DEB;

const g = 9.81;
const damper = 7;

/**
 * Rendering Components
 */
const line1Graphics = new PIXI.Graphics();
const line2Graphics = new PIXI.Graphics();
const ball1Graphics = new PIXI.Graphics();
const ball2Graphics = new PIXI.Graphics();
const trajectoryGraphics = new PIXI.Graphics();

app.stage.addChild(line1Graphics);
app.stage.addChild(line2Graphics);
app.stage.addChild(ball1Graphics);
app.stage.addChild(ball2Graphics);
app.stage.addChild(trajectoryGraphics);

const getPosition1FromAngle = () => {
    return {
        x: centerPoint.x + l1 * Math.sin(a1),
        y: centerPoint.y - (-l1 * Math.cos(a1)),
    };
};

const getPosition2FromAngle = () => {
    return {
        x: centerPoint.x + l1 * Math.sin(a1) + l2 * Math.sin(a2),
        y: centerPoint.y - (- l1 * Math.cos(a1) - l2 * Math.cos(a2)),
    };
};

const drawLine1 = () => {
    line1Graphics.clear();
    const position = getPosition1FromAngle();
    line1Graphics.lineStyle(3, color1, 1);
    line1Graphics.moveTo(centerPoint.x, centerPoint.y);
    line1Graphics.lineTo(position.x, position.y);
};

const drawLine2 = () => {
    line2Graphics.clear();
    const position1 = getPosition1FromAngle();
    const position2 = getPosition2FromAngle();
    line2Graphics.lineStyle(3, color2, 1);
    line2Graphics.moveTo(position1.x, position1.y);
    line2Graphics.lineTo(position2.x, position2.y);
};

const drawBall1 = () => {
    ball1Graphics.clear();
    const position = getPosition1FromAngle();
    ball1Graphics.lineStyle(0);
    ball1Graphics.beginFill(color1);
    ball1Graphics.drawCircle(position.x, position.y, m1);
    ball1Graphics.endFill();
};

const drawBall2 = () => {
    ball2Graphics.clear();
    const position = getPosition2FromAngle();
    ball2Graphics.lineStyle(0);
    ball2Graphics.beginFill(color2);
    ball2Graphics.drawCircle(position.x, position.y, m2);
    ball2Graphics.endFill();
};

const drawTrajectory = (oldPosition, newPosition) => {
    trajectoryGraphics.lineStyle(1, trajectoryColor, 1);
    trajectoryGraphics.moveTo(oldPosition.x, oldPosition.y);
    trajectoryGraphics.lineTo(newPosition.x, newPosition.y);
};

const drawPendulums = () => {
    drawLine1();
    drawLine2();
    drawBall1();
    drawBall2();
};

/**
 * Operational components
 */
const updateAcceleration1 = () => {
    const num1 = -g * (2 * m1 + m2) * Math.sin(a1);
    const num2 = m2 * g * Math.sin(a1 - 2*a2);
    const num3 = 2 * Math.sin(a1 - a2) * m2;
    const num4 = (a2_v * a2_v * l2) + (a1_v * a1_v * l1 * Math.cos(a1 - a2));
    const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
    a1_a = (num1 - num2 - num3 * num4) / den;
}

const updateAcceleration2 = () => {
    const num1 = 2 * Math.sin(a1 - a2);
    const num2 = a1_v * a1_v * l1 * (m1 + m2);
    const num3 = g * (m1 + m2) * Math.cos(a1);
    const num4 = a2_v * a2_v * l2 * m2 * Math.cos(a1 -a2);
    const den = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
    a2_a = (num1 * (num2 + num3 + num4)) / den;
}

/**
 * Main Procedure
 * TODO: figure out why this can some times spiral out of control and crash
 */
app.ticker.add(() => {
    const oldBall2Position = getPosition2FromAngle();

    // Update acceleration and add to velocity and angle
    updateAcceleration1();
    updateAcceleration2();
    const time = app.ticker.elapsedMS;
    a1_v += a1_a * time / 1000 * damper;
    a2_v += a2_a * time / 1000 * damper;
    a1 += a1_v * time / 1000 * damper;
    a2 += a2_v * time / 1000 * damper;

    drawPendulums();
    const newBall2Position = getPosition2FromAngle();
    drawTrajectory(oldBall2Position, newBall2Position);
});
