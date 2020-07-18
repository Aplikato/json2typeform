import Feedback from "./feedback.js";

enum FormType {
  String = "STRING",
  End = "END",
  Start = "START",
  MultipleChoice = "MULTIPLE_CHOICE",
  Number = "NUMBER",
  BinaryChoice = "BINARY_CHOICE",
  Email = "EMAIL",
  Internship = "INTERNSHIP",
}

interface FieldProperties {
  question?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  placeholderFirm?: string;
  placeholderMonths?: string;
  choices?: string[];
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
  required?: boolean;
  properties?: FieldProperties;
  logic?: {
    conditions: Condition[];
  };
  next?: () => {};
}

interface Form {
  fields: FormField[];
}

type Types = Record<
  FormType,
  {
    template(
      id: string,
      properties: FieldProperties,
      next: () => {}
    ): HTMLElement[];
    handler: any;
    focus?: any;
    validate?: any;
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
  EMAIL: {
    template: (id, properties) => {
      const elements = [];
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;
      elements.push(question);
      //subtitle
      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }
      // input
      const input = document.createElement("input");
      input.id = id;
      input.setAttribute("name", id);
      input.setAttribute("type", "text");
      input.setAttribute("placeholder", properties.placeholder);
      elements.push(input);

      return elements;
    },
    handler: (id) => {
      const value = (<HTMLInputElement>document.getElementById(id)).value;
      return value;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
    validate: (id, handler, feedback) => {
      let regexpEmail = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (regexpEmail.test(handler())) {
        feedback.displayError("E-Mail ok. Test");
        return true;
      } else {
        feedback.displayError("Diese E-Mail-Adresse ist ungültig.");
        return false;
      }
    },
  },
  STRING: {
    template: (id, properties) => {
      const elements = [];
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;
      elements.push(question);
      //subtitle
      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }
      // input
      const input = document.createElement("input");
      input.id = id;
      input.setAttribute("name", id);
      input.setAttribute("type", "text");
      input.setAttribute("placeholder", properties.placeholder);
      elements.push(input);

      return elements;
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
      const elements = [];
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;
      elements.push(question);
      //subtitle
      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }
      // select
      const select = document.createElement("select");
      select.id = id;

      for (let choice of properties.choices) {
        const option = document.createElement("option");
        option.value = choice;
        option.innerText = choice;
        select.appendChild(option);
      }
      elements.push(select);

      return elements;
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
      const elements = [];
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;
      elements.push(question);
      //subtitle
      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }
      // input
      const input = document.createElement("input");
      input.id = id;
      input.setAttribute("name", id);
      input.setAttribute("type", "number");
      elements.push(input);

      return elements;
    },
    handler: (id) => {
      const value = (<HTMLInputElement>document.getElementById(id)).value;
      return value;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
  },
  BINARY_CHOICE: {
    template: (id, properties, next) => {
      const elements = [];
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;
      elements.push(question);
      //subtitle
      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }
      // button A or B
      const buttonA = document.createElement("button");
      const buttonB = document.createElement("button");
      buttonA.innerText = properties.choices[0];
      buttonB.innerText = properties.choices[1];
      buttonA.value = properties.choices[0];
      buttonB.value = properties.choices[1];
      elements.push(buttonA);
      elements.push(buttonB);
      const hidden = document.createElement("input");
      hidden.setAttribute("type", "hidden");
      hidden.id = id;

      elements.push(hidden);
      buttonA.onclick = () => {
        hidden.value = properties.choices[0];
        next();
      };
      buttonB.onclick = () => {
        hidden.value = properties.choices[1];
        next();
      };

      return elements;
    },
    handler: (id) => {
      const value = (<HTMLSelectElement>document.getElementById(id)).value;
      return value;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
  },
  INTERNSHIP: {
    // TODO (lisa): style
    template: (id, properties) => {
      const elements = [];
      // question
      const question = document.createElement("h3");
      question.textContent = properties.question;
      elements.push(question);
      //subtitle
      if ("subtitle" in properties) {
        const subtitle = document.createElement("h4");
        subtitle.innerText = properties.subtitle;
        elements.push(subtitle);
      }
      //TODO(lisa): make it dynamic
      const divA = document.createElement("div");
      divA.id = id + "divA";
      divA.setAttribute("name", id + "divA");
      // input A
      const inputA = document.createElement("input");
      inputA.id = id + "inputA";
      inputA.setAttribute("name", id + "inputA");
      inputA.setAttribute("type", "text");
      inputA.setAttribute("placeholder", properties.placeholderFirm);
      elements.push(inputA);
      divA.appendChild(inputA);
      //number A
      const numberA = document.createElement("input");
      numberA.id = id + "numberA";
      numberA.setAttribute("name", id) + "numberA";
      numberA.setAttribute("type", "number");
      numberA.setAttribute("placeholder", properties.placeholderMonths);
      elements.push(numberA);
      // input B
      const inputB = document.createElement("input");
      inputB.id = id + "inputB";
      inputB.setAttribute("name", id + "inputB");
      inputB.setAttribute("type", "text");
      inputB.setAttribute("placeholder", properties.placeholderFirm);
      elements.push(inputB);
      //number B
      const numberB = document.createElement("input");
      numberB.id = id + "numberB";
      numberB.setAttribute("name", id + "numberB");
      numberB.setAttribute("type", "number");
      numberB.setAttribute("placeholder", properties.placeholderMonths);
      elements.push(numberB);
      // input C
      const inputC = document.createElement("input");
      inputC.id = id + "inputC";
      inputC.setAttribute("name", id + "inputC");
      inputC.setAttribute("type", "text");
      inputC.setAttribute("placeholder", properties.placeholderFirm);
      elements.push(inputC);
      //number C
      const numberC = document.createElement("input");
      numberC.id = id + "numberC";
      numberC.setAttribute("name", id + "numberC");
      numberC.setAttribute("type", "number");
      numberC.setAttribute("placeholder", properties.placeholderMonths);
      elements.push(numberC);

      return elements;
    },
    handler: (id) => {
      const values = [];
      const valueInputA = (<HTMLInputElement>(
        document.getElementById(id + "inputA")
      )).value;
      const valueInputB = (<HTMLInputElement>(
        document.getElementById(id + "inputB")
      )).value;
      const valueInputC = (<HTMLInputElement>(
        document.getElementById(id + "inputC")
      )).value;
      const valueNumberA = (<HTMLInputElement>(
        document.getElementById(id + "inputA")
      )).value;
      const valueNumberB = (<HTMLInputElement>(
        document.getElementById(id + "inputA")
      )).value;
      const valueNumberC = (<HTMLInputElement>(
        document.getElementById(id + "inputA")
      )).value;
      values.push(valueInputA);
      values.push(valueInputB);
      values.push(valueInputC);
      values.push(valueNumberA);
      values.push(valueNumberB);
      values.push(valueNumberC);

      return values;
    },
    focus: (id) => {
      document.getElementById(id).focus();
    },
  },
};

