(function () {
    let gameOver = false;
    /**
     * 地图图层
    */
    const bgCanvas = document.querySelector('#bgCanvas');
    const bgCtx = bgCanvas.getContext('2d');
    let bgCanvasW = bgCanvas.width;
    let bgCanvasH = bgCanvas.height;
    let imgBg = new Image();
    imgBg.src = './images/bg.png';
    imgBg.onload = () => {
        bgCtx.drawImage(imgBg, 0, 0, bgCanvasW, bgCanvasH)
    }

    /**
     * 主角图层
    */
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    let canvasW = canvas.width;
    let canvasH = canvas.height;
    let personW = 80;   // 主角的宽度
    let personH = 80;   // 主角的高度
    let personX = canvasW / 2 - personW / 2;  // 主角的X点
    let personY = canvasH / 2 - personH / 2;  // 主角的Y点
    let zSpeed = 3;    // 主角的速度
    let quadrant = 0;   // 角色在第几象限移动
    let animationhandler = null;  // 动画
    let imgPerson = new Image();
    imgPerson.src = './images/person.png';
    imgPerson.onload = () => {
        ctx.drawImage(imgPerson, personX, personY, personW, personH)
    }

    canvas.onclick = (e) => {
        let dx = e.pageX - canvas.getBoundingClientRect().left
        let dy = e.pageY - canvas.getBoundingClientRect().top
        if (dx > canvasW - personW) {
            dx = canvasW - personW / 2;
        } else if (dx <= personW) {
            dx = personW - personW / 2;
        }

        if (dy > canvasH - personH) {
            dy = canvasH - personH / 2;
        } else if (dy <= personH) {
            dy = personH - personH / 2;
        }

        moveMouse(personX, personY, dx - personW / 2, dy - personH / 2)
    }

    // 主角移动
    function moveMouse(startX, startY, endX, endY) {

        window.cancelAnimationFrame(animationhandler);
        // 如果点击的位置和主角的位置一样的话，不变
        if (endX === personX && endY === personY) {
            return;
        }

        const distanceLen = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const allTimes = distanceLen / zSpeed;
        const xSpeed = (endX - startX) / allTimes;
        const ySpeed = (endY - startY) / allTimes;
        // 第一象限
        if (endX <= startX && endY <= startY) {
            quadrant = 1
            // 第二象限
        } else if (endX >= startX && endY <= startY) {
            quadrant = 2
            // 第三象限
        } else if (endX >= startX && endY >= startY) {
            quadrant = 3
            // 第四象限
        } else if (endX <= startX && endY >= startY) {
            quadrant = 4
        }

        animationhandler = window.requestAnimationFrame(timeMove)

        // 根据quadrant判断在第几象限移动，在根据第几象限的判定决定是否继续移动
        function timeMove() {
            if (gameOver) {
                window.cancelAnimationFrame(animationhandler);
                return;
            }

            if (quadrant === 1) {
                if ((startX <= endX && startY <= endY)) {
                    window.cancelAnimationFrame(animationhandler);
                    return;
                }
                if (startX > endX) {
                    startX = (startX + xSpeed) <= endX ? endX : (startX + xSpeed);
                    personX = startX;
                }
                if (startY > endY) {
                    startY = (startY + ySpeed) <= endY ? endY : (startY + ySpeed);
                    personY = startY;
                }
            } else if (quadrant === 2) {
                if ((startX >= endX && startY <= endY)) {
                    window.cancelAnimationFrame(animationhandler);
                    return;
                }
                if (startX < endX) {
                    startX = (startX + xSpeed) >= endX ? endX : (startX + xSpeed);
                    personX = startX;
                }
                if (startY > endY) {
                    startY = (startY + ySpeed) <= endY ? endY : (startY + ySpeed);
                    personY = startY;
                }
            } else if (quadrant === 3) {
                if ((startX >= endX && startY >= endY)) {
                    window.cancelAnimationFrame(animationhandler);
                    return;
                }
                if (startX < endX) {
                    startX = (startX + xSpeed) >= endX ? endX : (startX + xSpeed);
                    personX = startX;
                }
                if (startY < endY) {
                    startY = (startY + ySpeed) >= endY ? endY : (startY + ySpeed);
                    personY = startY;
                }
            }
            else if (quadrant === 4) {
                if ((startX <= endX && startY >= endY)) {
                    window.cancelAnimationFrame(animationhandler);
                    return;
                }
                if (startX > endX) {
                    startX = (startX + xSpeed) <= endX ? endX : (startX + xSpeed);
                    personX = startX;
                }
                if (startY < endY) {
                    startY = (startY + ySpeed) >= endY ? endY : (startY + ySpeed);
                    personY = startY;
                }
            }

            ctx.clearRect(0, 0, canvasW, canvasH)
            ctx.drawImage(imgPerson, startX, startY, personW, personH)
            animationhandler = window.requestAnimationFrame(timeMove)
        }
    }


    /**
     * 子弹图层
     */
    const bulletCanvas = document.querySelector('#bulletCanvas');
    const bulletCtx = bulletCanvas.getContext('2d');
    let bulletCanvasW = bulletCanvas.width;
    let bulletCanvasH = bulletCanvas.height;
    let bulletW = 50;   // 子弹的宽度
    let bulletH = 50;   // 子弹的高度 
    let minSpeed = 1;
    let maxSpeed = 2;
    let bulletArr = [];
    let max = 5;

    class Bullet {
        constructor(bulletCanvasW, bulletCanvasH, bulletW, bulletH, minSpeed, maxSpeed, max) {
            this.bulletCanvasW = bulletCanvasW;
            this.bulletCanvasH = bulletCanvasH;
            this.bulletW = bulletW;
            this.bulletH = bulletH;
            this.minSpeed = minSpeed;
            this.maxSpeed = maxSpeed;
            this.max = max;
            this.bulletObj = {}
            this.animationBullet = null;
            this.init()
        }
        init() {
            for (let i = 0; i < this.max; i++) {
                this.newBullet();
            }
            window.cancelAnimationFrame(this.animationBullet)
            const allBulletMove = () => {
                // 判断游戏是否结束
                if (gameOver) {
                    window.cancelAnimationFrame(this.animationBullet);
                    return;
                }
                bulletCtx.clearRect(0, 0, this.bulletCanvasW, this.bulletCanvasH)
                // 如果没有子弹就不再遍历
                let keys = Object.keys(this.bulletObj);
                if (keys.length < 1) {
                    window.cancelAnimationFrame(this.animationBullet)
                    return;
                }
                for (let key in this.bulletObj) {
                    let item = this.bulletObj[key];
                    item.bulletX += item.bulletXSpeed;
                    item.bulletY += item.bulletYSpeed;
                    this.isHit(item);
                    this.move(key, item.bulletImg, item.bulletX, item.bulletY, item.bulletXSpeed, item.bulletYSpeed)
                }

                this.animationBullet = window.requestAnimationFrame(allBulletMove)
            }
            window.requestAnimationFrame(allBulletMove)

        }
        //  碰撞检测
        isHit(item) {
            let bulletCenterX = item.bulletX + this.bulletW / 2;
            let bulletCenterY = item.bulletY + this.bulletH / 2;
            let personCenterX = personX + personW / 2;
            let personCenterY = personY + personH / 2;
            // 碰撞检测
            if (Math.abs(personCenterX - bulletCenterX) <= (Math.abs(this.bulletW + personW) / 2) && Math.abs(personCenterY - bulletCenterY) <= (Math.abs(this.bulletH + personH) / 2)) {
                gameOver = true;
                return;
            }
        }
        // 子弹移动
        move(bulletId, bulletImg, bulletX, bulletY) {
            if (bulletX < 0 || bulletX > this.bulletCanvasW || bulletY < -this.bulletH || bulletY > this.bulletCanvasH) {
                delete this.bulletObj[bulletId]
                this.newBullet()
                return;
            }
            bulletCtx.drawImage(bulletImg, bulletX, bulletY, this.bulletW, this.bulletH)
        }
        // 子弹的属性
        newBullet() {
            let bulletY = -this.bulletH;
            let bulletX = this.randomeNum(this.bulletW, this.bulletCanvasW);
            let bulletXSpeed = this.randomeNum(-3, this.maxSpeed);
            let bulletYSpeed = this.randomeNum(this.minSpeed, this.maxSpeed);
            let bulletId = this.randomeNum(new Date().getTime(), new Date().getTime() * 2)
            let bulletImg = new Image();   // 创建img元素
            bulletImg.src = './images/bullet.png'
            this.bulletObj[bulletId] = {
                bulletX,
                bulletY,
                bulletXSpeed,
                bulletYSpeed,
                bulletImg
            }
        }
        randomeNum(minNum, maxNum) {
            return Math.random() * (maxNum - minNum) + minNum
        }
    }
    new Bullet(bulletCanvasW, bulletCanvasH, bulletW, bulletH, minSpeed, maxSpeed, max)



})()