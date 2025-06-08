// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
  this.troncosRecolectados = 0;
  this.puntaje = 0;
  this.totalTroncos = 8; // fijo
  }

  preload() {
    this.load.tilemapTiledJSON("laberinto", "public/assets/tilemap/LABERINTO FINAL.json");
    this.load.image("tileset", "public/assets/texture.png");
    this.load.spritesheet("eli", "public/assets/eli.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("bandera", "public/assets/bandera.png");
    this.load.image("tronco", "public/assets/tronco.png");
  }

  create(data) {
    const map = this.make.tilemap({ key: "laberinto" });

  // Leer cuántas veces ganó, o iniciar en 0 si es la primera vez
  this.victorias = this.registry.get("victorias") || 0;

  // Lista de posiciones para respawn según cantidad de victorias
  const posiciones = [
    { x: 34, y: 78 },     // Posición inicial por defecto
    { x: 928, y: 366 },     // Primer reinicio
    { x: 352, y: 756 },     // Segundo reinicio
  ];

  // Elegir posición según cantidad de victorias
  const pos = posiciones[this.victorias % posiciones.length];

   const tileset = map.addTilesetImage("assets laberinto", "tileset");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createLayer("fondo", tileset, 0, 0);
    const platformLayer = map.createLayer("laberinto", tileset, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");

  // Crear al jugador en esa posición
    this.player = this.physics.add.sprite(pos.x, pos.y, "eli");

  // Resetear variables si hace falta
  this.troncosRecolectados = 0;
  this.puntaje = this.registry.get("puntaje") || 0;

  //texto ganaste o te faltan troncos
  this.mensajeTexto = this.add.text(
  this.cameras.main.centerX, 
  this.cameras.main.centerY, 
  '', 
  {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 },
    align: 'center'
  }
).setOrigin(0.5).setScrollFactor(0).setDepth(10); // Centrado, fijo y al frente
this.mensajeTexto.setVisible(false);



    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
  

    // Find in the Object Layer, the name "dude" and get position
    //spawn bandera
    const spawnBandera = map.findObject( 
      "meta",
      (obj) => obj.name === "meta" && obj.properties?.some(p => p.name === "tocable" && p.value)
    );
    this.bandera = this.physics.add.sprite(spawnBandera.x, spawnBandera.y, "bandera");

    // spawn troncos
    const troncos = map.filterObjects("tronco", (obj) => obj.name === "tronco");

    this.troncos = this.physics.add.group();

    troncos.forEach((obj) => {
      const tronco = this.physics.add.sprite(obj.x, obj.y, "tronco");
      this.troncos.add(tronco);
      });
    
      //recolectar troncos

   this.physics.add.overlap(this.player, this.troncos, (player, tronco) => {
  tronco.destroy();

  this.troncosRecolectados++;
  this.puntaje += 100;

  console.log(`Troncos: ${this.troncosRecolectados}/8`);
  console.log(`Puntos: ${this.puntaje}`);

  if (this.troncosRecolectados === 8) {
    console.log("¡Recolectaste todos los troncos!");
  
  }
});

// texto de puntos y troncos
this.uiText = this.add.text(10, 10, '', {
  fontSize: '14px',
  //color rojo
  fill: '#ff0000',
  fontFamily: 'Arial',
}).setScrollFactor(0);

this.uiText.setText(`Troncos: 0/8 | Puntos: 0`);

//colision meta y win
this.physics.add.overlap(this.player, this.bandera, () => {
  if (this.troncosRecolectados === 8) {
    this.mostrarMensaje("¡Ganaste!", 1500);
    
    // Guardar datos y avanzar
    this.registry.set("puntaje", this.puntaje);
    this.registry.set("victorias", (this.registry.get("victorias") || 0) + 1);

    // Esperar 1.5s antes de pasar de escena
    this.time.delayedCall(1500, () => {
      this.scene.start("game"); // Reinicia la escena desde otra posición
    });

  } else {
    this.mostrarMensaje("Te faltan troncos", 1000);
  }
});



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
    
    this.uiText.setText(`Troncos: ${this.troncosRecolectados}/8 | Puntos: ${this.puntaje}`);
  }
  
  mostrarMensaje(texto, duracion = 1000) {
  this.mensajeTexto.setText(texto);
  this.mensajeTexto.setVisible(true);

  this.time.delayedCall(duracion, () => {
    this.mensajeTexto.setVisible(false);
  });
}

}
