enum FormType {
  String = "STRING",
  End = "END",
  Start = "START",
  MultipleChoice = "MULTIPLE_CHOICE",
  Number = "NUMBER",
}

interface FieldProperties {
  question?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  choices?: [string];
}

type FormResponse = string | number;
interface FormResponses {
  [key: string]: FormResponse;
}

enum ConditionType {
  Equal = "EQUAL",
  Always = "ALWAYS",
}
interface Condition {
  type: ConditionType;
  to: string;
  value: any;
}
interface FormField {
  type: FormType;
  id: string;
  properties?: FieldProperties;
  logic?: {
    conditions: Condition[];
  };
}

interface Form {
  fields: FormField[];
}

type Types = Record<
  FormType,
  {
    template(id: string, properties: FieldProperties): HTMLElement[];
    handler: any;
    focus?: any;
  }
>;
const types: Types = {
  START: {
    template: (id, properties) => {
      const elements = [];

      const title = document.createElement("h3");
      title.innerText = properties.title;
      elements.push(title);

      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }

      return elements;
    },
    handler: (id) => null,
    // remove focus on start
    focus: () => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
    },
  },
  END: {
    template: (id, properties) => {
      const elements = [];

      const title = document.createElement("h3");
      title.innerText = properties.title;
      elements.push(title);

      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }

      return elements;
    },
    handler: (id) => null,
  },
  STRING: {
    template: (id, properties) => {
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;

      // input
      const input = document.createElement("input");
      input.id = id;
      input.setAttribute("name", id);
      input.setAttribute("type", "text");
      input.setAttribute("placeholder", properties.placeholder);

      return [question, input];
    },
    handler: (id) => {
      const value = (<HTMLInputElement>document.getElementById(id)).value;
      return value;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
  },
  MULTIPLE_CHOICE: {
    template: (id, properties) => {
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;

      // select
      const select = document.createElement("select");
      select.id = id;

      for (let choice of properties.choices) {
        const option = document.createElement("option");
        option.value = choice;
        option.innerText = choice;
        select.appendChild(option);
      }

      return [question, select];
    },
    handler: (id) => {
      const value = (<HTMLSelectElement>document.getElementById(id)).value;
      return value;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
  },
  NUMBER: {
    template: (id, properties) => {
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;

      // input
      const input = document.createElement("input");
      input.id = id;
      input.setAttribute("name", id);
      input.setAttribute("type", "number");

      return [question, input];
    },
    handler: (id) => {
      const value = (<HTMLInputElement>document.getElementById(id)).value;
      return value;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
  },
};

class FormBuilder {
  private form_: any;
  private isTransitioning_: boolean = false;
  private responses_: FormResponses;

  private rootElement_: HTMLElement = document.body;
  private overlapElement_: HTMLElement = document.createElement("div");
  private footer_: HTMLElement = document.createElement("div");

  private inputContainer_: HTMLElement;
  private answers_: object = {};

  private resolve_: any;

  /* currently rendered step */
  private step_ = null;

  constructor(form: Form) {
    // form with start and end
    this.form_ = {
      steps: form.fields.map((field) => this.stepToField_(field)),
    };
    this.step_ = this.form_.steps[0];

    // CSS
    this.overlapElement_.className = "j2f-overlap";
    this.footer_.className = "j2f-footer";

    this.overlapElement_.appendChild(this.footer_);
  }

  stepToField_(field) {
    const step = {
      ...field,
      template: () => types[field.type].template(field.id, field.properties),
      handler: () => types[field.type].handler(field.id),
    };
    if ("focus" in types[field.type])
      step.focus = () => types[field.type].focus(field.id);
    return step;
  }

  async init() {
    this.rootElement_.appendChild(this.overlapElement_);

    const button = document.createElement("button");
    this.overlapElement_.appendChild(button);

    // add return listener
    this.rootElement_.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.next_();
      }
    });

    this.renderStep_(this.step_);

    return new Promise((resolve, reject) => {
      this.resolve_ = resolve;
    });
  }

  next_() {
    if (this.isTransitioning_) return;

    if (this.step_.type === FormType.End) {
      this.overlapElement_.remove();
      this.resolve_(this.answers_);
      return;
    }

    if (this.step_.type != FormType.Start)
      this.answers_[this.step_.id] = this.step_.handler();
    this.step_ = this.getNextStep_(this.step_);

    this.renderStep_(this.step_);
  }

  renderStep_(step) {
    this.renderContainer_(step);
    this.renderNavigation_(step);
  }

  /*
    Renders field template with navigation button in a container
  */
  renderContainer_(step): void {
    // container
    const container = document.createElement("div");
    container.className = "j2f-container j2f-add";

    // template
    const elements = step.template();
    for (let element of elements) {
      container.appendChild(element);
    }

    this.transitionContainer_(container);
    if ("focus" in step) step.focus();
  }

  renderNavigation_(step): void {
    // button
    const button = document.createElement("button");
    button.onclick = () => {
      this.next_();
    };

    switch (step.type) {
      case FormType.Start:
        button.innerText = "Start";
        break;
      case FormType.End:
        button.innerText = "Senden";
        break;
      default:
        button.innerText = "Weiter";
    }
    this.transitionNavigation_(button);
  }

  /*
   * Select next field.
   * Returns start for first and end for last field.
   * If no logic given continues linear with the next field in the form.fields
   *  array.
   * If logic given jumps to the id defined in the  "to" property.
   */
  getNextStep_(prevStep) {
    // logic
    if ("logic" in prevStep) {
      for (let condition of prevStep.logic.conditions) {
        const i = this.form_.steps.findIndex(({ id }) => id === condition.to);
        switch (condition.type) {
          case ConditionType.Equal:
            if (condition.value === prevStep.handler())
              return this.form_.steps[i];
            break;
          case ConditionType.Always:
            return this.form_.steps[i];
            break;
        }
      }

      throw new Error("Logic is broken. Check your conditions!");
    }

    // linear
    const index = this.form_.steps.findIndex((step) => step.id === prevStep.id);
    return this.form_.steps[index + 1];
  }

  transitionContainer_(newEl: HTMLElement) {
    // if overlap element contains container (and close-button and footer)
    if (this.overlapElement_.children.length === 3) {
      this.isTransitioning_ = true;
      const oldEl = <HTMLElement>this.overlapElement_.firstChild;

      // animate
      oldEl.className = "j2f-remove";
      this.overlapElement_.prepend(newEl);

      setTimeout(() => {
        oldEl.remove();
        this.isTransitioning_ = false;
      }, 1000);
    } else this.overlapElement_.prepend(newEl);
  }

  transitionNavigation_(newEl: HTMLElement) {
    newEl.className = "j2f-add";
    if (this.footer_.children.length === 1) {
      const oldEl = <HTMLElement>this.footer_.firstChild;

      // animate
      oldEl.className = "j2f-remove";
      this.footer_.prepend(newEl);

      setTimeout(() => {
        oldEl.remove();
      }, 1000);
    } else this.footer_.appendChild(newEl);
  }
}

export default FormBuilder;
