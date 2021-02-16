import {availableSpeedProviders, getDefaultSpeedProvider, updateSpeedProvider} from "./api.js";
import {SpeedProvider} from "./speed_provider.js"
import {getDefaultDashMultiplier, getDefaultSpeedAttribute} from "./systems.js"

export const settingsKey = "drag-ruler";

export function registerSettings() {
	game.settings.register(settingsKey, "swapSpacebarRightClick", {
		name: "drag-ruler.settings.swapSpacebarRightClick.name",
		hint: "drag-ruler.settings.swapSpacebarRightClick.hint",
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
	})

	game.settings.register(settingsKey, "alwaysShowSpeedForPCs", {
		name: "drag-ruler.settings.alwaysShowSpeedForPCs.name",
		hint: "drag-ruler.settings.alwaysShowSpeedForPCs.hint",
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	})

	// This setting will be modified by the api if modules register to it
	game.settings.register(settingsKey, "speedProvider", {
		scope: "world",
		config: false,
		type: String,
		default: getDefaultSpeedProvider(),
		onChange: updateSpeedProvider,
	})

	game.settings.registerMenu(settingsKey, "speedProviderSettings", {
		name: "drag-ruler.settings.speedProviderSettings.name",
		hint: "drag-ruler.settings.speedProviderSettings.hint",
		label: "drag-ruler.settings.speedProviderSettings.button",
		icon: "fas fa-tachometer-alt",
		type: SpeedProviderSettings,
		restricted: false,
	})

	game.settings.register(settingsKey, "speedAttribute", {
		name: "drag-ruler.settings.speedAttribute.name",
		hint: "drag-ruler.settings.speedAttribute.hint",
		scope: "world",
		config: true,
		type: String,
		default: getDefaultSpeedAttribute(),
	})

	game.settings.register(settingsKey, "dashMultiplier", {
		name: "drag-ruler.settings.dashMultiplier.name",
		hint: "drag-ruler.settings.dashMultiplier.hint",
		scope: "world",
		config: true,
		type: Number,
		default: getDefaultDashMultiplier(),
	})
}

class SpeedProviderSettings extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "drag-ruler-speed-provider-settings",
			title: game.i18n.localize("drag-ruler.settings.speedProviderSettings.windowTitle"),
			template: "modules/drag-ruler/templates/speed_provider_settings.html",
			width: 600,
		})
	}

	getData(options={}) {
		const data = {}
		// Insert all speed providers into the template data
		data.providers = Object.values(availableSpeedProviders).map(provider => {
			provider.hasSettings = provider instanceof SpeedProvider
			if (provider.hasSettings)
				provider.settings = enumerateProviderSettings(provider)
			const [type, id] = provider.id.split(".", 1)
			if (type === "native") {
				provider.selectTitle = game.i18n.localize("drag-ruler.settings.speedProviderSettings.speedProvider.choices.native")
			}
			else {
				let name
				if (type === "module") {
					name = game.modules.get(id).data.title
				}
				else {
					name = game.system.data.title
				}
				provider.selectTitle = game.i18n.format(`drag-ruler.settings.speedProviderSettings.speedProvider.choices.${type}`, {name})
			}
			return provider
		})
		data.providerSelection = {
			id: "speedProvider",
			name: game.i18n.localize("drag-ruler.settings.speedProviderSettings.speedProvider.name"),
			hint: game.i18n.localize("drag-ruler.settings.speedProviderSettings.speedProvider.hint"),
			type: String,
			choices: data.providers.reduce((choices, provider) => {
				choices[provider.id] = provider.selectTitle
				return choices
			}, {}),
			value: game.settings.get(settingsKey, "speedProvider"),
			isCheckbox: false,
			isSelect: true,
			isRange: false,
		}
		return data
	}
}

function toDomHex(value) {
	const hex = value.toString(16)
	return "#" + "0".repeat(Math.max(0, 6 - hex.length)) + hex
}

function enumerateProviderSettings(provider) {
	const colorSettings = []
	const unreachableColor = {id: "unreachable", name: "drag-ruler.settings.speedProviderSettings.color.unreachable.name"}
	for (const color of provider.colors.concat([unreachableColor])) {
		const colorName = game.i18n.localize(color.name)
		let hint
		if (color === unreachableColor)
			hint = game.i18n.localize("drag-ruler.settings.speedProviderSettings.color.unreachable.hint")
		else
			hint = game.i18n.format("drag-ruler.settings.speedProviderSettings.color.hint", {colorName})
		colorSettings.push({
			id: `${provider.id}.color.${color.id}`,
			name: game.i18n.format("drag-ruler.settings.speedProviderSettings.color.name", {colorName}),
			hint: hint,
			type: Number,
			value: toDomHex(game.settings.get(settingsKey, `speedProviders.${provider.id}.color.${color.id}`)),
			isCheckbox: false,
			isSelect: false,
			isRange: false,
			isColor: true,
		})
	}

	// TODO Add regular settings
	return colorSettings
}
