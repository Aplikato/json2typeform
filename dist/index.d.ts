declare enum FormType {
    String = "STRING",
    End = "END",
    Start = "START",
    MultipleChoice = "MULTIPLE_CHOICE",
    Number = "NUMBER"
}
interface FieldProperties {
    question?: string;
    choices?: [string];
}
declare type FormResponse = string | number;
interface FormResponses {
    [key: string]: FormResponse;
}
declare enum ConditionType {
    Equal = "EQUAL",
    Always = "ALWAYS"
}
interface Condition {
    type: ConditionType;
    to: string;
    value: any;
}
interface FormField {
    type: FormType;
    id: string;
    properties?: {
        question: string;
    };
    logic?: {
        conditions: Condition[];
    };
}
interface Form {
    fields: FormField[];
}
declare type Types = Record<FormType, {
    template(id: string, properties: FieldProperties): HTMLElement[];
    handler: any;
}>;
declare const types: Types;
declare class FormBuilder {
    private form_;
    private isTransitioning_;
    private responses_;
    private rootElement_;
    private overlapElement_;
    private inputContainer_;
    private answers_;
    private callback_;
    constructor(id: string, form: Form, callback: any);
    init(): void;
    next_(handler: any): void;
    renderField_(field: FormField): void;
    selectNextField_(currentId: any): FormField;
    transitionContainer_(newEl: HTMLElement): void;
}
