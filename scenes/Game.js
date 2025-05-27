// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
  }

  preload() {
    this.load.tilemapTiledJSON("laberinto", "public/assets/tilemap/LABERINTO FINAL.json");
    this.load.image("tileset", "public/assets/texture.png");
    this.load.spritesheet("eli", "public/assets/eli.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const map = this.make.tilemap({ key: "laberinto" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("assets laberinto", "tileset");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createLayer("fondo", tileset, 0, 0);
    const platformLayer = map.createLayer("laberinto", tileset, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");

    // Find in the Object Layer, the name "dude" and get position
    const spawnPoint = map.findObject(
      "jugador",
      (obj) => obj.name === "elias"
    );
    console.log("spawnPoint", spawnPoint);

    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "eli");
    

    this.anims.create({
      key: "left",
      frames: [{ key: "eli", frame: 2 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "eli", frame: 0 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: [{ key: "eli", frame: 1 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "up",
      frames: [{ key: "eli", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "down",
      frames: [{ key: "eli", frame: 3 }],
      frameRate: 20,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    platformLayer.setCollisionByExclusion([-1]); // Exclude tiles with -1 index (no collision)
    this.physics.add.collider(this.player, platformLayer);

    // camaras
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    // tiles marked as colliding
    /*
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    platformLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    });
    */

    /* Create empty group of starts
    this.stars = this.physics.add.group();

    // find object layer
    // if type is "stars", add to stars group
    objectsLayer.objects.forEach((objData) => {
      console.log(objData);
      const { x = 0, y = 0, name, type } = objData;
      switch (type) {
        case "star": {
          // add star to scene
          // console.log("estrella agregada: ", x, y);
          const star = this.stars.create(x, y, "star");
          star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          break;
        }
      }
    });

    // add collision between player and stars
    this.physics.add.collider(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
    // add overlap between stars and platform layer
    this.physics.add.collider(this.stars, platformLayer);

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });
    */
  }

update() {
  // Resetear velocidades
  this.player.setVelocity(0);

  // Movimiento horizontal
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-160);
    this.player.anims.play("left", true);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(160);
    this.player.anims.play("right", true);
  }

  // Movimiento vertical
  if (this.cursors.up.isDown) {
    this.player.setVelocityY(-160);
    this.player.anims.play("up", true);
  } else if (this.cursors.down.isDown) {
    this.player.setVelocityY(160);
    this.player.anims.play("down", true);
  }

  // Si no se está moviendo en ninguna dirección, reproducir animación estática
  if (
    !this.cursors.left.isDown &&
    !this.cursors.right.isDown &&
    !this.cursors.up.isDown &&
    !this.cursors.down.isDown
  ) {
    this.player.anims.play("turn");
  }

    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      console.log("Phaser.Input.Keyboard.JustDown(this.keyR)");
      this.scene.restart();
    }
  }
  /*
  collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });
      
    }
  }
  */
}
