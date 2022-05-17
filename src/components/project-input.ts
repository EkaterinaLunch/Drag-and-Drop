import { Component } from "./base-component";
import { projectState } from "../state/project-state";
import * as Validation from "../util/validation";

//Product Input Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleIputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleIputElement = this.element.querySelector('#people') as HTMLInputElement;
        
        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    renderContent() {}

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleIputElement.value = '';
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleIputElement.value;

        const titleValidatable: Validation.Validateble = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validation.Validateble = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validation.Validateble = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !Validation.validate(titleValidatable) ||
            !Validation.validate(descriptionValidatable) ||
            !Validation.validate(peopleValidatable)
            ) {
            alert('Invalid value, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, parseInt(enteredPeople)];
        }
    }

    private submitHandler(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement);
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}