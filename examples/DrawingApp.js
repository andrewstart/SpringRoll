(function(){
		
	// Import library dependencies
	var Texture = PIXI.Texture,
		Sprite = PIXI.Sprite,
		Point = PIXI.Point,
		Application = cloudkid.Application;
	
	var DrawingApp = function(options)
	{
		Application.call(this, options);
	};
	
	var pixiStage;
	var createjsStage;
	var sprite;
	var texture;
	
	// Private mouse down variable
	var isMouseDown;

	// Private current shape
	var currentPixiShape;
	var currentCJSShape;

	// Number variables needed
	var oldMidX, oldMidY, oldX, oldY;
	
	var direction = 1;
	var speed = 5;
	var pixiClearButton;
	var createjsClearButton;
	var pixiSwapButton;
	var createjsSwapButton;
	
	// Extend the createjs container
	var p = DrawingApp.prototype = Object.create(Application.prototype);
	
	p.init = function()
	{
		Debug.log("DrawingApp is ready to use.");

		this.addDisplay("pixiStage", cloudkid.PixiDisplay, 
			{
				clearView: true,
				transparent: true
			});
		var cjsDisplay = this.addDisplay("createjsStage", cloudkid.CreateJSDisplay, 
			{
				clearView: true
			});
		cjsDisplay.visible = false;
		cjsDisplay.enabled = false;
		
		pixiStage = this.getDisplay("pixiStage").stage;
		createjsStage = this.getDisplay("createjsStage").stage;
		
		texture = new Texture.fromImage("images/cloudkid.png");//fromImage automatically loads stuff it it wasn't preloaded
		sprite = new Sprite(texture);		
				
		sprite.position.x = 0;
		sprite.position.y = 100;
		
		pixiStage.addChild(sprite);
				
		pixiStage.mouseup = onMouseUp;
		pixiStage.mousedown = onPixiMouseDown;

		createjsStage.addEventListener('stagemouseup', onMouseUp);
		createjsStage.addEventListener('stagemousedown', onCJSMouseDown);
		
		// Load the sprite info for the buttons
		this._assetLoader = new PIXI.AssetLoader(['images/button.json']);
		this._assetLoader.onComplete = this._onCompletedLoad.bind(this);
		this._assetLoader.load();

		cloudkid.MediaLoader.instance.load(
			'images/button.png', 
			this._onCJSButtonLoaded.bind(this)
		);
		
		//for pixi we are using one global graphics object
		currentPixiShape = new PIXI.Graphics();		
		pixiStage.addChild(currentPixiShape);

		//start the createjs line
		var g = new createjs.Graphics();
		g.setStrokeStyle(3, 'round', 'round').beginStroke("#999");
		var s = new createjs.Shape(g);
		createjsStage.addChild(s);
		currentCJSShape = s;
		
		this._clear();

		this.on("update", this.update.bind(this));
	};
	
	/**
	*   When the button sprite sheet has finished loading 
	*/
	p._onCompletedLoad = function()
	{
		pixiClearButton = new cloudkid.pixi.Button(
			// the button states, from the button data loaded
			{
				up : Texture.fromFrame("button_up.png"),
				over : Texture.fromFrame("button_over.png"),
				down : Texture.fromFrame("button_down.png"),
				disabled : Texture.fromFrame("button_disabled.png")
			}, 
			// The text field
			{
				text : 'Clear',
				style : {
					font : '20px Arial',
					fill : "#ffffff"
				}
			}
		);
		
		pixiClearButton.position.x = this.display.width - pixiClearButton.width - 5;
		pixiClearButton.position.y = this.display.height - pixiClearButton.height - 5;
		pixiClearButton.releaseCallback = this._clear.bind(this);
		
		pixiStage.addChild(pixiClearButton);

		pixiSwapButton = new cloudkid.pixi.Button(
			// the button states, from the button data loaded
			{
				up : Texture.fromFrame("button_up.png"),
				over : Texture.fromFrame("button_over.png"),
				down : Texture.fromFrame("button_down.png"),
				disabled : Texture.fromFrame("button_disabled.png")
			}, 
			// The text field
			{
				text : 'CreateJS',
				style : {
					font : '20px Arial',
					fill : "#ffffff"
				}
			}
		);

		pixiSwapButton.position.x = 5;
		pixiSwapButton.position.y = this.display.height - pixiSwapButton.height - 5;
		pixiSwapButton.releaseCallback = this.swapDisplay.bind(this);
		
		pixiStage.addChild(pixiSwapButton);
	};

	/**
	*  Callback for the button  
	*/
	p._onCJSButtonLoaded = function(result)
	{		
		createjsClearButton = new cloudkid.createjs.Button(result.content, {
			text: "Clear",
			font: "20px Arial",
			color: "#ffffff"
		});
				
		createjsClearButton.x = this.display.width - createjsClearButton.width - 5;
		createjsClearButton.y = this.display.height - createjsClearButton.height - 5;
		
		createjsClearButton.addEventListener(cloudkid.createjs.Button.BUTTON_PRESS, this._clear.bind(this));
		
		createjsStage.addChild(createjsClearButton);

		createjsSwapButton = new cloudkid.createjs.Button(result.content, {
			text: "Pixi",
			font: "20px Arial",
			color: "#ffffff"
		});
				
		createjsSwapButton.x = 5;
		createjsSwapButton.y = this.display.height - createjsSwapButton.height - 5;
		
		createjsSwapButton.addEventListener(cloudkid.createjs.Button.BUTTON_PRESS, this.swapDisplay.bind(this));
		
		createjsStage.addChild(createjsSwapButton);
	};
	
	/**
	*  Clear the stage  
	*/
	p._clear = function()
	{
		//wipe the pixi graphic
		currentPixiShape.clear();
		currentPixiShape.lineStyle(3,0xCCCCCC,1);

		//wipe the createjs stage
		currentCJSShape.graphics.clear();
		currentCJSShape.graphics.setStrokeStyle(3, 'round', 'round').beginStroke("#999");
		createjsStage.addChild(createjsClearButton);
		createjsStage.addChild(createjsSwapButton);
	};

	p.swapDisplay = function()
	{
		var pixiDisplay = this.getDisplay("pixiStage"), cjsDisplay = this.getDisplay("createjsStage");
		if(pixiDisplay.visible)
		{
			pixiDisplay.enabled = false;
			pixiDisplay.visible = false;
			cjsDisplay.enabled = true;
			cjsDisplay.visible = true;
		}
		else
		{
			pixiDisplay.enabled = true;
			pixiDisplay.visible = true;
			cjsDisplay.enabled = false;
			cjsDisplay.visible = false;
		}
	};
	
	/**
	* Called by the stage to update
	* @public
	*/
	p.update = function(elapsed)
	{
		var max = 800 - sprite.width;
		
		sprite.position.x += speed * direction;
		
		if (sprite.position.x < 0 || sprite.position.x > max )
		{
			direction *= -1;
		}
				
		if (isMouseDown)
		{
			var mPos;
			//get the current mouse position from the current renderer
			if(this.getDisplay("pixiStage").visible)
				mPos = pixiStage.getMousePosition();
			else
				mPos = new Point(createjsStage.mouseX, createjsStage.mouseY);
			//update the points
			var pt = new Point(mPos.x, mPos.y);
			var midPoint = new  Point(oldX + pt.x>>1, oldY+pt.y>>1);
			//pixi draw
			currentPixiShape.moveTo(pt.x, pt.y);
			currentPixiShape.lineTo(oldX, oldY, midPoint.x, midPoint.y);
			//createjs draw
			currentCJSShape.graphics.moveTo(midPoint.x, midPoint.y);
			currentCJSShape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY);
			
			//update the old points for the next frame
			oldX = pt.x;
			oldY = pt.y;
			oldMidX = midPoint.x;
			oldMidY = midPoint.y;
		}
	};
	
	/**
	*  Destroy this app, don't use after this
	*/
	p.destroy = function()
	{
		Debug.log("DrawingApp destroy.");
		
		if (pixiStage)
		{
			pixiStage.mouseup = null;
			pixiStage.mousedown = null;
			pixiStage = null;
		}
		
		if (pixiClearButton)
		{
			pixiClearButton.destroy();
			pixiClearButton = null;
			pixiSwapButton.destroy();
			pixiSwapButton = null;
		}

		if (createjsClearButton)
		{
			createjsClearButton.destroy();
			createjsClearButton = null;
			createjsSwapButton.destroy();
			createjsSwapButton = null;
		}
		
		if (currentPixiShape)
		{
			currentPixiShape.clear();
			currentPixiShape = null;
		}
		
		sprite = null;
		texture = null;

		if (createjsStage)
		{
			createjsStage.removeEventListener('stagemouseup', onMouseUp);
			createjsStage.removeEventListener('stagemousedown', onCJSMouseDown);
			createjsStage = null;
		}

		cloudkid.Application.prototype.destroy.call(this);
	};
	
	/**
	*  Handler for the mouse down event
	*  @private
	*/
	var onPixiMouseDown = function(mouseData)
	{
		isMouseDown = true;
		
		var mPos = mouseData.global;

		startLine(mPos.x, mPos.y);
	};

	/**
	*  Handler for the mouse up event
	*  @private
	*/
	var onMouseUp = function()
	{
 		isMouseDown = false;
	};

	/**
	*  Handler for the mouse down event
	*  @private
	*/
	function onCJSMouseDown(e)
	{
		isMouseDown = true;

		startLine(e.stageX, e.stageY);
	}

	function startLine(x, y)
	{
		//both createjs and pixi graphics use these numbers
		oldX = x;
		oldY = y;
		oldMidX = x;
		oldMidY = y;
	}
	
	namespace('cloudkid').DrawingApp = DrawingApp;
	
}());