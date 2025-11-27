// Arquivo: script/GameObject.js
class GameObject {
    constructor(x, y, width, height, imagePath) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isAlive = true; 

        this.img = new Image();
        this.img.src = imagePath;
        this.isReady = false; 
        
        this.img.onload = () => {
            this.isReady = true;
        };
    }

    draw(ctx) {
        if (this.isReady) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
    update(deltaTime) {} 
}