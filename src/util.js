import {getPixelsFromGridPosition} from "./foundry_fixes.js"

export function* zip(it1, it2) {
	for (let i = 0;i < Math.min(it1.length, it2.length);i++) {
		yield [it1[i], it2[i]]
	}
}

export function getSnapPointForToken(x, y, token) {
	if (canvas.grid.isHex && game.modules.get("hex-size-support")?.active && CONFIG.hexSizeSupport.getAltSnappingFlag(token)) {
		if (token.getFlag("hex-size-support", "borderSize") % 2 === 0) {
			const snapPoint = CONFIG.hexSizeSupport.findVertexSnapPoint(x, y, token, canvas.grid)
			return new PIXI.Point(snapPoint.x, snapPoint.y)
		}
		else {
			return new PIXI.Point(...canvas.grid.getCenter(x, y))
		}
	}
	if (canvas.grid.isHex || token.data.width % 2 === 1) {
		return new PIXI.Point(...canvas.grid.getCenter(x, y))
	}
	const [snappedX, snappedY] = canvas.grid.getCenter(x - canvas.grid.w / 2, y - canvas.grid.h / 2)
	return new PIXI.Point(snappedX + canvas.grid.w / 2, snappedY + canvas.grid.h / 2)
}

export function highlightTokenShape(position, shape, color) {
	for (const space of shape) {
		const [x, y] = getPixelsFromGridPosition(position.x + space.x, position.y + space.y);
		canvas.grid.highlightPosition(this.name, {x, y, color})
	}
}

export function getTokenShape(token) {
	if (token.scene.data.gridType === CONST.GRID_TYPES.GRIDLESS)
		throw new Error("getTokenShape cannot be called for tokens on gridless maps")
	if (token.scene.data.gridType === CONST.GRID_TYPES.SQUARE) {
		const topOffset = -Math.floor(token.data.height / 2)
		const leftOffset = -Math.floor(token.data.width / 2)
		const shape = []
		for (let y = 0;y < token.data.height;y++) {
			for (let x = 0;x < token.data.width;x++) {
				shape.push({x: x + leftOffset, y: y + topOffset})
			}
		}
		return shape
	}
	else {
		console.warn("Token shape for HexSizeSupport isn't implemented yet")
		return [{x: 0, y: 0}]
	}
}
