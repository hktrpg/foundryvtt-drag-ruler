export function* zip(it1, it2) {
	for (let i = 0;i < Math.min(it1.length, it2.length);i++) {
		yield [it1[i], it2[i]]
	}
}

export function getSnapPointForToken(x, y, token) {
	if (canvas.grid.isHex || token.data.width % 2 === 1) {
		return new PIXI.Point(...canvas.grid.getCenter(x, y))
	}
	const [snappedX, snappedY] = canvas.grid.getCenter(x - canvas.grid.w / 2, y - canvas.grid.h / 2)
	return new PIXI.Point(snappedX + canvas.grid.w / 2, snappedY + canvas.grid.h / 2)
}

