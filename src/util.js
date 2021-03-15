import {getPixelsFromGridPosition} from "./foundry_fixes.js"

export function* zip(it1, it2) {
	for (let i = 0;i < Math.min(it1.length, it2.length);i++) {
		yield [it1[i], it2[i]]
	}
}

export function getSnapPointForToken(x, y, token) {
	if (canvas.grid.isHex && game.modules.get("hex-size-support")?.active && CONFIG.hexSizeSupport.getAltSnappingFlag(token)) {
		if (token.getFlag("hex-size-support", "borderSize") % 2 === 0) {
			const snapPoint = CONFIG.hexSizeSupport.findVertexSnapPoint(x, y, token, canvas.grid.grid)
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
		let gridX = position.x + space.x;
		let gridY = position.y + space.y;
		if (canvas.grid.isHex) {
			let shiftedRow;
			if (canvas.grid.grid.options.even)
				shiftedRow = 1
			else
				shiftedRow = 0
			if (canvas.grid.grid.options.columns) {
				if (space.x % 2 !== 0 && position.x % 2 !== shiftedRow) {
					gridY += 1;
				}
			}
			else {
				if (space.y % 2 !== 0 && position.y % 2 !== shiftedRow) {
					gridX += 1;
				}
			}
		}
		const [x, y] = getPixelsFromGridPosition(gridX, gridY);
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
		// Hex grids
		if (game.modules.get("hex-size-support")?.active && CONFIG.hexSizeSupport.getAltSnappingFlag(token)) {
			const borderSize = token.data.flags["hex-size-support"].borderSize;
			console.warn(borderSize)
			let shape = [{x: 0, y: 0}];
			if (borderSize >= 2)
				shape = shape.concat([{x: 0, y: -1}, {x: -1, y: -1}]);
			if (borderSize >= 3)
				shape = shape.concat([{x: 0, y: 1}, {x: -1, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}]);
			if (borderSize >= 4)
				shape = shape.concat([{x: -2, y: -1}, {x: 1, y: -1}, {x: -1, y: -2}, {x: 0, y: -2}, {x: 1, y: -2}])

			if (Boolean(CONFIG.hexSizeSupport.getAltOrientationFlag(token)) !== canvas.grid.grid.options.columns)
				shape.forEach(space => space.y *= -1);
			if (canvas.grid.grid.options.columns)
				shape = shape.map(space => {return {x: space.y, y: space.x}});
			return shape;
		}
		else {
			return [{x: 0, y: 0}];
		}
	}
}

export function getTokenSize(token) {
	let w, h;
	const hexSizeSupportBorderSize = token.data.flags["hex-size-support"]?.borderSize;
	if (hexSizeSupportBorderSize > 0) {
		w = h = hexSizeSupportBorderSize
	}
	else {
		w = token.data.width
		h = token.data.height
	}
	return {w, h};
}

// Tokens that have a size divisible by two (2x2, 4x4, 2x1) have their ruler at the edge of a cell.
// This function applies an offset to to the waypoints that will move the ruler from the edge to the center of the cell
export function applyTokenSizeOffset(waypoints, token) {
	if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
		return waypoints
	}

	const tokenSize = getTokenSize(token);
	const waypointOffset = {x: 0, y: 0};
	if (canvas.grid.isHex) {
		const isAltOrientation = CONFIG.hexSizeSupport.getAltOrientationFlag(token);
		if (canvas.grid.grid.options.columns) {
			if (tokenSize.w % 2 === 0) {
				waypointOffset.x = canvas.grid.w / 2;
				if (!isAltOrientation)
					waypointOffset.x *= -1;
			}
		}
		else {
			if (tokenSize.h % 2 === 0) {
				waypointOffset.y = canvas.grid.h / 2;
				if (isAltOrientation)
					waypointOffset.y *= -1;
			}
		}
	}
	else {
		if (tokenSize.w % 2 === 0) {
			waypointOffset.x = canvas.grid.w / 2;
		}
		if (tokenSize.h % 2 === 0) {
			waypointOffset.y = canvas.grid.h / 2;
		}
	}

	return waypoints.map(w => new PIXI.Point(w.x + waypointOffset.x, w.y + waypointOffset.y))
}
