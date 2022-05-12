/// <referance path="base-components.ts"/>

namespace App {
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

            const titleValidatable: Validateble = {
                value: enteredTitle,
                required: true
            }
            const descriptionValidatable: Validateble = {
                value: enteredDescription,
                required: true,
                minLength: 5
            }
            const peopleValidatable: Validateble = {
                value: enteredPeople,
                required: true,
                min: 1,
                max: 5
            }

            if (
                !validate(titleValidatable) ||
                !validate(descriptionValidatable) ||
                !validate(peopleValidatable)
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
}