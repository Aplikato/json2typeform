var FormType;
(function (FormType) {
    FormType["String"] = "STRING";
    FormType["End"] = "END";
    FormType["Start"] = "START";
    FormType["MultipleChoice"] = "MULTIPLE_CHOICE";
    FormType["Number"] = "NUMBER";
})(FormType || (FormType = {}));
var ConditionType;
(function (ConditionType) {
    ConditionType["Equal"] = "EQUAL";
    ConditionType["Always"] = "ALWAYS";
})(ConditionType || (ConditionType = {}));
const types = {
    START: {
        template: () => {
            const inputEl = document.createElement("h3");
            inputEl.innerText = "Welcome";
            return [inputEl];
        },
        handler: id => [id, null]
    },
    END: {
        template: () => {
            const inputEl = document.createElement("h3");
            inputEl.innerText = "Thank you";
            return [inputEl];
        },
        handler: id => [id, null]
    },
    STRING: {
        template: (id, properties) => {
            // question
            const questionEl = document.createElement("h3");
            questionEl.textContent = properties.question;
            // input
            const inputEl = document.createElement("input");
            inputEl.id = id;
            inputEl.setAttribute("name", id);
            inputEl.setAttribute("type", "text");
            return [questionEl, inputEl];
        },
        handler: id => {
            const value = document.getElementById(id).value;
            return [id, value];
        }
    },
    MULTIPLE_CHOICE: {
        template: (id, properties) => {
            // question
            const questionEl = document.createElement("h3");
            questionEl.textContent = properties.question;
            // select
            const selectEl = document.createElement("select");
            selectEl.id = id;
            for (let choice of properties.choices) {
                const option = document.createElement("option");
                option.value = choice;
                option.innerText = choice;
                selectEl.appendChild(option);
            }
            return [questionEl, selectEl];
        },
        handler: id => {
            const value = document.getElementById(id).value;
            return [id, value];
        }
    },
    NUMBER: {
        template: (id, properties) => {
            // question
            const questionEl = document.createElement("h3");
            questionEl.textContent = properties.question;
            // input
            const inputEl = document.createElement("input");
            inputEl.id = id;
            inputEl.setAttribute("name", id);
            inputEl.setAttribute("type", "number");
            return [questionEl, inputEl];
        },
        handler: id => {
            const value = document.getElementById(id).value;
            return [id, value];
        }
    }
};
class FormBuilder {
    constructor(id, form, callback) {
        this.isTransitioning_ = false;
        this.answers_ = {};
        // form with start and end
        this.form_ = {
            fields: [
                { id: "start", type: FormType.Start },
                ...form.fields,
                { id: "end", type: FormType.End }
            ]
        };
        this.rootElement_ = document.getElementById(id);
        this.rootElement_.className = "aplikatoForm";
        // create overlap
        this.overlapElement_ = document.createElement("div");
        this.overlapElement_.className = "overlap";
        this.rootElement_.appendChild(this.overlapElement_);
        this.callback_ = callback;
    }
    init() {
        const field = this.selectNextField_(null);
        this.renderField_(field);
    }
    next_(handler) {
        if (this.isTransitioning_)
            return;
        const [id, value] = handler();
        if (id != "start")
            this.answers_[id] = value;
        const nextField = this.selectNextField_(id);
        this.renderField_(nextField);
    }
    /*
      Renders field template with navigation button in a container
    */
    renderField_(field) {
        // container
        const el = document.createElement("div");
        el.className = "container add";
        // template
        const templateEls = types[field.type].template(field.id, field.properties);
        for (let templateEl of templateEls) {
            el.appendChild(templateEl);
        }
        // button
        const buttonEl = document.createElement("button");
        switch (field.type) {
            case FormType.Start:
                buttonEl.innerText = "Start";
                buttonEl.onclick = () => {
                    this.next_(() => types[field.type].handler(field.id));
                };
                break;
            case FormType.End:
                buttonEl.innerText = "Send";
                buttonEl.onclick = () => {
                    this.callback_(this.answers_);
                };
                break;
            default:
                buttonEl.innerText = "Next";
                buttonEl.onclick = () => {
                    this.next_(() => types[field.type].handler(field.id));
                };
        }
        el.appendChild(buttonEl);
        this.transitionContainer_(el);
    }
    /*
     * Select next field.
     * Returns start for first and end for last field.
     * If no logic given continues linear with the next field in the form.fields
     *  array.
     * If logic given jumps to the id defined in the  "to" property.
     */
    selectNextField_(currentId) {
        // init
        if (currentId === null)
            return { id: "start", type: FormType.Start };
        const index = this.form_.fields.findIndex(({ id }) => id === currentId);
        const field = this.form_.fields[index];
        // logic
        if (field.logic) {
            for (let condition of field.logic.conditions) {
                const i = this.form_.fields.findIndex(({ id }) => id === condition.to);
                switch (condition.type) {
                    case ConditionType.Equal:
                        console.log("equal", types[field.type].handler(field.id)[1], field.id, condition.value);
                        if (condition.value === types[field.type].handler(field.id)[1])
                            return this.form_.fields[i];
                        break;
                    case ConditionType.Always:
                        return this.form_.fields[i];
                        break;
                }
            }
            throw new Error("Logic is broken. Check your conditions!");
        }
        // linear
        return this.form_.fields[index + 1];
    }
    transitionContainer_(newEl) {
        if (this.overlapElement_.children.length !== 0) {
            this.isTransitioning_ = true;
            const oldEl = this.overlapElement_.firstChild;
            // animate
            oldEl.className = "remove";
            this.overlapElement_.appendChild(newEl);
            setTimeout(() => {
                oldEl.remove();
                this.isTransitioning_ = false;
            }, 1000);
        }
        else
            this.overlapElement_.appendChild(newEl);
    }
}
export { FormBuilder };
