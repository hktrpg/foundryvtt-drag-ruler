import {settingsKey} from "./settings.js"

/**
 * Base class for all speed providers.
 * If you want to offer a speed provider in your system/module you must derive this class.
 * Each speed provider must at least implement
 */
export class SpeedProvider {
	/**
	 * Returns an array of colors used by this speed provider. Each color corresponds to one speed that a token may have.
	 * Each color must be an object with the following properties:
	 * - id: A value that identfies the color. Must be unique for each color returned.
	 * - default: The color that is used to highlight that speed by default.
	 * - name: A user readable name for the speed represented by the color. This name is used in the color configuration dialog. Drag Ruler will attempt to localize this string using `game.i18n`
	 *
	 * Of these properties, id and defaultColor are required. name is optional, but it's recommended to set it
	 *
	 * Implementing this method is required for all speed providers
	 */
	get colors() {
		// TODO Report that this function must be implemented
	}

	/**
	 * Returns an array of speeds that the token passed in the arguments this token can reach.
	 * Each range is an object that with the following properties:
	 * - range: A number indicating the distance that the token can travel with this speed
	 * - color: The id (as defined in the `colors` getter) of the color that should be used to represent this range
	 *
	 * Implementing this method is required for all speed providers
	 */
	getRanges(token) {
		// TODO Report that this function must be implemented
	}

	/**
	 * Returns the default color for ranges that a token cannot reach.
	 *
	 * Implementing this method is optional and only needs to be done if you want to provide a custom default for that color.
	 */
	get defaultUnreachableColor() {
		return 0xFF0000
	}

	/**
	 * Constructs a new instance of he speed provider
	 * This function shouldn't be overridden by speed provider implementations
	 */
	constructor(id) {
		this.id = id
	}
}


export class GenericSpeedProvider extends SpeedProvider {
	get colors() {
		return [
			{id: "walk", default: 0x00FF00, name: "drag-ruler.genericSpeedProvider.speeds.walk"},
			{id: "dash", default: 0xFFFF00, name: "drag-ruler.genericSpeedProvider.speeds.dash"}
		]
	}

	getRanges(token) {
		// TODO Move this setting into a provider setting
		const speedAttribute = game.settings.get(settingsKey, "speedAttribute")
		if (!speedAttribute)
			return []
		const tokenSpeed = getProperty(token, speedAttribute)
		if (tokenSpeed === undefined) {
			console.warn(`Drag Ruler (Generic Speed Provider) | The configured token speed attribute "${speedAttribute}" didn't return a speed value. To use colors based on drag distance set the setting to the correct value (or clear the box to disable this feature).`)
			return []
		}
		const dashMultiplier = game.settings.get(settingsKey, "dashMultiplier")
		if (!dashMultiplier)
			return [{range: tokenSpeed, color: playercolor}]
		return [{range: tokenSpeed, color: "walk"}, {range: tokenSpeed * dashMultiplier, color: "dash"}]
	}
}
