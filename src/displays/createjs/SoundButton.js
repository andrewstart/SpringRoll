/**
 *  @module cloudkid.createjs
 */
(function(){

	var Button = include('cloudkid.createjs.Button'),
		Sound;

	/**
	 *  A button with audio events for click and over mouse events
	 *  @class createjs.SoundButton
	 *  @extends createjs.Button
	 *  @constructor
	 *  @param {DOMElement}|object} imageSettings The loaded image element, see cloudkid.createjs.Button constructor
	 *  @param {Object} [label=null] See cloudkid.createjs.Button constructor
	 *  @param {Boolean} [enabled=true] If the button should be enabled by default
	 *  @param {String} [clickAlias="SFX_ButtonClick"] The button click audio alias
	 *  @param {String} [overAlias="SFX_ButtonRollover"] The button rollover audio alias
	 */
	var SoundButton = function(imageSettings, label, enabled, clickAlias, overAlias)
	{
		Sound = include('cloudkid.Sound');

		Button.call(this, imageSettings, label, enabled);

		/**
		 *  The audio alias to use for click events
		 *  @property {String} clickAlias
		 */
		this.clickAlias = clickAlias || "SFX_ButtonClick";

		/**
		 *  The audio alias to use for mouse over events
		 *  @property {String} overAlias
		 */
		this.overAlias = overAlias || "SFX_ButtonRollover";

		/**
		 *  If the audio is enabled
		 *  @property {Boolean} _audioEnabled
		 *  @private
		 */
		this._audioEnabled = true;

		this._onRollover = this._onRollover.bind(this);
		this._onButtonPress = this._onButtonPress.bind(this);

		// add listeners
		this.on('rollover', this._onRollover);
		this.on(Button.BUTTON_PRESS, this._onButtonPress);
	};

	// Reference to the super prototype
	var s = Button.prototype;

	// Reference to the prototype
	var p = SoundButton.prototype = Object.create(s);

	/**
	 *  Handler for the BUTTON_PRESS event
	 *  @method _onButtonPress
	 *  @private
	 */
	p._onButtonPress = function(e)
	{
		Sound.instance.play(this.clickAlias);
	};

	/**
	 *  Override for _onRollover function.
	 *  @method _onRollover
	 *  @private
	 */
	p._onRollover = function(e)
	{
		Sound.instance.play(this.overAlias);
	};

	/**
	 *  Handler for the on mouse over event
	 *  @property {Boolean} enabled
	 */
	Object.defineProperty(p, "audioEnabled",
	{
		get: function()
		{
			return this._audioEnabled;
		},
		set: function(enabled)
		{
			this._audioEnabled = enabled;
		}
	});

	/**
	 *  Don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		button.off("rollover", this._onRollover);
		button.off(Button.BUTTON_PRESS, this._onButtonPress);
		this.audioEnabled = false;
		s.destroy.apply(this);
	};

	// Assign to namespace
	namespace('cloudkid').SoundButton = SoundButton;
	namespace('cloudkid.createjs').SoundButton = SoundButton;

}());