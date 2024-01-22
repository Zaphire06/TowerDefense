import Tower from "../models/Tower.js";
import Fence from "../models/Fence.js";

export default class Preview {
    static addPreview(type, { x, y }) {
        if (type === "tower") {
            return new Tower({ x, y });
        } else if (type === "fence") {
            return new Fence({ x, y }, null);
        }
    }
}