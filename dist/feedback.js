class Feedback {
    constructor(rootEl, next) {
        this.rootEl_ = null;
        this.rootEl_ = rootEl;
        this.next_ = next;
    }
    displayNext(buttonText) {
        this.reset();
        const nextEl = document.createElement("div");
        nextEl.className = "j2f-next";
        const buttonEl = document.createElement("button");
        buttonEl.innerText = buttonText;
        buttonEl.onclick = this.next_;
        nextEl.appendChild(buttonEl);
        const infoEl = document.createElement("span");
        infoEl.innerHTML = "Drücken Sie <b>Enter</b>↵";
        nextEl.appendChild(infoEl);
        this.rootEl_.appendChild(nextEl);
    }
    displayError(msg) {
        this.reset();
        const errorEl = document.createElement("div");
        errorEl.className = "j2f-error";
        errorEl.innerText = msg;
        this.rootEl_.appendChild(errorEl);
    }
    reset() {
        this.rootEl_.innerHTML = "";
    }
}
export default Feedback;
//# sourceMappingURL=feedback.js.map