class FormBuilder {
  private form_: any;
  private responses_: FormResponses;

  private rootElement_: HTMLElement = document.body;
  private overlapElement_: HTMLElement = document.createElement("div");
  private containerEl_: HTMLElement = document.createElement("div");
  private feedbackEl_: HTMLElement = document.createElement("div");
  private closeButtonEl_: HTMLElement = document.createElement("button");
  private footer_: HTMLElement = document.createElement("div");

  private inputContainer_: HTMLElement;
  private answers_: object = {};

  private resolve_: any;

  /* currently rendered step */
  private step_ = null;

  private feedback_: Feedback;

  constructor(form: Form) {
    // form with start and end
    this.form_ = {
      steps: form.fields.map((field) => this.stepToField_(field)),
    };
    this.step_ = this.form_.steps[0];

    // close button
    this.closeButtonEl_.className = "j2f-close-button";
    this.closeButtonEl_.innerText = "X";
    this.closeButtonEl_.onclick = () => {
      this.reset_();
    };

    // CSS
    this.overlapElement_.className = "j2f-overlap";
    this.containerEl_.className = "j2f-container";
    this.feedbackEl_.className = "j2f-feedback";
    this.footer_.className = "j2f-footer";

    this.overlapElement_.appendChild(this.containerEl_);
    this.overlapElement_.appendChild(this.feedbackEl_);
    this.overlapElement_.appendChild(this.closeButtonEl_);
    this.overlapElement_.appendChild(this.footer_);

    // Feedback
    this.feedback_ = new Feedback(this.feedbackEl_, () => {
      this.next_();
    });
  }

