"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types = {
    string: {
        template: (id) => {
            const el = document.createElement("input");
            el.setAttribute("name", id);
            el.setAttribute("type", "text");
            return el;
        },
        handler: () => "value"
    }
};
exports.default = types;
