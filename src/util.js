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
