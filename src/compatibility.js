import {getPixelsFromGridPosition} from "./foundry_fixes.js"
import {getColorForDistance} from "./main.js"

export function getHexSizeSupportTokenGridCenter(token) {
	const tokenCenterOffset = CONFIG.hexSizeSupport.getCenterOffset(token)
	return {x: token.x + tokenCenterOffset.x, y: token.y + tokenCenterOffset.y}
}

export function highlightMeasurementTerrainRuler(ray, startDistance) {
	for (const space of ray.terrainRulerVisitedSpaces) {
		const [x, y] = getPixelsFromGridPosition(space.x, space.y);
		const color = getColorForDistance.call(this, startDistance, space.distance)
		canvas.grid.highlightPosition(this.name, {x, y, color: color})
	}
}