  stepToField_(field) {
    const step = {
      ...field,
      template: () =>
        types[field.type].template(field.id, field.properties, () =>
          this.next_()
        ),
      handler: () => types[field.type].handler(field.id),
    };

    if ("focus" in types[field.type])
      step.focus = () => types[field.type].focus(field.id);

    if ("validate" in types[field.type])
      step.validate = () =>
        types[field.type].validate(field.id, step.handler, this.feedback_);

    return step;
  }

  async init() {
    this.rootElement_.appendChild(this.overlapElement_);

    // add keypress event listener
    this.rootElement_.addEventListener("keyup", (e) => {
      if (this.step_.validate && !this.step_.validate()) return;
      if (this.step_.required && this.isEmpty_()) return;

      if (e.key === "Enter") {
        this.next_();
      }
    });

    this.render_(this.step_);

    return new Promise((resolve, reject) => {
      this.resolve_ = resolve;
    });
  }

  reset_() {
    this.answers_ = {};
    this.step_ = this.form_.steps[0];
    this.containerEl_.innerHTML = "";
    this.overlapElement_.remove();
  }

  next_() {
    if (this.step_.type === FormType.End) {
      this.overlapElement_.remove();
      this.resolve_(this.answers_);
      return;
    }

    if (this.step_.type !== FormType.Start)
      this.answers_[this.step_.id] = this.step_.handler();
    this.step_ = this.getNextStep_(this.step_);

    this.render_(this.step_);
  }

  render_(step) {
    this.feedback_.reset();
    this.renderStep_(step);
    this.renderNavigation_(step);
  }

  /*
    Renders field template with navigation button in a container
  */
  renderStep_(step): void {
    const stepEl = document.createElement("div");
    stepEl.className = "j2f-step j2f-add";

    // template
    const elements = step.template();
    for (let element of elements) {
      stepEl.appendChild(element);
    }

    this.transitionStep_(stepEl);
    if ("focus" in step) step.focus();
  }

  renderNavigation_(step): void {
    const buttonEl = document.createElement("button");
    buttonEl.onclick = () => {
      if (this.step_.validate && !this.step_.validate()) return;
      if (this.step_.required && this.isEmpty_()) return;
      this.next_();
    };

    switch (step.type) {
      case FormType.Start:
        buttonEl.innerText = "Start";
        break;
      case FormType.End:
        buttonEl.innerText = "Senden";
        break;
      default:
        buttonEl.innerText = "Weiter";
    }
    this.transitionNavigation_(buttonEl);
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

  transitionStep_(newStepEl: HTMLElement) {
    // if overlap element contains step
    if (this.containerEl_.children.length === 1) {
      const oldStepEl = <HTMLElement>this.containerEl_.firstChild;

      // animate
      this.containerEl_.replaceChild(newStepEl, oldStepEl);
    } else this.containerEl_.prepend(newStepEl);
  }

  transitionNavigation_(newEl: HTMLElement) {
    newEl.className = "j2f-add";
    if (this.footer_.children.length === 1) {
      const oldEl = <HTMLElement>this.footer_.firstChild;

      // animate
      this.footer_.replaceChild(newEl, oldEl);
    } else this.footer_.appendChild(newEl);
  }

  /*
   * Validates field.
   * Returns false if field value is not value and true elsewise.
   * Is only active if field has property required set to true.
   */
  isEmpty_(): boolean {
    if (this.step_.handler() === "") {
      this.feedback_.displayError("Bitte ausfüllen.");
      return true;
    }

    if (this.step_.type !== FormType.End) this.feedback_.displayNext("OK");
    return false;
  }
}

export default FormBuilder;
